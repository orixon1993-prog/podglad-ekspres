/* Wspolne: dane i drobne efekty. Bez bibliotek. */
var UP = 'https://ekspresowy-serwis.pl/wp-content/uploads/';
var PH = {
  mlynek: UP + '2021/12/IMG_20210211_152110-1024x768.jpg',
  wnetrze: UP + '2021/12/IMG_20200505_093623-1024x768.jpg',
  czesci: UP + '2021/12/IMG_20191017_132245-1024x768.jpg',
  zaparzacz: UP + '2021/12/52384620_387514675370550_8007074402850045952_n-1024x768.jpg',
  zaparzacz2: UP + '2019/10/52917284_2318521521521072_3112651443241222144_n-1024x768.jpg',
  zaparzacz3: UP + '2019/08/52523794_1225254947629170_997342297198690304_n-1024x768.jpg',
  kable: UP + '2019/08/DSC_0577-1024x683.jpg',
  weze: UP + '2019/08/42164694_535508580278749_6122016447796346880_n-1024x768.jpg',
  rama: UP + '2022/12/8242628200_1485368215-768x1024.jpg',
  bojler: UP + '2022/12/1129627000_1512512308-768x1024.jpg',
  uszczelka: UP + '2021/12/IMG_20210226_104114-768x1024.jpg',
  silnik: UP + '2021/12/IMG_20200324_175150-768x1024.jpg',
  kamien: UP + '2019/08/jura-nie-spienia-mleka-768x1024.jpg',
  kamien2: UP + '2019/08/naprawa-ekspres%C3%B3w-1-768x1024.jpg',
  grupa: UP + '2019/08/40053788_293743561412421_5774242358744842240_n-768x1024.jpg'
};
var REVIEWS = [
  ['Serwis jest w pełni profesjonalny. Części na miejscu. Znają się na rzeczy.', 'Radosław Karczewski'],
  ['Naprawiałem ekspres Saeco. Wszystko sprawnie i szybko. Właściciel wszystko wyjaśnił.', 'Marcin Denuszek'],
  ['Tanio, ale profesjonalnie. Świetny kontakt. Rzeczowa diagnostyka i wycena.', 'Zbyszek Chmielewski'],
  ['Polecam! Ekspres wrócił do domu jak nowy! Kawa smakuje obłędnie i spienia idealnie mleko.', 'Joanna Żbikowska'],
  ['Serwis godny polecenia: szybka diagnostyka i naprawa, brak problemów z kontaktem.', 'Adrian Szczerba'],
  ['Bardzo pomocni fachowcy. Ekspresowa robota.', 'Izabela Skorupka']
];
var BRANDS = ['Saeco', 'DeLonghi', 'Jura', 'Siemens', 'Philips', 'Krups', 'Melitta', 'Bosch', 'Nivona', 'Gaggia', 'La Cimbali'];
var CASES = [
  { k: 'Zaparzacz', s: 'Ekspres miele kawę, ale napar nie wypływa albo lecą tylko krople.', d: 'Sprawdzamy blokady zaparzacza, uszczelki i ciśnienie.', p: PH.zaparzacz3 },
  { k: 'Młynek', s: 'Młynek pracuje zbyt głośno, zacina się albo ekspres pokazuje błąd ziaren.', d: 'Regulujemy mielenie, czyścimy mechanizm, sprawdzamy napęd.', p: PH.mlynek },
  { k: 'Układ wodny', s: 'Pod urządzeniem zbiera się woda, a tacka napełnia się szybciej niż zwykle.', d: 'Szukamy nieszczelności w wężach, zaworach i pompie.', p: PH.weze },
  { k: 'Kamień', s: 'Na panelu wracają komunikaty o odkamienianiu, kawa jest chłodna.', d: 'Usuwamy osady z obiegu wody i sprawdzamy przepływ.', p: PH.kamien },
  { k: 'Spieniacz', s: 'System mleczny nie zasysa mleka, pieni nierówno albo przerywa pracę.', d: 'Naprawiamy dysze, zawory i moduł mleczny.', p: PH.uszczelka },
  { k: 'Elektronika', s: 'Ekspres nie startuje albo wyświetla błąd, którego nie da się skasować.', d: 'Analizujemy czujniki, płytki sterujące i przewody.', p: PH.kable }
];

