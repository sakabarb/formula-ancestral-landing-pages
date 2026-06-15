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
