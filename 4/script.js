/* =========================================================
   A Fórmula Ancestral do Solo — LP 4 (VSL)
   Revela o botão de CTA quando o vídeo chega a 90%.

   São DOIS mecanismos rodando em paralelo (o primeiro que
   disparar revela o botão; o outro é ignorado):
     1) API do Panda Video (timing preciso, via SDK api.v2.js)
     2) TIMER de segurança (fallback que SEMPRE dispara, mesmo
        que a API do Panda falhe, não carregue ou seja bloqueada)

   >>> AJUSTES RÁPIDOS (edite aqui) <<<
   ========================================================= */
var VIDEO_DURATION_SECONDS = 155;   // duração real do vídeo em segundos (medida: 154,85s)
var REVEAL_AT = 0.90;               // revela o botão quando o vídeo atinge 90%
var PANDA_PLAYER_ID = 'panda-cb35efca-246d-44ff-b13a-8133d4351ea4'; // id do <iframe> do Panda

// Timer de segurança = 90% da duração (em ms). SEMPRE revela o botão,
// mesmo que a API do Panda nunca responda.
var FALLBACK_MS = VIDEO_DURATION_SECONDS * REVEAL_AT * 1000;
/* ========================================================= */

(function () {
  'use strict';

  var revealed = false;

  // Revela o botão (idempotente — só age na primeira chamada).
  function revealButton() {
    if (revealed) return;
    revealed = true;
    var el = document.getElementById('ctaReveal');
    if (!el) return;
    el.hidden = false;
    el.classList.add('is-visible');
    el.setAttribute('aria-hidden', 'false');
  }

  // ---- MÉTODO 2: timer de segurança (garantia — nunca falha) ----
  // Disparado a partir do carregamento da página. Mesmo que a API do
  // Panda não funcione, o botão aparece aqui.
  setTimeout(revealButton, FALLBACK_MS);

  // ---- MÉTODO 1: API do Panda Video (preciso, quando disponível) ----
  // Verifica o progresso real do player e revela em REVEAL_AT (90%).
  // Tudo protegido por try/catch: se a API falhar, o método 2 cobre.
  function progressReached(currentTime, duration) {
    var dur = (typeof duration === 'number' && duration > 0) ? duration : VIDEO_DURATION_SECONDS;
    return typeof currentTime === 'number' && dur > 0 && (currentTime / dur) >= REVEAL_AT;
  }

  // 1a) SDK oficial (api.v2.js usa a fila window.pandascripttag).
  window.pandascripttag = window.pandascripttag || [];
  window.pandascripttag.push(function () {
    try {
      var player = new PandaPlayer(PANDA_PLAYER_ID, {
        onReady: function () {},
        onEvent: function (e) {
          try {
            if (!e) return;
            // fim do vídeo => revela
            if (e.message === 'panda_ended') { revealButton(); return; }
            // atualização de tempo => checa 90%
            if (e.message === 'panda_timeupdate' && !e.isMutedIndicator) {
              var dur;
              try { dur = (player && typeof player.getDuration === 'function') ? player.getDuration() : 0; } catch (_) { dur = 0; }
              if (progressReached(e.currentTime, dur)) revealButton();
            }
          } catch (_) { /* silencioso: o timer cobre */ }
        }
      });
    } catch (_) { /* SDK indisponível: o timer cobre */ }
  });

  // 1b) Reforço: escuta postMessage cru do player (caso o SDK não
  //     instancie, mas as mensagens do iframe cheguem ao window).
  window.addEventListener('message', function (ev) {
    try {
      var data = ev.data;
      if (typeof data === 'string') {
        // alguns players mandam string JSON
        if (data.indexOf('panda') === -1) return;
        try { data = JSON.parse(data); } catch (_) { return; }
      }
      if (!data || typeof data !== 'object') return;
      if (data.message === 'panda_ended') { revealButton(); return; }
      if (data.message === 'panda_timeupdate' && !data.isMutedIndicator) {
        if (progressReached(data.currentTime, data.duration)) revealButton();
      }
    } catch (_) { /* silencioso */ }
  }, false);
})();


/* =========================================================
   Tracking — repasse de UTMs/parametros de campanha ao checkout
   Captura os parametros de origem da URL (Facebook/Meta, Google Ads,
   Google Analytics e TikTok Ads) e os anexa ao link da Hotmart no clique.
   (InitiateCheckout/Purchase sao marcados pelo Pixel instalado na Hotmart.)
   ========================================================= */
(function () {
  'use strict';

  // Parametros de atribuicao repassados ao checkout.
  var TRACK_KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
    'fbclid',                    // Facebook / Meta Ads
    'gclid', 'gbraid', 'wbraid', // Google Ads
    'ttclid',                    // TikTok Ads
    'src', 'sck'                 // codigos de rastreio nativos da Hotmart
  ];

  var incoming = new URLSearchParams(window.location.search);
  var carried = new URLSearchParams();
  TRACK_KEYS.forEach(function (k) {
    var v = incoming.get(k);
    if (v) carried.set(k, v);
  });

  function withTracking(url) {
    if (!carried.toString()) return url;
    try {
      var u = new URL(url, window.location.href);
      carried.forEach(function (v, k) {
        if (!u.searchParams.has(k)) u.searchParams.set(k, v);
      });
      return u.toString();
    } catch (_) {
      return url;
    }
  }

  var links = document.querySelectorAll('a[href*="pay.hotmart.com"]');
  Array.prototype.forEach.call(links, function (a) {
    a.href = withTracking(a.href);
  });
})();
