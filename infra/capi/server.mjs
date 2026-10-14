#!/usr/bin/env node
/**
 * API de Conversões da Meta (CAPI) do site fabiojuniordecor.com.br.
 *
 * O navegador manda o evento para cá (POST /api/eventos) depois que o
 * visitante aceitou os cookies; este serviço acrescenta IP e user agent e
 * repassa para a Graph API com o token, que nunca chega ao navegador.
 * O pixel dispara o mesmo evento com o mesmo event_id — a Meta deduplica.
 *
 * Decisões que parecem detalhe e não são:
 *
 * - O token vem de um Docker secret (/run/secrets/meta_capi_token), não de
 *   variável no stack file: `docker service inspect` mostraria a variável
 *   para qualquer um com acesso ao docker do servidor compartilhado.
 * - O token vai no CORPO do POST para a Meta, não na query string. URL vai
 *   parar em log; corpo não.
 * - Responde 204 ANTES de falar com a Meta. O navegador manda via
 *   sendBeacon e não espera resposta; segurar a conexão só ocuparia socket.
 * - Só aceita eventos da lista, vindos da origem do site, com corpo pequeno
 *   e com teto de requisições por IP. Sem isso, qualquer um na internet
 *   poderia inflar as conversões da conta de anúncios.
 * - Todo caminho de falha registra no log. Um 4xx silencioso já custou uma
 *   investigação inteira no projeto agenciafvx.
 */

import http from "http";
import { readFileSync, existsSync } from "fs";

const PORTA = Number(process.env.PORT || 8081);
const PIXEL_ID = process.env.META_PIXEL_ID || "1054720430886519";
const VERSAO_GRAPH = process.env.META_GRAPH_VERSION || "v21.0";
const ORIGEM = process.env.SITE_ORIGIN || "https://fabiojuniordecor.com.br";
// Só durante os testes: faz os eventos aparecerem em "Eventos de teste" no
// Gerenciador de Eventos em vez de contarem como reais.
const CODIGO_TESTE = process.env.META_TEST_EVENT_CODE || "";

const EVENTOS_PERMITIDOS = new Set(["PageView", "Contact", "Lead"]);
const TETO_CORPO = 4096;
const TETO_POR_MINUTO = 60;
const IDENTIDADE = "fabiojuniordecor-capi ok";

function log(...partes) {
  console.log(new Date().toISOString(), ...partes);
}

function lerToken() {
  const arquivo = process.env.META_CAPI_TOKEN_FILE || "/run/secrets/meta_capi_token";
  if (existsSync(arquivo)) return readFileSync(arquivo, "utf8").trim();
  return (process.env.META_CAPI_TOKEN || "").trim();
}

const TOKEN = lerToken();
if (!TOKEN) {
  log("ERRO: token da CAPI ausente (secret meta_capi_token ou META_CAPI_TOKEN)");
  process.exit(1);
}

// Janela fixa de um minuto por IP. Memória limitada: o mapa zera a cada
// janela, então não cresce além dos IPs vistos em 60s.
let janela = Date.now();
const contagem = new Map();
function estourouLimite(ip) {
  const agora = Date.now();
  if (agora - janela > 60_000) {
    janela = agora;
    contagem.clear();
  }
  const n = (contagem.get(ip) || 0) + 1;
  contagem.set(ip, n);
  return n > TETO_POR_MINUTO;
}

// O Traefik põe o IP do cliente em X-Real-Ip. O X-Forwarded-For fica de
// reserva, e só a primeira entrada interessa.
function ipDoCliente(req) {
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real) return real.trim();
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff) return xff.split(",")[0].trim();
  return req.socket.remoteAddress || "";
}

function texto(v, max) {
  return typeof v === "string" && v.length > 0 && v.length <= max ? v : undefined;
}

