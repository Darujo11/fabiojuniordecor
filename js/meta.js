/**
 * Fábio Junior Decor - Pixel da Meta + API de Conversões
 * =======================================================
 *
 * Este arquivo NÃO é carregado direto pelas páginas. Cada página o declara
 * bloqueado, e o js/consent.js só o executa depois que o visitante aceita os
 * cookies de marketing:
 *
 *   <script type="text/plain" data-consent="marketing" data-src="js/meta.js"></script>
 *
 * Cada evento sai duas vezes — pelo pixel no navegador e pelo nosso servidor
 * (POST /api/eventos, serviço infra/capi) — com o MESMO event_id, e a Meta
 * conta uma vez só. O token da API de Conversões mora no servidor; nada aqui
 * é segredo (o Pixel ID é público).
 *
 * Eventos: PageView em toda página; Contact + Lead em todo clique de link
 * wa.me, inclusive os que o app.js monta depois do carregamento.
 */

(function () {
  'use strict';

  var PIXEL_ID = '1054720430886519';
  var ENDPOINT = '/api/eventos';

  if (window.FJDMeta) return;

  /* ---------------------------------------------------------- utilitários */

  function consentido() {
    // Se o visitante revogar pelo "Gerenciar cookies", para de enviar na hora,
    // mesmo com o pixel já carregado nesta página.
    var c = window.FJDConsent && window.FJDConsent.get();
    return !!c && c.indexOf('marketing') !== -1;
  }

  function cookie(nome) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + nome + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : undefined;
  }

  // Mesmo domínio que o fbevents.js usa (.fabiojuniordecor.com.br). Em
  // localhost, só o host.
  function dominioCookie() {
    var partes = window.location.hostname.split('.');
    if (partes.length < 2) return '';
    var n = /\.(com|net|org|gov|edu)\.br$/.test(window.location.hostname) ? 3 : 2;
    return '; domain=.' + partes.slice(-n).join('.');
  }

  function gravarCookie(nome, valor) {
    document.cookie = nome + '=' + valor + '; max-age=' + 90 * 24 * 60 * 60 +
      '; path=/' + dominioCookie() + '; SameSite=Lax';
  }

  // O fbevents.js cria o _fbp e o _fbc depois de baixado, e o PageView sai
  // antes: sem eles a API de Conversões ia sem nenhum ID da Meta. Criamos no
  // formato documentado pela Meta; o pixel reaproveita o que já existe.
  function garantirCookiesMeta() {
    if (!cookie('_fbp')) {
      gravarCookie('_fbp', 'fb.1.' + Date.now() + '.' + Math.floor(1e9 + Math.random() * 9e9));
    }
    var m = window.location.search.match(/[?&]fbclid=([^&]+)/);
    var fbclid = m ? decodeURIComponent(m[1]) : null;
    var atual = cookie('_fbc');
    // _fbc é sensível a maiúsculas: o fbclid vai como veio
    if (fbclid && !(atual && atual.indexOf(fbclid) !== -1)) {
      gravarCookie('_fbc', 'fb.1.' + Date.now() + '.' + fbclid);
    }
  }

  // external_id: ID aleatório deste navegador (não é dado pessoal), o mesmo
  // no pixel e no servidor. Já tem formato de SHA-256, ninguém o re-hasheia.
  function idVisitante() {
    var atual = cookie('fjd_vid');
    if (atual && /^[0-9a-f]{64}$/.test(atual)) return atual;
    var bytes = window.crypto.getRandomValues(new Uint8Array(32));
    var novo = Array.prototype.map.call(bytes, function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
    gravarCookie('fjd_vid', novo);
    return novo;
  }

  function novoEventId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }

  /* ---------------------------------------------------------------- pixel */

  // Equivalente ao snippet oficial da Meta.
  function carregarPixel() {
    if (window.fbq) return;
    var fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);

    fbq('init', PIXEL_ID, { external_id: externalId });
  }

  /* --------------------------------------------------------------- servidor */

  function enviarParaServidor(nome, eventId) {
    var corpo = JSON.stringify({
      event_name: nome,
      event_id: eventId,
      event_source_url: window.location.origin + window.location.pathname,
      referrer_url: document.referrer || undefined,
      fbp: cookie('_fbp'),
      fbc: cookie('_fbc'),
      external_id: externalId
    });
    var blob = new Blob([corpo], { type: 'application/json' });
    // sendBeacon sobrevive à troca de aba do clique no WhatsApp; fetch com
    // keepalive é o plano B onde o beacon não existe ou recusa.
    var foi = false;
    try {
      foi = !!(navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob));
    } catch (e) {
      foi = false;
    }
    if (!foi && window.fetch) {
      window.fetch(ENDPOINT, { method: 'POST', body: blob, keepalive: true }).catch(function () {});
    }
  }

  function rastrear(nome) {
    if (!consentido()) return;
    var eventId = novoEventId();
    window.fbq('track', nome, {}, { eventID: eventId });
    enviarParaServidor(nome, eventId);
  }

  /* ---------------------------------------------------------------- início */

  garantirCookiesMeta();
  var externalId = idVisitante();
  carregarPixel();
  rastrear('PageView');

  // Delegação no documento: pega todo link de WhatsApp, inclusive os que o
  // app.js e companhia inserem depois, sem marcar botão por botão.
  document.addEventListener(
    'click',
    function (e) {
      var alvo = e.target;
      if (alvo && alvo.closest && alvo.closest('a[href^="https://wa.me/"]')) {
        // Os dois de propósito: Contact descreve o clique, Lead é o que as
        // campanhas costumam otimizar. Cada um com o próprio event_id — a
        // deduplicação da Meta é por nome + id.
        rastrear('Contact');
        rastrear('Lead');
      }
    },
    true
  );

  window.FJDMeta = { rastrear: rastrear };
})();
