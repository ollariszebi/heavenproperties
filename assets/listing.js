/* Listing aloldal – interakciók */

// "View more": a leírás alapból rövidítve jelenik meg
(() => {
  const desc = document.getElementById('listingDesc');
  const btn  = document.getElementById('descToggle');
  if (!desc || !btn) return;

  // ha a szöveg elfér, a gombnak nincs értelme
  if (desc.scrollHeight <= desc.clientHeight + 4) {
    desc.classList.add('open');
    btn.hidden = true;
    return;
  }

  btn.addEventListener('click', () => {
    const open = desc.classList.toggle('open');
    btn.textContent = open ? 'View less' : 'View more';
  });
})();

/* ⚠️ ÉRDEKLŐDÉSI ŰRLAP – NINCS BEKÖTVE.
   A beküldés jelenleg sehova nem megy. A visszajelzés csak a felület
   bemutatására szolgál – élesítés előtt itt kell a tényleges küldést
   megvalósítani (a főoldali kapcsolati űrlappal azonos módon). */
(() => {
  const form = document.getElementById('listingEnquiry');
  const note = document.getElementById('listingNote');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      note.className = 'form-note';
      note.textContent = 'Please complete the required fields and accept the terms.';
      // a jelölőnégyzet vizuálisan rejtett, oda ugró fókusz nem látszana –
      // ezért a hibás mezőt láthatóvá görgetjük
      const bad = form.querySelector(':invalid');
      if (bad) {
        (bad.closest('.checkfield') || bad).scrollIntoView({block:'center'});
        bad.focus({preventScroll:true});
      }
      return;
    }
    note.className = 'form-note ok';
    note.textContent = 'Thank you — an advisor will contact you shortly.';
  });
})();

/* Galéria nagy nézet: a csempék és a "Show all photos" gomb nyitják.
   A képlista magukból a csempékből jön, így csak egy helyen kell karbantartani. */
(() => {
  const gallery = document.querySelector('.gallery');
  const lb      = document.getElementById('lightbox');
  if (!gallery || !lb) return;

  const tiles = [...gallery.querySelectorAll('.gallery-tile')];
  const photos = tiles.map(t => ({
    src: (t.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [])[1],
    cap: (t.getAttribute('aria-label') || '').replace(/^Open photo \d+:\s*/, '')
  })).filter(p => p.src);
  if (!photos.length) return;

  const img   = document.getElementById('lbImg');
  const cap   = document.getElementById('lbCap');
  const count = document.getElementById('lbCount');
  const prev  = document.getElementById('lbPrev');
  const next  = document.getElementById('lbNext');
  const close = document.getElementById('lbClose');
  const label = document.getElementById('galleryAllLabel');

  // a felirat a tényleges képszámból jön, hogy ne mondjon mást, mint a galéria
  if (label) label.textContent = `Show all ${photos.length} photos`;

  /* A nagyító alapból a galéria csempéit lépteti, de kaphat másik listát is
     (a fotótúra a saját, bővebb készletét adja át) – így egy megjelenítő
     szolgálja ki mindkettőt. */
  let list = photos;
  let index = 0;
  let opener = null;
  const single = () => list.length < 2;

  function show(n) {
    index = (n + list.length) % list.length;
    img.src = list[index].src;
    img.alt = list[index].cap;
    cap.textContent = list[index].cap;
    count.textContent = `${index + 1} / ${list.length}`;
    prev.hidden = next.hidden = single();
    // a szomszédos képek előtöltése, hogy a léptetés ne villanjon
    [index + 1, index - 1].forEach(i => {
      const p = list[(i + list.length) % list.length];
      if (p !== list[index]) new Image().src = p.src;
    });
  }

  function onKey(e) {
    if (e.key === 'Escape')          { closeBox(); }
    else if (e.key === 'ArrowLeft')  { if (!single()) show(index - 1); }
    else if (e.key === 'ArrowRight') { if (!single()) show(index + 1); }
    else if (e.key === 'Tab') {
      // fókuszcsapda: a réteg mögé nem lehet kitabolni
      const stops = [close, prev, next].filter(el => !el.hidden);
      const i = stops.indexOf(document.activeElement);
      const nextStop = e.shiftKey
        ? stops[(i - 1 + stops.length) % stops.length]
        : stops[(i + 1) % stops.length];
      e.preventDefault();
      nextStop.focus();
    }
  }

  function openBox(n, customList) {
    opener = document.activeElement;
    list = customList && customList.length ? customList : photos;
    show(n);
    lb.hidden = false;
    document.body.classList.add('lb-open');
    close.focus();
    document.addEventListener('keydown', onKey);
  }

  function closeBox() {
    lb.hidden = true;
    document.body.classList.remove('lb-open');
    document.removeEventListener('keydown', onKey);
    if (opener) opener.focus();
  }

  /* A galéria csempéi és a "Show all" a teljes képernyős fotótúrát nyitják
     (ha be van töltve); a túrán belüli képek nyitják aztán ezt a nagyítót. */
  const CAT_OF_TILE = ['exterior', 'living', 'terrace', 'bedrooms', 'other'];
  function openGallery(i) {
    if (typeof window.__openTour === 'function') window.__openTour(CAT_OF_TILE[i] || null);
    else openBox(i);
  }
  tiles.forEach((t, i) => t.addEventListener('click', () => openGallery(i)));
  const allBtn = document.getElementById('galleryAll');
  if (allBtn) allBtn.addEventListener('click', () => openGallery(0));
  window.__openPhoto = openBox;
  window.__openGallery = openGallery;

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', closeBox);
  // háttérre kattintás zár – a képre kattintás nem
  lb.addEventListener('click', e => { if (e.target === lb || e.target.id === 'lbStage') closeBox(); });

  // vízszintes húzás mobilon
  let startX = null;
  lb.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', e => {
    if (startX === null || single) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  }, {passive:true});
})();