function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function span(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var SMALL = window.matchMedia('(max-width: 860px)').matches;

/* naglowek, stopka i marki z jednego miejsca */
function chrome() {
  var ic = '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>';
  var t = $('#top');
  if (t) {
    t.className = 'top';
    t.innerHTML = '<div class="wrap top__in"><a class="top__logo" href="#" aria-label="Ekspresowy Serwis"><img src="' + UP + '2020/04/cropped-Logo8-192x192.png" alt="Ekspresowy Serwis"></a>' +
      '<nav class="top__nav"><a href="#">Serwis ekspresów</a><a href="#">Marki</a><a href="#">Blog</a><a href="#">FAQ</a><a href="#">O nas</a><a href="#">Kontakt</a></nav>' +
      '<a class="top__tel" href="tel:+48576138837"><span class="top__ic">' + ic + '</span><span class="top__t">Zamów serwis<b>+48 576 138 837</b></span></a></div><i class="top__bar"></i>';
  }
  var f = $('#foot');
  if (f) {
    f.className = 'foot sec';
    f.innerHTML = '<div class="wrap foot__g"><div><span class="kick">Kontakt</span><h2 style="margin-top:.8rem">Opisz usterkę.<br>Resztą zajmiemy się my.</h2>' +
      '<a class="foot__tel" href="tel:+48576138837">576 138 837</a><div class="cta"><a class="btn" href="#">Zamów odbiór ekspresu</a><a class="btn btn--ghost" href="#">Formularz kontaktowy</a></div></div>' +
      '<div class="foot__d"><div><b>Warsztat</b>ul. Polnej Róży 2/4, 02-798 Warszawa (Ursynów)</div><div><b>Godziny</b>Pn–Pt 9:00–18:00</div><div><b>E-mail</b>info@ekspresowy-serwis.pl</div></div></div>';
  }
  $$('[data-marki]').forEach(function (el) {
    var row = BRANDS.concat(BRANDS).map(function (b) { return '<span>' + b + '</span>'; }).join('');
    el.className = 'mq';
    el.setAttribute('aria-label', 'Marki: ' + BRANDS.join(', '));
    el.innerHTML = '<div class="mq__t" aria-hidden="true">' + row + '</div>';
  });
  if (!$('.mob')) {
    var m = document.createElement('div');
    m.className = 'mob';
    m.innerHTML = '<a href="tel:+48576138837">Zadzwoń</a><a href="#">Zamów odbiór</a>';
    document.body.appendChild(m);
  }
}

function reveal() {
  if (REDUCED || !('IntersectionObserver' in window)) {
    $$('[data-up],.lines').forEach(function (e) { e.classList.add('on'); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    });
  }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  $$('[data-up],.lines').forEach(function (e) { io.observe(e); });
}

/* przycisk delikatnie idzie za kursorem */
function magnets() {
  if (SMALL || REDUCED) return;
  $$('.btn').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .22) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3) + 'px)';
    });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  });
}

/* petla przewijania: fn(y, vh) */
var tasks = [];
function onScroll(fn) { tasks.push(fn); }
function loop() {
  var ticking = false;
  function run() {
    ticking = false;
    var y = window.pageYOffset, vh = window.innerHeight, d = document.documentElement.scrollHeight - vh;
    var bar = $('.top__bar');
    if (bar) bar.style.transform = 'scaleX(' + (d > 0 ? y / d : 0) + ')';
    tasks.forEach(function (f) { f(y, vh); });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(run); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  run();
}
/* postep sekcji przypietej 0..1 */
function pinProgress(el, y, vh) {
  var r = el.getBoundingClientRect(), top = r.top + y, h = el.offsetHeight - vh;
  return h > 0 ? clamp((y - top) / h, 0, 1) : 0;
}
function start() { chrome(); reveal(); magnets(); if (window.page) window.page(); loop(); }
if (document.readyState !== 'loading') start(); else document.addEventListener('DOMContentLoaded', start);
