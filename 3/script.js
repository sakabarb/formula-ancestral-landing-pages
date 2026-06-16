/* A Fórmula Ancestral do Solo — LP 3 (carta / história)
   CTA sticky: aparece depois do banner de abertura e some no fechamento. */
(function () {
  'use strict';

  var sticky = document.getElementById('stickyCta');
  var hero = document.querySelector('.lhero');
  var finalCta = document.querySelector('.chap--closing');
  if (!sticky || !hero) return;

  // Cola a barra no fundo do viewport VISÍVEL (corrige o vão do iOS Safari
  // quando a barra de ferramentas inferior recolhe/aparece).
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

  var pastHero = false;   // já passou do banner de abertura?
  var atFinal = false;    // chegou no fechamento? (não cobrir o último botão)

  function render() {
    var show = pastHero && !atFinal;
    sticky.classList.toggle('is-visible', show);
    sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
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
    window.addEventListener('scroll', function () {
      pastHero = window.pageYOffset > (hero.offsetHeight * 0.6);
      if (finalCta) {
        atFinal = window.pageYOffset + window.innerHeight >= finalCta.offsetTop + 60;
      }
      render();
    }, { passive: true });
  }
})();
