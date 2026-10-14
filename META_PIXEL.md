# Pixel da Meta + API de Conversões

Instalado em 14/10/2026. Pixel ID `1054720430886519` (público).

## Como funciona

- **Consentimento primeiro (LGPD).** Toda página declara o pixel bloqueado:
  `<script type="text/plain" data-consent="marketing" data-src="js/meta.js">`.
  O `js/consent.js` mostra o banner e só executa o `js/meta.js` depois do
  "Aceitar cookies". "Somente essenciais" fica lembrado por 12 meses. O link
  "Gerenciar minhas preferências de cookies" (política, seção 4) reabre o
  banner; ao revogar, os eventos param na hora.
- **Eventos.** `PageView` em toda página; `Contact` + `Lead` em todo clique de
  link `https://wa.me/...` (delegação no documento, pega os links que o
  `app.js` monta).
- **Dois caminhos, mesmo `event_id`.** O pixel manda do navegador; o
  `js/meta.js` manda o mesmo evento para `/api/eventos`, onde o serviço
  `capi` (`infra/capi/server.mjs`, Node sem dependências) acrescenta IP e user
  agent e repassa à Graph API com o token. A Meta deduplica.
- **Proteções do `capi`.** Só aceita `Origin: https://fabiojuniordecor.com.br`,
  eventos `PageView`/`Contact`/`Lead`, corpo ≤ 4 KB, 60 req/min por IP.
- **Roteamento.** Router Traefik `fabiojuniordecor-capi` com
  `PathPrefix(/api/eventos)` e prioridade 30 (o site usa 10 e 20).
  O nginx do site nunca vê `/api/eventos`.

## Onde está o token

Só no Docker secret `fabiojuniordecor_meta_capi_token` na VPS (montado no
container como `/run/secrets/meta_capi_token`). **Nunca** no repositório,
em variável do `stack.yml` ou em arquivo do site.

## Publicar (na VPS)

```bash
# 1. só na primeira vez: criar o secret (cole o token quando o cursor parar; não aparece na tela)
read -rs T && printf %s "$T" | docker secret create fabiojuniordecor_meta_capi_token - && unset T

# 2. a cada deploy
cd /var/www/fabiojuniordecor && git pull
docker build -t fabiojuniordecor:latest .
docker build -t fabiojuniordecor-capi:latest infra/capi
docker stack deploy -c stack.yml --resolve-image never fabiojuniordecor
docker service update --force fabiojuniordecor_web
docker service update --force fabiojuniordecor_capi
```

## Conferir

```bash
curl -s https://fabiojuniordecor.com.br/api/eventos/healthz        # fabiojuniordecor-capi ok
docker service logs fabiojuniordecor_capi --tail 20                 # na VPS
```

- `enviado PageView/Contact/Lead` → a Meta aceitou.
- `meta recusou ... 190` / `OAuthException` → token errado ou expirado.
- `recusado: origem '...'` → alguém (ou um teste) postou de fora do site.

## Trocar o token

Secret do Swarm é imutável. Crie `fabiojuniordecor_meta_capi_token_v2`, troque
o `source:` e o bloco `secrets:` do `stack.yml`, rode o `docker stack deploy`
e depois `docker secret rm fabiojuniordecor_meta_capi_token`.

## Modo de teste da Meta

Faz os eventos do servidor aparecerem em "Eventos de teste" (e deixarem de
contar como reais enquanto ligado):

```bash
docker service update --env-add META_TEST_EVENT_CODE=TESTxxxx fabiojuniordecor_capi
docker service update --env-rm META_TEST_EVENT_CODE fabiojuniordecor_capi   # desligar
```