// Valida o que veio do navegador. Nada aqui é confiável: o corpo é montado
// pelo cliente.
function validar(dados) {
  if (!dados || typeof dados !== "object") return "corpo não é objeto";
  if (!EVENTOS_PERMITIDOS.has(dados.event_name)) return `evento fora da lista: ${dados.event_name}`;
  if (!/^[A-Za-z0-9-]{8,64}$/.test(dados.event_id || "")) return "event_id inválido";
  const url = texto(dados.event_source_url, 2048);
  if (!url || !(url === ORIGEM || url.startsWith(ORIGEM + "/")))
    return "event_source_url de outra origem";
  return null;
}

async function enviarParaMeta(dados, ip, userAgent) {
  const corpo = {
    data: [
      {
        event_name: dados.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: dados.event_id,
        event_source_url: dados.event_source_url,
        action_source: "website",
        user_data: {
          client_ip_address: ip || undefined,
          client_user_agent: userAgent || undefined,
          fbp: texto(dados.fbp, 256),
          fbc: texto(dados.fbc, 512),
        },
      },
    ],
    access_token: TOKEN,
    ...(CODIGO_TESTE ? { test_event_code: CODIGO_TESTE } : {}),
  };

  const url = `https://graph.facebook.com/${VERSAO_GRAPH}/${PIXEL_ID}/events`;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) {
      const resposta = await r.text().catch(() => "");
      log(
        `meta recusou ${dados.event_name} ${dados.event_id}: ${r.status} ${resposta.slice(0, 500)}`,
      );
      return;
    }
    log(`enviado ${dados.event_name} ${dados.event_id}`);
  } catch (e) {
    log(`falha ao falar com a meta (${dados.event_name} ${dados.event_id}): ${e.message}`);
  }
}

function responder(res, status, corpo = "") {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(corpo);
}

const servidor = http.createServer((req, res) => {
  const caminho = (req.url || "").split("?")[0];

  // Sonda do HEALTHCHECK e do deploy. Carrega identidade de propósito: um 200
  // qualquer não prova que é este serviço respondendo.
  if (req.method === "GET" && (caminho === "/healthz" || caminho === "/api/eventos/healthz")) {
    return responder(res, 200, IDENTIDADE + "\n");
  }

  if (caminho !== "/api/eventos") return responder(res, 404);
  if (req.method !== "POST") return responder(res, 405);

  const ip = ipDoCliente(req);

  // Navegadores mandam Origin em todo POST. Sem ele, ou com outro, não é o site.
  if (req.headers.origin !== ORIGEM) {
    log(`recusado: origem '${req.headers.origin || "<sem origin>"}' de ${ip}`);
    return responder(res, 403);
  }

  if (estourouLimite(ip)) {
    log(`recusado: limite por minuto estourado por ${ip}`);
    return responder(res, 429);
  }

  // O teto vem ANTES de interpretar o corpo: um POST infinito não pode
  // derrubar o processo.
  let tamanho = 0;
  const pedacos = [];
  let abortado = false;
  req.on("data", (pedaco) => {
    if (abortado) return;
    tamanho += pedaco.length;
    if (tamanho > TETO_CORPO) {
      abortado = true;
      log(`recusado: corpo acima de ${TETO_CORPO} bytes de ${ip}`);
      responder(res, 413);
      req.destroy();
      return;
    }
    pedacos.push(pedaco);
  });

  req.on("end", () => {
    if (abortado) return;
    let dados;
    try {
      dados = JSON.parse(Buffer.concat(pedacos).toString("utf8"));
    } catch {
      log(`recusado: JSON inválido de ${ip}`);
      return responder(res, 400);
    }

    const erro = validar(dados);
    if (erro) {
      log(`recusado: ${erro} (de ${ip})`);
      return responder(res, 400);
    }

    responder(res, 204);
    enviarParaMeta(dados, ip, req.headers["user-agent"]);
  });
});

servidor.listen(PORTA, () => {
  log(
    `capi ouvindo na porta ${PORTA}, pixel ${PIXEL_ID}, graph ${VERSAO_GRAPH}` +
      (CODIGO_TESTE ? `, MODO TESTE (${CODIGO_TESTE})` : ""),
  );
});

for (const sinal of ["SIGTERM", "SIGINT"]) {
  process.on(sinal, () => servidor.close(() => process.exit(0)));
}