/* Megosztás. Ikonná redukált gomb, ezért nem maradhat néma:
   ahol van rendszerszintű megosztás, azt hívjuk, egyébként vágólapra másol. */
(() => {
  const btn  = document.getElementById('shareBtn');
  const note = document.getElementById('shareNote');
  if (!btn) return;

  let timer;
  const flash = text => {
    note.textContent = text;
    note.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => note.classList.remove('show'), 2200);
  };

  btn.addEventListener('click', async () => {
    const data = { title: document.title, url: location.href };
    if (navigator.share) {
      // a megszakítás (AbortError) nem hiba, a felhasználó zárta be a lapot
      try { await navigator.share(data); } catch (e) {}
      return;
    }
    // a clipboard API csak biztonságos kontextusban él (https vagy localhost)
    try {
      await navigator.clipboard.writeText(location.href);
      flash('Link copied');
    } catch (e) {
      flash('Copy not available');
    }
  });
})();


/* ---------- Kategória-sáv a galéria alatt ---------- */
(function () {
  const strip = document.getElementById('catStrip');
  if (!strip) return;
  const prev = document.getElementById('catPrev');
  const next = document.getElementById('catNext');

  /* A nyilak csak akkor látszanak, ha tényleg van hova görgetni – üres
     állapotban egy tétlen nyíl félrevezető. */
  function sync() {
    const max = strip.scrollWidth - strip.clientWidth;
    prev.hidden = strip.scrollLeft <= 4;
    next.hidden = strip.scrollLeft >= max - 4;
  }
  function page(dir) {
    const tile = strip.querySelector('.cat-tile');
    const step = tile ? (tile.offsetWidth + 18) * 2 : 300;
    strip.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  prev.addEventListener('click', () => page(-1));
  next.addEventListener('click', () => page(1));
  strip.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();

  strip.addEventListener('click', e => {
    const tile = e.target.closest('.cat-tile');
    if (!tile) return;

    // 1) fotótúra megnyitása a csempéhez tartozó szekciónál
    const idx = tile.dataset.open;
    if (idx !== undefined && typeof window.__openGallery === 'function') {
      window.__openGallery(Number(idx));
      return;
    }

    // 2) kérés: az érdeklődő űrlap előtöltése, hogy ne kelljen gépelni
    const topic = tile.dataset.request;
    if (topic) {
      const msg = document.querySelector('#listingEnquiry [name="message"]');
      if (msg) {
        msg.value = `Please send me ${topic} for this property.`;
      }
      document.getElementById('listingEnquiryBlock')
        ?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      msg?.focus({ preventScroll: true });
      return;
    }

    // 3) térkép: a fotótúra térkép-nézetét nyitja, az oldalon belül
    if (tile.dataset.map && typeof window.__openTourMap === 'function') {
      window.__openTourMap();
    }
  });
})();


/* ---------- Teljes képernyős fotótúra ----------
   A galéria csempéi, a "Show all" gomb és a kategória-sáv ezt nyitják meg.
   A képek kategóriákba rendezve jelennek meg; egy képre kattintva a meglévő
   nagyító nyílik ki fölötte. A TOUR tömb a demó tartalom – valós hirdetésnél
   ez jön majd az adatokból. */
(function () {
  const tour = document.getElementById('photoTour');
  if (!tour) return;

  const TOUR = [
    { id:'exterior', name:'Exterior', shots:[
      { src:'/images/country-dubai.png',      cap:'Exterior, seen from the beach' },
      { src:'/images/listing/p2.jpg',         cap:'Entrance courtyard' },
      { src:'/images/listing/p5.jpg',         cap:'Facade at dusk' } ] },
    { id:'living', name:'Living', shots:[
      { src:'/images/trending-4.jpg',         cap:'Living room' },
      { src:'/images/listing/p3.jpg',         cap:'Double-height reception' },
      { src:'/images/trending-2.jpg',         cap:'Dining area' } ] },
    { id:'terrace', name:'Terrace & pool', shots:[
      { src:'/images/trending-3.jpg',         cap:'Terrace and pool' },
      { src:'/images/listing/p6.jpg',         cap:'Poolside lounge' } ] },
    { id:'bedrooms', name:'Bedrooms', shots:[
      { src:'/images/trending-6.jpg',         cap:'Principal bedroom' },
      { src:'/images/listing/p4.jpg',         cap:'Guest bedroom' } ] },
    /* a be nem sorolható képek gyűjtőhelye */
    { id:'other', name:'Others', shots:[
      { src:'/images/trending-1.jpg',         cap:'Skyline view from the terrace' },
      { src:'/images/listing/p1.jpg',         cap:'Sea view' } ] }
  ];

  const scroll   = document.getElementById('tourScroll');
  const tabs     = document.getElementById('tourTabs');
  const jump     = document.getElementById('tourJump');
  const jumpWrap = document.getElementById('tourJumpWrap');
  const jumpNext = document.getElementById('tourJumpNext');
  const sections = document.getElementById('tourSections');
  const sub      = document.getElementById('tourSub');
  const total    = TOUR.reduce((n, c) => n + c.shots.length, 0);

  // lapos lista: a nagyító ezen az indexen lépked
  const flat = TOUR.flatMap(c => c.shots);
  sub.textContent = `${total} photos in ${TOUR.length} sections`;

  let built = false;
  function build() {
    if (built) return;
    built = true;
    /* A felső sáv a MÉDIATÍPUSOKAT kínálja (Photos / Video / Floor Plan /
       Map / Street View) – a szobakategóriák a bélyegkép-soron szerepelnek
       lentebb, azokat itt megismételni felesleges duplikáció volna. */
    const MEDIA = [
      { label:'Photos',      act:'photos' },
      { label:'Video',       act:'request', topic:'the video tour' },
      { label:'Floor Plan',  act:'request', topic:'the floor plans' },
      { label:'Map',         act:'map' }
    ];
    MEDIA.forEach(m => {
      const tab = document.createElement('button');
      tab.className = 'tour-tab'; tab.type = 'button';
      tab.textContent = m.label; tab.dataset.act = m.act;
      if (m.topic) tab.dataset.topic = m.topic;
      if (m.act === 'photos') tab.setAttribute('aria-current', 'true');
      tabs.appendChild(tab);
    });

    let i = 0;
    TOUR.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'tour-chip'; chip.type = 'button'; chip.dataset.target = cat.id;
      chip.innerHTML = `<img src="${cat.shots[0].src}" alt="" loading="lazy"><span>${cat.name}</span>`;
      jump.appendChild(chip);

      const sec = document.createElement('section');
      sec.className = 'tour-sec'; sec.id = 'tour-' + cat.id;
      const h = document.createElement('h3');
      h.textContent = cat.name;
      const grid = document.createElement('div');
      grid.className = 'tour-grid';
      cat.shots.forEach(shot => {
        const b = document.createElement('button');
        b.className = 'tour-shot'; b.type = 'button';
        b.dataset.index = i++;
        b.setAttribute('aria-label', 'Open photo: ' + shot.cap);
        b.innerHTML = `<img src="${shot.src}" alt="${shot.cap}" loading="lazy">`;
        grid.appendChild(b);
      });
      sec.append(h, grid);
      sections.appendChild(sec);
    });
  }

  function goto(id) {
    const el = document.getElementById('tour-' + id);
    if (!el) return;
    /* offsetTop a pozicionált őshöz (.tour) mérne, nem a görgetőkonténerhez –
       ezért a két téglalap különbségéből számolunk. */
    const top = el.getBoundingClientRect().top
              - scroll.getBoundingClientRect().top
              + scroll.scrollTop - 8;
    scroll.scrollTo({ top, behavior: 'smooth' });
  }

  let lastFocus = null;
  function open(catId) {
    build();
    lastFocus = document.activeElement;
    tour.hidden = false;
    tour.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    scroll.scrollTop = 0;
    if (catId) requestAnimationFrame(() => goto(catId));
    document.getElementById('tourBack').focus();
    document.addEventListener('keydown', onKey);
  }
  function close() {
    tour.hidden = true;
    tour.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    lastFocus?.focus();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  document.getElementById('tourBack').addEventListener('click', close);
  document.getElementById('tourMessage').addEventListener('click', () => {
    close();
    document.getElementById('listingEnquiryBlock')?.scrollIntoView({ block:'start', behavior:'smooth' });
  });
  /* nézetváltás: fotók vagy térkép – mindkettő az oldalon belül marad */
  const mapPanel = document.getElementById('tourMap');
  const title    = tour.querySelector('.tour-title');
  const formPanel = document.getElementById('tourForm');

  /* Három nézet osztozik a törzsön: fotók, térkép, kérés-űrlap.
     Mindegyik a túrán belül marad – kilépni egyikhez sem kell. */
  function setView(which, activeTab) {
    if (!activeTab) activeTab = tabs.querySelector(`.tour-tab[data-act="${which}"]`);
    const isPhotos = which === 'photos';
    const isMap    = which === 'map';
    jumpWrap.hidden  = !isPhotos;
    if (isPhotos) requestAnimationFrame(updateMore);
    sections.hidden  = !isPhotos;
    document.getElementById('tourSub').hidden = !isPhotos;
    title.hidden     = !isPhotos;
    mapPanel.hidden  = !isMap;
    formPanel.hidden = which !== 'request';
    tour.classList.toggle('tour--map', isMap);
    /* a jelölést a konkrét gomb kapja: a Video és a Floor Plan egyaránt
       "request" típusú, típus szerint jelölve mindkettő aktívnak látszana */
    tabs.querySelectorAll('.tour-tab').forEach(t =>
      t.setAttribute('aria-current', String(t === activeTab)));
    scroll.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabs.addEventListener('click', e => {
    const t = e.target.closest('.tour-tab');
    if (!t) return;
    const act = t.dataset.act;
    if (act === 'photos' || act === 'map') { setView(act, t); return; }
    if (act === 'request') {
      const topic = t.dataset.topic;
      document.getElementById('tourFormTitle').textContent =
        'Request ' + topic;
      document.getElementById('tourRequestMsg').value =
        `Please send me ${topic} for this property.`;
      setView('request', t);
      formPanel.querySelector('input[name="name"]').focus({ preventScroll: true });
    }
  });
  jump.addEventListener('click', e => {
    const c = e.target.closest('.tour-chip'); if (c) goto(c.dataset.target);
  });
  // képre kattintva a meglévő nagyító nyílik ki, a túra listáján lépkedve
  sections.addEventListener('click', e => {
    const b = e.target.closest('.tour-shot');
    if (b && typeof window.__openPhoto === 'function') {
      window.__openPhoto(Number(b.dataset.index), flat);
    }
  });
  /* a fül az aktuálisan látott szekciót jelzi – görgetés közben is */
  /* görgetés közben az épp látott kategória bélyegképe kap jelölést */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const id = en.target.id.replace('tour-', '');
      jump.querySelectorAll('.tour-chip').forEach(c =>
        c.setAttribute('aria-current', String(c.dataset.target === id)));
      centerChip(jump.querySelector(`.tour-chip[data-target="${id}"]`));
    });
  }, { root: scroll, rootMargin: '-10% 0px -70% 0px' });
  /* A bélyegkép-sor mobilon nem fér ki: jobb szélén halványítás és egy nyíl
     jelzi, hogy van még kategória. Görgetés közben az aktív bélyegkép a sor
     közepére csúszik – scrollIntoView helyett kézzel, mert az a függőleges
     görgetőt is visszarántaná a sor tetejére. */
  function updateMore() {
    const more = jump.scrollLeft + jump.clientWidth < jump.scrollWidth - 4;
    jumpWrap.classList.toggle('has-more', more);
    jumpNext.hidden = !more;
  }
  function centerChip(chip) {
    if (!chip || jump.scrollWidth <= jump.clientWidth) return;
    jump.scrollTo({ left: chip.offsetLeft - (jump.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
  }
  jump.addEventListener('scroll', updateMore, { passive: true });
  window.addEventListener('resize', updateMore);
  jumpNext.addEventListener('click', () =>
    jump.scrollBy({ left: jump.clientWidth * 0.7, behavior: 'smooth' }));
  const observeAll = () => sections.querySelectorAll('.tour-sec').forEach(s => io.observe(s));

  /* A beágyazott térkép csak kattintásra töltődik: enélkül minden látogató
     IP-címe eljutna az OpenStreetMap-hez anélkül, hogy kérte volna. */
  document.getElementById('tourMapLoad')?.addEventListener('click', () => {
    const frame = document.getElementById('tourMapFrame');
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.openstreetmap.org/export/embed.html'
               + '?bbox=55.119,25.092,55.159,25.132&layer=mapnik&marker=25.1124,55.1390';
    iframe.title = 'Map: Palm Jumeirah, Dubai';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer';
    frame.replaceChildren(iframe);
  });

  /* ugyanaz a beküldési minta, mint a többi űrlapnál: kliensoldali ellenőrzés,
     majd visszajelzés – a valódi küldés a Next.js migrációnál jön */
  const rq = document.getElementById('tourRequest');
  const rqNote = document.getElementById('tourRequestNote');
  rq?.addEventListener('submit', e => {
    e.preventDefault();
    rq.classList.add('was-validated');
    if (!rq.checkValidity()) {
      rqNote.className = 'form-note';
      rqNote.textContent = 'Please complete the required fields and accept the terms.';
      const bad = rq.querySelector(':invalid');
      if (bad) {
        (bad.closest('.checkfield') || bad).scrollIntoView({ block: 'center' });
        bad.focus({ preventScroll: true });
      }
      return;
    }
    rqNote.className = 'form-note ok';
    rqNote.textContent = 'Thank you — an advisor will send this within one business day.';
  });

  window.__openTourMap = () => { open(null); observeAll(); setView('map'); };
  window.__openTour = catId => {
    open(catId);
    observeAll();
    setView('photos');
    /* megnyitáskor is legyen kijelölt kategória: a kért, vagy az első –
       görgetés közben a figyelő ezt magától továbbviszi */
    const first = catId || jump.querySelector('.tour-chip')?.dataset.target;
    jump.querySelectorAll('.tour-chip').forEach(c =>
      c.setAttribute('aria-current', String(c.dataset.target === first)));
    if (catId) requestAnimationFrame(() => goto(catId));
  };
})();
