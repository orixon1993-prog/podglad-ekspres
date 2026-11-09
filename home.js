/* Strona glowna, wersja 3 */
window.page = function () {
  var HINT = {"Pojemnik na ziarna": "wilgoć, stare ziarna", "Zbiornik wody": "nieszczelne gniazdo", "Młynek": "zużyte żarna", "Zaparzacz": "uszczelki, blokady", "Termoblok": "kamień, grzałka", "Pompa": "spadek ciśnienia", "Elektronika": "błędy, czujniki", "Wylewka": "zatkane dysze", "Tacka": "czujnik poziomu"};
  /* film z klatek: przenikanie miedzy klatkami i bufor gotowych obrazow wokol biezacej pozycji */
  var F = window.FILM, STEP = SMALL ? 2 : 1, dir = SMALL ? 'film/m/' : 'film/d/';
  var M = Math.floor((F.n - 1) / STEP) + 1, imgs = new Array(M), hot = new Array(M), wait = {};
  var c = $('#fc'), g = c.getContext('2d', { alpha: false }), fig = $('#ex'), box = $('#fm'), lh = $('#fl');
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  function fit() {
    var w = Math.min(box.clientWidth * dpr, SMALL ? 800 : F.w) | 0;
    c.width = w; c.height = Math.round(w * F.h / F.w);
    g.fillStyle = '#f8f5f2'; g.fillRect(0, 0, c.width, c.height);
  }
  fit();
  var labs = F.labels.map(function (t) { var d = document.createElement('div'); d.className = 'fl'; d.innerHTML = t + '<small>' + (HINT[t] || '') + '</small>'; lh.appendChild(d); return d; });
  function name(i) { return dir + 'f' + ('000' + (i * STEP)).slice(-4) + '.webp'; }

  /* pobieranie: najpierw co 16., potem gesciej */
  var order = [], seen = {}, pos = 0, active = 0;
  [16, 8, 4, 2, 1].forEach(function (st) { for (var i = 0; i < M; i += st) if (!seen[i]) { seen[i] = 1; order.push(i); } });
  if (!seen[M - 1]) order.push(M - 1);
  function pump() {
    while (active < 6 && pos < order.length) {
      (function (idx) {
        active++;
        var im = new Image();
        im.onload = function () { imgs[idx] = im; active--; want(); pump(); };
        im.onerror = function () { active--; pump(); };
        im.src = name(idx);
      })(order[pos++]);
    }
  }

  /* bufor: rozpakowane klatki przed biezaca pozycja, w kierunku przewijania */
  var cur = 0, target = 0, dirn = 1, busy = 0, RANGE = SMALL ? 16 : 36;
  function decode(i) {
    var im = imgs[i];
    if (!im || hot[i] || wait[i] || busy >= 3) return false;
    wait[i] = 1; busy++;
    var p = im.decode ? im.decode().catch(function () {}) : Promise.resolve();
    p.then(function () { return createImageBitmap(im, { resizeWidth: c.width, resizeHeight: c.height, resizeQuality: 'high' }); })
      .then(function (b) { hot[i] = b; })
      .catch(function () {})
      .then(function () { delete wait[i]; busy--; want(); });
    return true;
  }
  function want() {
    var at = Math.round(target), k;
    for (k = 0; k <= RANGE && busy < 3; k++) {
      var a = at + dirn * k, b = at - dirn * Math.min(k, 8);
      if (a >= 0 && a < M) decode(a);
      if (k <= 8 && b >= 0 && b < M) decode(b);
    }
    for (k = 0; k < M; k++) {
      if (hot[k] && Math.abs(k - at) > RANGE + 14) { hot[k].close(); hot[k] = null; }
    }
  }
  pump();

  function src(i) { return hot[i] || imgs[i] || null; }
  function closest(i) { for (var d = 0; d < M; d++) { if (src(i - d)) return src(i - d); if (src(i + d)) return src(i + d); } return null; }
  var lastA = -1, lastF = -1, lastLab = -1;
  function draw(v) {
    var a = Math.floor(v), b = Math.min(M - 1, a + 1), f = v - a;
    if (a === lastA && Math.abs(f - lastF) < .012) return;
    var A = hot[a], B = hot[b];
    if (A && B) {
      g.globalAlpha = 1; g.drawImage(A, 0, 0, c.width, c.height);
      if (f > .01) { g.globalAlpha = f; g.drawImage(B, 0, 0, c.width, c.height); g.globalAlpha = 1; }
      lastA = a; lastF = f;
    } else {
      var n = closest(Math.round(v));
      if (n) { g.globalAlpha = 1; g.drawImage(n, 0, 0, c.width, c.height); }
      lastA = -1;
    }
  }
  function placeLabels(i) {
    if (i === lastLab) return;
    lastLab = i;
    var row = F.frames[i * STEP], W = box.clientWidth, H = box.clientHeight;
    labs.forEach(function (d, n) {
      var v = row[n];
      var nx = F.labels[n] === 'Termoblok' ? .075 : 0, ny = F.labels[n] === 'Termoblok' ? .05 : 0;
      d.style.opacity = v[2];
      d.style.transform = 'translate(-50%,-100%) translate(' + ((v[0] + nx) * W).toFixed(1) + 'px,' + ((v[1] + ny) * H - 12).toFixed(1) + 'px)';
    });
  }
  var prev = performance.now();
  (function tick(now) {
    now = now || performance.now();
    /* wygladzanie niezalezne od czestotliwosci odswiezania */
    var dt = Math.min(.05, (now - prev) / 1000); prev = now;
    var d = target - cur;
    cur = Math.abs(d) < .004 ? target : cur + d * (1 - Math.exp(-dt * 7.5));
    draw(cur);
    placeLabels(Math.round(cur));
    requestAnimationFrame(tick);
  })();
  window.addEventListener('resize', function () { fit(); hot.forEach(function (b, i) { if (b) { b.close(); hot[i] = null; } }); lastA = -1; lastLab = -1; want(); });
  var titles = [$('#s0'), $('#s1'), $('#s2'), $('#s3')], dots = $$('.ex__dots i'), curT = 0;
  onScroll(function (y, vh) {
    var pr = REDUCED ? .6 : pinProgress(fig, y, vh);
    var t = pr * (M - 1);
    if (t !== target) { dirn = t > target ? 1 : -1; target = t; want(); }
    var which = pr < .14 ? 0 : pr < .42 ? 1 : pr < .78 ? 2 : 3;
    if (which !== curT) { titles[curT].classList.add('off'); titles[which].classList.remove('off'); curT = which; dots.forEach(function (o, n) { o.classList.toggle('on', n <= which); }); }
  });


  var OBJ = [["Zaparzacz", "Miele, ale kawa nie leci", "Napar nie wypływa albo lecą tylko krople.", "Zużyte uszczelki, zablokowany zaparzacz lub spadek ciśnienia.", "Wyjmij zaparzacz, opłucz go pod bieżącą wodą i sprawdź, czy nie ma w nim fusów.", "https://ekspresowy-serwis.pl/konserwacja-zespolu-zaparzajacego-saeco/", "Jak dbać o zaparzacz", "https://ekspresowy-serwis.pl/wp-content/uploads/2019/10/52917284_2318521521521072_3112651443241222144_n-1024x768.jpg"], ["Młynek", "Nie mieli kawy", "Młynek hałasuje, zacina się albo pokazuje błąd ziaren.", "Zużyte żarna, ciało obce w młynku albo awaria napędu.", "Sprawdź, czy w pojemniku nie ma kamyka, i nie używaj ziaren z dużą ilością oleju.", "https://ekspresowy-serwis.pl/ekspres-philips-nie-mieli-kawy/", "Gdy ekspres nie mieli kawy", "https://ekspresowy-serwis.pl/wp-content/uploads/2021/12/IMG_20210211_152110-1536x1152.jpg"], ["Spieniacz", "Nie spienia mleka", "Pianka jest słaba albo mleko nie jest zasysane.", "Zapchana dysza, nieszczelny wężyk albo awaria zaworu.", "Rozbierz i wyczyść dyszę oraz wężyk. Sprawdź, czy mleko jest zimne.", "https://ekspresowy-serwis.pl/ekspres-delonghi-nie-spienia-mleka/", "Dlaczego ekspres nie spienia mleka", "https://ekspresowy-serwis.pl/wp-content/uploads/2019/08/delonghi-nie-spienia-mleka-1536x1152.jpg"], ["Wyciek wody", "Cieknie spod ekspresu", "Pod urządzeniem zbiera się woda, tacka szybko się napełnia.", "Nieszczelny wąż, zawór, pompa albo uszczelka zaparzacza.", "Sprawdź, czy zbiornik i tacka są dobrze osadzone. Jeśli woda dalej cieknie, odłącz ekspres.", "https://ekspresowy-serwis.pl/spod-ekspresu-cieknie-woda/", "Co robić, gdy cieknie woda", "https://ekspresowy-serwis.pl/wp-content/uploads/2019/08/40025993_739549653054550_2247403352017076224_n-768x1024.jpg"], ["Elektronika", "Migają kontrolki", "Na panelu jest błąd, którego nie da się skasować.", "Czujnik, płytka sterująca albo przewody.", "Odłącz ekspres na kilka minut. Jeśli błąd wraca, zapisz jego numer.", "https://ekspresowy-serwis.pl/migajace-kontrolki-w-ekspresie-philips/", "Co oznaczają migające kontrolki", "https://ekspresowy-serwis.pl/wp-content/uploads/2019/08/DSC_0577-1536x1024.jpg"], ["Kamień", "Kawa chłodna i słaba", "Komunikaty o odkamienianiu wracają mimo czyszczenia.", "Osad w układzie wodnym i termobloku.", "Wykonaj odkamienianie zgodnie z instrukcją i wymień filtr, jeśli go używasz.", "https://ekspresowy-serwis.pl/konserwacja-ekspresu-do-kawy/", "Jak często konserwować ekspres", "https://ekspresowy-serwis.pl/wp-content/uploads/2019/08/jura-nie-spienia-mleka-768x1024.jpg"]], MIASTA_D = [["Warszawa", 21.01, 52.23, "https://ekspresowy-serwis.pl/serwis-ekspresow/"], ["Szczecin", 14.55, 53.43, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-szczecin/"], ["Gdańsk", 18.65, 54.35, "https://ekspresowy-serwis.pl/serwis-i-naprawa-ekspresow-do-kawy-gdansk/"], ["Olsztyn", 20.49, 53.78, "https://ekspresowy-serwis.pl/serwis-i-naprawa-ekspresow-do-kawy-olsztyn/"], ["Bydgoszcz", 18.0, 53.12, "https://ekspresowy-serwis.pl/serwis-i-naprawa-ekspresow-do-kawy-bydgoszcz/"], ["Białystok", 23.16, 53.13, "https://ekspresowy-serwis.pl/serwis-i-naprawa-ekspresow-do-kawy-bialystok/"], ["Poznań", 16.93, 52.41, "https://ekspresowy-serwis.pl/serwis-i-naprawa-ekspresow-do-kawy-poznan/"], ["Płock", 19.7, 52.55, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-plock-naprawy-ekspresow-do-kawy/"], ["Siedlce", 22.29, 52.17, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-siedlce/"], ["Łódź", 19.46, 51.76, "https://ekspresowy-serwis.pl/serwis-i-naprawa-ekspresow-do-kawy-lodz/"], ["Lublin", 22.57, 51.25, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-lublin/"], ["Wrocław", 17.04, 51.11, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-wroclaw-co-robic-by-bez-komplikacji-cieszyc-sie-wysmienita-kawa/"], ["Opole", 17.93, 50.67, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-opole/"], ["Częstochowa", 19.12, 50.81, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-czestochowa-naprawa-ekspresow-do-kawy/"], ["Katowice", 19.02, 50.26, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-katowice-naprawy-ekspresu-do-kawy/"], ["Kraków", 19.94, 50.06, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-krakow-co-warto-wiedziec-o-serwisowaniu-urzadzen/"], ["Bielsko-Biała", 19.05, 49.82, "https://ekspresowy-serwis.pl/serwis-ekspresow-do-kawy-bielsko-biala/"]];
  /* naglowek i dolny pasek */
  var nav = $('.top__nav');
  if (nav) nav.innerHTML = '<a href="#zgloszenie">Usterki</a><a href="#trasa">Odbiór</a><a href="#protokol">Naprawa</a><a href="#marki">Marki</a><a href="#opinie">Opinie</a><a href="#powrot">Kontakt</a>';
  var mob = $('.mob');
  if (mob) { mob.lastChild.setAttribute('href', '#powrot'); mob.lastChild.setAttribute('data-go', '1'); }

  /* po pierwszej klatce obraz startowy schodzi na bok */
  var poster = $('#fp'), posterT = setInterval(function () {
    if (!hot[0] && !imgs[0]) return;
    c.style.visibility = 'visible';
    clearInterval(posterT);
    setTimeout(function () { poster.style.visibility = 'hidden'; }, 200);
  }, 120);

  /* wszystkie "Zamow odbior" prowadza do jednego formularza */
  var zgo = $('#zgo'), zgm = $('#zgm');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]');
    if (a) {
      if (a.dataset.objaw) zgo.value = a.dataset.objaw;
      if (a.dataset.marka) zgm.value = a.dataset.marka;
    }
    var t = e.target.closest('[data-ev]');
    if (t && window.dataLayer) window.dataLayer.push({ event: 'cta', cta: t.dataset.ev });
  });

  /* 2 karta zgloszenia: wydruk diagnozy */
  var zgl = $('#zgl'), slip = $('#slip'), stpS = $('#slst');
  zgl.addEventListener('click', function (e) {
    var b = e.target.closest('.zg__b'); if (!b) return;
    var d = OBJ[+b.dataset.i];
    $$('.zg__b', zgl).forEach(function (x) { x.classList.toggle('on', x === b); });
    $('#slt').textContent = d[1]; $('#slc').textContent = d[3]; $('#sld').textContent = d[4];
    var l = $('#sll'); l.href = d[5]; l.textContent = d[6];
    $('#sla').dataset.objaw = d[1]; $('#slp').src = d[7];
    stpS.classList.remove('on'); void stpS.offsetWidth; setTimeout(function () { stpS.classList.add('on'); }, 40);
  });

  /* 3 mapa */
  var OUT = [[14.22,53.92],[15,54.16],[16.2,54.42],[17.4,54.75],[18.33,54.84],[18.6,54.42],[18.95,54.36],[19.65,54.45],[20.9,54.37],[22.77,54.36],[23.35,54.25],[23.93,53.75],[23.92,52.7],[23.18,52.28],[23.65,51.6],[24.1,50.85],[23.95,50.4],[23,49.75],[22.7,49.2],[22.87,49],[22,49.25],[21.5,49.42],[20.9,49.35],[20.2,49.35],[19.75,49.2],[19.4,49.55],[18.85,49.5],[18.6,49.9],[17.9,50],[17.6,50.2],[17,50.4],[16.9,50.45],[16.55,50.15],[16.2,50.65],[15.4,50.8],[14.85,50.87],[14.95,51.45],[14.73,51.9],[14.6,52.3],[14.15,52.85],[14.4,53.25],[14.25,53.7]];
  var K = 73;
  function X(lo) { return (lo - 13.7) * K * .62 + 18; }
  function Y(la) { return (55.05 - la) * K + 6; }
  function outline(a) {
    var n = a.length, q = a.map(function (p) { return [X(p[0]), Y(p[1])]; });
    function mid(i) { var u = q[i % n], v = q[(i + 1) % n]; return ((u[0] + v[0]) / 2).toFixed(1) + ' ' + ((u[1] + v[1]) / 2).toFixed(1); }
    var d = 'M' + mid(0);
    for (var i = 1; i <= n; i++) d += 'Q' + q[i % n][0].toFixed(1) + ' ' + q[i % n][1].toFixed(1) + ' ' + mid(i);
    return d + 'Z';
  }
  var hx = X(21.03), hy = Y(52.15);
  function curve(x, yy) {
    var mx = (x + hx) / 2, my = (yy + hy) / 2 - Math.hypot(x - hx, yy - hy) * .2;
    return 'M' + x.toFixed(1) + ' ' + yy.toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + hx.toFixed(1) + ' ' + hy.toFixed(1);
  }
  /* nazwy przy granicy stoja po tej stronie kropki, gdzie mieszcza sie w konturze */
  function labelAt(n, x, yy) {
    if (n === 'Białystok') return 'text-anchor="end" x="' + (x - 11).toFixed(1) + '" y="' + (yy + 5).toFixed(1) + '"';
    if (n === 'Siedlce') return 'text-anchor="middle" x="' + x.toFixed(1) + '" y="' + (yy - 12).toFixed(1) + '"';
    if (n === 'Gdańsk') return 'x="' + (x + 6).toFixed(1) + '" y="' + (yy + 22).toFixed(1) + '"';
    return 'x="' + (x + 10).toFixed(1) + '" y="' + (yy + 5).toFixed(1) + '"';
  }
  var h = '<path class="mp__pl" d="' + outline(OUT) + '"/><g id="rts"></g>';
  MIASTA_D.forEach(function (m, i) {
    if (!i) return;
    var x = X(m[1]), yy = Y(m[2]);
    h += '<path class="mp__r" d="' + curve(x, yy) + '"/><circle class="mp__d" data-i="' + i + '" cx="' + x.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="6"/><text class="mp__lb" data-l="' + i + '" ' + labelAt(m[0], x, yy) + '>' + m[0] + '</text>';
  });
  h += '<circle class="mp__pu" cx="' + hx + '" cy="' + hy + '" r="12"/><circle class="mp__hub" cx="' + hx + '" cy="' + hy + '" r="9"/>';
  h += '<g id="van" opacity="0"><g id="vanf"><path d="M-24-15h29v23h-29z M5-9h9l9 9v8H5z" fill="#c8102e" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" paint-order="stroke"/><path d="M9-6h3.6l5.6 6H9z" fill="#f6f0e3"/><rect x="-17" y="-11" width="14" height="13" fill="#bf9f76" stroke="#2c241f" stroke-width="1.4"/><path d="M-10-11v5" stroke="#2c241f" stroke-width="1.4"/><circle cx="-13" cy="9" r="5.5" fill="#2c241f" stroke="#fff" stroke-width="2"/><circle cx="13" cy="9" r="5.5" fill="#2c241f" stroke="#fff" stroke-width="2"/></g></g>';
  var VS = SMALL ? 1.5 : 1.15;
  var svg = $('#map'); svg.innerHTML = h;
  var rts = $('#rts'), van = $('#van'), raf = 0, user = false, idx = Math.min(MIASTA_D.length - 1, 3);
  function route(i, done) {
    $$('.mp__d', svg).forEach(function (d) { var on = +d.dataset.i === i; d.classList.toggle('on', on); d.setAttribute('r', on ? 9 : 6); });
    $$('.mp__lb', svg).forEach(function (t) { t.classList.toggle('on', +t.dataset.l === i); });
    var m = MIASTA_D[i];
    rts.innerHTML = '<path class="mp__rt" id="rtp" d="' + curve(X(m[1]), Y(m[2])) + '"/>';
    var p = $('#rtp'), LL = p.getTotalLength();
    cancelAnimationFrame(raf);
    if (REDUCED) return;
    var st = performance.now();
    van.setAttribute('opacity', 1);
    $('#vanf').setAttribute('transform', 'scale(' + (X(m[1]) > hx ? -VS : VS) + ' ' + VS + ') translate(0 -17)');
    (function step(n) {
      var t = clamp((n - st) / 2300, 0, 1), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, pt = p.getPointAtLength(LL * e);
      van.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
      p.style.strokeDasharray = (LL * e) + ' ' + LL;
      if (t < 1) raf = requestAnimationFrame(step); else if (done) done();
    })(st);
  }
  function cycle() { if (user) return; setTimeout(function () { if (user) return; idx = (idx % (MIASTA_D.length - 1)) + 1; route(idx, cycle); }, 1200); }
  var odq = $('#odq'), odr = $('#odr');
  odq.addEventListener('input', function () {
    var q = odq.value.trim().toLowerCase();
    if (!q) { odr.textContent = 'Kurier odbiera ekspres spod Twojego adresu.'; return; }
    var i = -1;
    MIASTA_D.forEach(function (m, n) { if (m[0].toLowerCase() === q) i = n; });
    user = true;
    if (i === 0) { odr.innerHTML = 'Jesteś blisko warsztatu. <a class="link" href="' + MIASTA_D[0][3] + '">Serwis ekspresów Warszawa</a>'; return; }
    if (i > 0) { route(i); odr.innerHTML = 'Kurier odbierze ekspres spod Twojego adresu. <a class="link" href="' + MIASTA_D[i][3] + '">Serwis ekspresów ' + MIASTA_D[i][0] + '</a>'; return; }
    odr.textContent = 'Tam też dojedzie kurier.';
  });
  svg.addEventListener('click', function (e) { var d = e.target.closest('[data-i]'); if (d) { user = true; route(+d.dataset.i); } });
  if ('IntersectionObserver' in window) {
    var mo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { mo.disconnect(); route(idx, cycle); } }, { threshold: .3 });
    mo.observe(svg);
  } else route(idx);

  /* 4 i 6 filmy: start w widoku, pauza poza nim */
  $$('video[data-v]').forEach(function (v) {
    if (REDUCED) return;
    v.src = 'wideo/' + v.dataset.v + (SMALL ? '-m' : '-d') + '.mp4';
    if (v.dataset.loop) v.loop = true;
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (v.ended) v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    }, { threshold: .35 });
    io.observe(v.parentNode);
  });

  /* 5 protokol: koncowka filmu 3D sterowana przewijaniem. Ekspres rozlozony, punkty sie odhaczaja, potem maszyna sie sklada */
  var ps = $('#ps'), rows = $$('#ps li'), pinsE = $$('#mk i'), psst = $('#psst'), mk = $('#mk'), mkc = $('#mkc'), pc = $('#pc'), pg = pc.getContext('2d', { alpha: false });
  var PART = [5, 3, 4, 0, 7, 2, 8], KEY = [], kk; /* numer etykiety z filmu dla kazdego punktu protokolu */
  for (kk = 240; kk < 284; kk += 8) KEY.push(kk);
  for (kk = 284; kk < 332; kk += 2) KEY.push(kk);
  for (kk = 332; kk < 358; kk += 4) KEY.push(kk);
  KEY.push(358);
  var pb = new Array(KEY.length), pGen = 0, pNear = false, pRun = false, pNow = 240, pTo = 240, pA = -1, pF = -1, pLab = -1;
  function pFit() {
    var w = Math.min(mk.clientWidth * dpr, 760) | 0;
    pc.width = w; pc.height = Math.round(w * F.h / F.w);
    pg.fillStyle = '#f8f5f2'; pg.fillRect(0, 0, w, pc.height);
    pA = -1; pF = -1;
  }
  function pLoad() {
    var gen = ++pGen, at = 0, q = KEY.map(function (k, i) { return i; }).sort(function (a, b) { return (a % 4 ? 1 : 0) - (b % 4 ? 1 : 0) || a - b; });
    function next() {
      if (gen !== pGen || at >= q.length) return;
      var i = q[at++], im = new Image();
      im.onload = function () {
        createImageBitmap(im, { resizeWidth: pc.width, resizeHeight: pc.height, resizeQuality: 'high' }).then(function (b) {
          if (gen !== pGen) { b.close(); return; }
          pb[i] = b; pA = -1; next();
        }).catch(next);
      };
      im.onerror = next;
      im.src = dir + 'f' + ('000' + KEY[i]).slice(-4) + '.webp';
    }
    next(); next(); next();
  }
  function pDrop() { pGen++; pb.forEach(function (b, i) { if (b) { b.close(); pb[i] = null; } }); }
  function pDraw(t) {
    var a = 0;
    while (a < KEY.length - 2 && KEY[a + 1] <= t) a++;
    var f = clamp((t - KEY[a]) / (KEY[a + 1] - KEY[a]), 0, 1);
    if (a === pA && Math.abs(f - pF) < .012) return;
    var A = pb[a], B = pb[a + 1];
    if (A && B) {
      pg.globalAlpha = 1; pg.drawImage(A, 0, 0, pc.width, pc.height);
      if (f > .01) { pg.globalAlpha = f; pg.drawImage(B, 0, 0, pc.width, pc.height); pg.globalAlpha = 1; }
      pA = a; pF = f;
    } else {
      for (var d = 0; d < KEY.length; d++) { var n = pb[a - d] || pb[a + d]; if (n) { pg.drawImage(n, 0, 0, pc.width, pc.height); break; } }
      pA = -1;
    }
  }
  function pPins(t) {
    var fr = Math.round(t);
    if (fr === pLab) return;
    pLab = fr;
    var row = F.frames[fr];
    pinsE.forEach(function (p, i) {
      var v = row[PART[i]], tb = PART[i] === 4;
      p.style.left = ((v[0] + (tb ? .075 : 0)) * 100).toFixed(2) + '%';
      p.style.top = ((v[1] + (tb ? .05 : 0)) * 100).toFixed(2) + '%';
      p.style.setProperty('--o', v[2]);
    });
  }
  function pTick() {
    if (!pNear) { pRun = false; return; }
    var d = pTo - pNow;
    pNow = Math.abs(d) < .02 ? pTo : pNow + d * .16;
    pDraw(pNow); pPins(pNow);
    requestAnimationFrame(pTick);
  }
  new IntersectionObserver(function (es) {
    pNear = es[0].isIntersecting;
    if (pNear) { pFit(); pLoad(); if (!pRun) { pRun = true; requestAnimationFrame(pTick); } } else pDrop();
  }, { rootMargin: '120% 0px' }).observe(mk);
  window.addEventListener('resize', function () { if (pNear) pFit(); });
  function setRow(n, done) {
    rows.forEach(function (r, i) { r.classList.toggle('on', i < n); });
    pinsE.forEach(function (p, i) { p.classList.toggle('vis', i < n); p.classList.toggle('on', i === n - 1); });
    psst.classList.toggle('on', done);
    mkc.textContent = done ? 'Gotowy do testu' : n ? n + '/7 ' + $('b', rows[n - 1]).textContent : 'Przegląd podzespołów';
  }
  onScroll(function (y, vh) {
    var r = ps.getBoundingClientRect();
    var p = REDUCED ? 1 : span(vh * .55 - r.top, 0, r.height - vh * .37);
    pTo = REDUCED ? 262 : p < .72 ? 240 + p / .72 * 40 : 280 + (p - .72) / .28 * 78;
    setRow(REDUCED ? rows.length : Math.round(span(p, 0, .72) * rows.length), REDUCED || p >= .97);
  });

  /* 7 marki: szukanie przygasza pozostale */
  var bw = $('#bw'), mrq = $('#mrq');
  mrq.addEventListener('input', function () {
    var q = mrq.value.trim().toLowerCase();
    $$('a[data-s]', bw).forEach(function (a) { a.classList.toggle('no', !!q && a.dataset.s.indexOf(q) === -1); });
  });

  /* TRASA PRZEZ CALA STRONE */
  var main = $('#main'), rt = $('#rt'), rb = $('#rb'), ro = $('#ro'), pk = $('#pk'), stops = $$('[data-stop]'), TL = 0, yEnd = 0;
  var hero = $('#ex');
  function buildRoute() {
    var W = main.clientWidth, H = main.offsetHeight, top = main.getBoundingClientRect().top + window.pageYOffset;
    rt.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    rt.setAttribute('height', H);
    var gut = Math.max(16, (W - 1240) / 2 - 34), small = W <= 860;
    var y0 = hero.offsetTop + hero.offsetHeight - 40;
    var d = small ? 'M14 ' + y0 : 'M' + (W / 2) + ' ' + y0, px = small ? 14 : W / 2, py = y0;
    stops.forEach(function (s, i) {
      var b = s.getBoundingClientRect(), yy = b.top + b.height / 2 + window.pageYOffset - top;
      var x = small ? 14 : (s.dataset.side === 'l' ? gut : W - gut);
      var k = (yy - py) * .55;
      d += 'C' + px.toFixed(1) + ' ' + (py + k).toFixed(1) + ' ' + x.toFixed(1) + ' ' + (yy - k).toFixed(1) + ' ' + x.toFixed(1) + ' ' + yy.toFixed(1);
      px = x; py = yy;
    });
    rb.setAttribute('d', d); ro.setAttribute('d', d);
    TL = ro.getTotalLength(); yEnd = py;
    ro.style.strokeDasharray = TL + ' ' + TL;
    window.dispatchEvent(new Event('scroll'));
  }
  function lengthAt(yy) {
    var a = 0, b = TL;
    for (var i = 0; i < 18; i++) { var m = (a + b) / 2; if (ro.getPointAtLength(m).y < yy) a = m; else b = m; }
    return a;
  }
  onScroll(function (y, vh) {
    if (!TL) return;
    var top = main.getBoundingClientRect().top + y, yy = y + vh * .62 - top;
    var L = REDUCED ? TL : lengthAt(yy);
    if (yy >= yEnd) L = TL;
    ro.style.strokeDashoffset = (TL - L).toFixed(1);
    var p = ro.getPointAtLength(L), first = hero.offsetTop + hero.offsetHeight - 40;
    pk.style.opacity = yy < first ? 0 : 1;
    pk.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
    stops.forEach(function (s) {
      var b = s.getBoundingClientRect();
      s.parentNode.classList.toggle('hit', b.top + b.height / 2 < vh * .62 + 2);
    });
  });
  buildRoute();
  window.addEventListener('load', buildRoute);
  if ('ResizeObserver' in window) {
    var rtT = 0, rs = new ResizeObserver(function () { clearTimeout(rtT); rtT = setTimeout(buildRoute, 200); });
    rs.observe(main);
  }
  main.addEventListener('toggle', function () { setTimeout(buildRoute, 50); }, true);

};
