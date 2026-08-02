/**
 * Fábio Junior Decor - Consentimento de cookies (LGPD)
 * =====================================================
 *
 * COMO ATIVAR (hoje o banner fica dormente de propósito):
 *
 * 1. Inclua este arquivo em todas as páginas, antes do </body>:
 *      <script src="js/consent.js"></script>
 *
 * 2. Declare cada script de rastreamento em modo BLOQUEADO — repare no
 *    type="text/plain", que impede o navegador de executá-lo:
 *
 *      <script type="text/plain" data-consent="analytics"
 *              data-src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
 *
 *      <script type="text/plain" data-consent="analytics">
 *        window.dataLayer = window.dataLayer || [];
 *        function gtag(){dataLayer.push(arguments);}
 *        gtag('js', new Date());
 *        gtag('config', 'G-XXXX');
 *      </script>
 *
 *    Categorias aceitas em data-consent: "analytics" e "marketing".
 *
 * 3. Pronto. O banner aparece sozinho porque existe script bloqueado na página,
 *    e os scripts só são executados depois do aceite. Enquanto não houver nenhum
 *    script bloqueado, o visitante não vê banner nenhum.
 *
 * Para reabrir as preferências (link "Gerenciar cookies"), use um elemento com
 * o atributo data-consent-open — ele fica oculto enquanto o banner está dormente.
 *
 * A decisão é guardada em localStorage por 12 meses e pode ser revogada a
 * qualquer momento, como exige o art. 8º, §5º da LGPD.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'fjd_consent_v1';
  var MAX_AGE_DAYS = 365;
  var POLICY_URL = '/politica-privacidade';

  /* ---------------------------------------------------------------- estado */

  function read() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var ageDays = (Date.now() - data.at) / 86400000;
      return ageDays > MAX_AGE_DAYS ? null : data;
    } catch (e) {
      return null;
    }
  }

  function save(categories) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ at: Date.now(), categories: categories })
      );
    } catch (e) {
      /* navegação privada: a decisão vale só para esta sessão */
    }
  }

  /* ------------------------------------------------- liberação dos scripts */

  function blockedScripts() {
    return [].slice.call(document.querySelectorAll('script[type="text/plain"][data-consent]'));
  }

  function unblock(categories) {
    blockedScripts().forEach(function (node) {
      if (categories.indexOf(node.getAttribute('data-consent')) === -1) return;

      var script = document.createElement('script');
      for (var i = 0; i < node.attributes.length; i++) {
        var attr = node.attributes[i];
        if (attr.name === 'type' || attr.name === 'data-consent' || attr.name === 'data-src') continue;
        script.setAttribute(attr.name, attr.value);
      }
      if (node.getAttribute('data-src')) script.src = node.getAttribute('data-src');
      else script.text = node.textContent;

      node.parentNode.insertBefore(script, node.nextSibling);
      node.setAttribute('data-consent-loaded', 'true');
      node.removeAttribute('data-consent');
    });
  }

  /* ------------------------------------------------------------------- CSS */

  function injectStyles() {
    if (document.getElementById('fjd-consent-styles')) return;
    var css =
      '.fjd-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:1000;' +
      'max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #E9E0DA;' +
      'border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.18);padding:22px 24px;' +
      'transform:translateY(24px);opacity:0;transition:transform .3s cubic-bezier(.4,0,.2,1),opacity .3s;' +
      'font-family:"Plus Jakarta Sans","PT Sans Narrow",sans-serif}' +
      '.fjd-consent.is-visible{transform:none;opacity:1}' +
      '.fjd-consent h2{font-family:"Cinzel","PT Sans Narrow",serif;font-size:17px;font-weight:700;' +
      'color:#111111;margin:0 0 8px;line-height:1.3}' +
      '.fjd-consent p{font-size:14.5px;line-height:1.6;color:#555;margin:0}' +
      '.fjd-consent p a{color:#906545;font-weight:600;text-decoration:underline;text-underline-offset:3px}' +
      '.fjd-consent-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}' +
      '.fjd-consent button{font-family:inherit;font-size:14.5px;font-weight:700;border:none;' +
      'border-radius:8px;padding:12px 20px;cursor:pointer;transition:all .2s ease}' +
      '.fjd-consent .fjd-accept{background:#25D366;color:#fff;box-shadow:0 4px 12px rgba(37,211,102,.3);flex:1 1 auto}' +
      '.fjd-consent .fjd-accept:hover{background:#1EBE5D;transform:translateY(-1px)}' +
      '.fjd-consent .fjd-reject{background:#F9F5EC;color:#906545;border:1px solid #E9E0DA;flex:1 1 auto}' +
      '.fjd-consent .fjd-reject:hover{background:#F3EDE0}' +
      '@media(max-width:520px){.fjd-consent{padding:18px 18px 20px;left:10px;right:10px;bottom:10px}' +
      '.fjd-consent-actions{flex-direction:column-reverse}}' +
      '@media(prefers-reduced-motion:reduce){.fjd-consent{transition-duration:.01ms}}';

    var style = document.createElement('style');
    style.id = 'fjd-consent-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ----------------------------------------------------------------- banner */

  var banner = null;

  function close() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    window.setTimeout(function () {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      banner = null;
    }, 300);
  }

  function decide(categories) {
    save(categories);
    unblock(categories);
    close();
  }

  function open() {
    if (banner) return;
    injectStyles();

    banner = document.createElement('aside');
    banner.className = 'fjd-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'fjd-consent-title');
    banner.innerHTML =
      '<h2 id="fjd-consent-title">Podemos usar cookies de análise?</h2>' +
      '<p>Eles nos ajudam a entender quais coleções despertam mais interesse e a melhorar o site. ' +
      'Nada disso é necessário para navegar — você decide. Detalhes na ' +
      '<a href="' + POLICY_URL + '">Política de Privacidade</a>.</p>' +
      '<div class="fjd-consent-actions">' +
      '<button type="button" class="fjd-reject">Somente essenciais</button>' +
      '<button type="button" class="fjd-accept">Aceitar cookies</button>' +
      '</div>';

    document.body.appendChild(banner);
    window.requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });

    banner.querySelector('.fjd-accept').addEventListener('click', function () {
      decide(['analytics', 'marketing']);
    });
    banner.querySelector('.fjd-reject').addEventListener('click', function () {
      decide([]);
    });
  }

  /* -------------------------------------------------------------- inicial */

  function init() {
    var hasBlocked = blockedScripts().length > 0;
    var stored = read();

    // Link/botão "Gerenciar cookies" só faz sentido quando há o que gerenciar
    [].slice.call(document.querySelectorAll('[data-consent-open]')).forEach(function (el) {
      if (!hasBlocked && !stored) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      el.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });

    if (stored) {
      unblock(stored.categories || []);
      return;
    }

    // Sem script de rastreamento na página, não há consentimento a pedir.
    if (hasBlocked) open();
  }

  window.FJDConsent = {
    open: open,
    get: function () {
      var s = read();
      return s ? s.categories : null;
    },
    revoke: function () {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      open();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
