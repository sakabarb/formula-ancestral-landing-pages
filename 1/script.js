/* A Fórmula Ancestral do Solo — Advertorial (Landing 1)
   CTA sticky que aparece após a 1ª dobra e some perto da oferta final. */
(function () {
  'use strict';

  var sticky = document.getElementById('stickyCta');
  var hero = document.querySelector('.hero');
  var finalCta = document.querySelector('.section--final');
  if (!sticky || !hero) return;

  // Cola a barra no fundo do viewport VISÍVEL. No iOS Safari, o viewport de
  // layout usado por position:fixed difere do visível quando a barra de
  // ferramentas inferior recolhe/aparece — isso deixava um vão abaixo da barra.
  var vv = window.visualViewport;
  if (vv) {
    var pinBottom = function () {
      var off = Math.round(window.innerHeight - vv.height - vv.offsetTop);
      if (off > 160) off = 160; else if (off < -160) off = -160;
      if (off > -2 && off < 2) off = 0;
      sticky.style.bottom = off + 'px';
    };
    vv.addEventListener('resize', pinBottom);
    vv.addEventListener('scroll', pinBottom);
    window.addEventListener('scroll', pinBottom, { passive: true });
    pinBottom();
  }

  var pastHero = false;   // já passou da dobra inicial?
  var atFinal = false;    // está na oferta final? (evita cobrir o botão)

  function render() {
    var show = pastHero && !atFinal;
    sticky.classList.toggle('is-visible', show);
    sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      // hero visível => antes da dobra; hero fora => já passou
      pastHero = !entries[0].isIntersecting;
      render();
    }, { rootMargin: '-40% 0px 0px 0px' }).observe(hero);

    if (finalCta) {
      new IntersectionObserver(function (entries) {
        atFinal = entries[0].isIntersecting;
        render();
      }, { rootMargin: '0px 0px -10% 0px' }).observe(finalCta);
    }
  } else {
    // Fallback simples por scroll
    window.addEventListener('scroll', function () {
      pastHero = window.pageYOffset > (hero.offsetHeight * 0.6);
      if (finalCta) {
        atFinal = window.pageYOffset + window.innerHeight >= finalCta.offsetTop + 60;
      }
      render();
    }, { passive: true });
  }
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
