/* Listing gyűjtőoldal: szűrés, rendezés, URL-állapot.
   ⚠️ A lenti tömb DEMÓ ADAT. Éles rendszerben ezt CMS/adatbázis adja majd;
   a szűrés logikája viszont ugyanez marad. */
(() => {
  const grid = document.getElementById('propGrid');
  if (!grid) return;

  /* Körzetek piaconként. Csoportosítva, ahol egy országon belül több
     város/régió van – így a címke rövid marad, és a kártyán is ez jelenik meg. */
  const AREAS = {
    uae: [
      {group:null, items:[
        ['business-bay','Business Bay'],
        ['dubai-marina','Dubai Marina'],
        ['downtown-dubai','Downtown Dubai'],
        ['jvc','Jumeirah Village Circle (JVC)'],
        ['dubai-hills-estate','Dubai Hills Estate'],
        ['palm-jumeirah','Palm Jumeirah'],
        ['dubai-creek-harbour','Dubai Creek Harbour'],
        ['sobha-hartland','Sobha Hartland'],
        ['dubai-islands','Dubai Islands'],
        ['meydan-city','Meydan City'],
        ['mbr-city','MBR City']
      ]}
    ],
    hungary: [
      {group:'Budapest', items:[
        ['budapest-i','District I — Castle District'],
        ['budapest-ii','District II — Rózsadomb'],
        ['budapest-v','District V — Belváros'],
        ['budapest-vi','District VI — Terézváros'],
        ['budapest-xii','District XII — Hegyvidék']
      ]},
      {group:'Lake Balaton', items:[
        ['balatonfured','Balatonfüred'],
        ['tihany','Tihany'],
        ['siofok','Siófok']
      ]}
    ],
    spain: [
      {group:'Costa del Sol', items:[
        ['marbella-golden-mile','Marbella — Golden Mile'],
        ['puerto-banus','Puerto Banús'],
        ['la-zagaleta','La Zagaleta'],
        ['sotogrande','Sotogrande'],
        ['estepona','Estepona']
      ]},
      {group:'Islands & coast', items:[
        ['ibiza','Ibiza'],
        ['mallorca','Mallorca'],
        ['costa-blanca','Costa Blanca']
      ]}
    ],
    thailand: [
      {group:'Phuket', items:[
        ['bang-tao','Bang Tao'],
        ['layan','Layan'],
        ['kamala','Kamala'],
        ['surin','Surin'],
        ['kata-karon','Kata & Karon']
      ]},
      {group:'Koh Samui', items:[
        ['bophut','Bophut'],
        ['chaweng','Chaweng'],
        ['maenam','Maenam']
      ]}
    ]
  };

  // id -> címke, hogy a kártyán ne kelljen külön tárolni a körzet nevét
  const AREA_LABEL = {};
  Object.values(AREAS).flat().forEach(g => g.items.forEach(([id,l]) => AREA_LABEL[id] = l));

  const PROPERTIES = [
    {id:'hp-dxb-1042', title:'Waterfront Villa on Palm Jumeirah', areaId:'palm-jumeirah', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'ready', type:'villa',
     beds:5, baths:6, size:780, price:12400000, img:1, featured:true, href:'/listing.html'},
    {id:'hp-dxb-0917', title:'Marina Skyline Penthouse', areaId:'dubai-marina', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'ready', type:'penthouse',
     beds:4, baths:5, size:410, price:6900000, img:2, featured:true},
    {id:'hp-dxb-1188', title:'Creek Harbour Residences', areaId:'dubai-creek-harbour', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'off-plan', type:'apartment',
     beds:2, baths:2, size:118, price:840000, img:3, handover:'Q4 2027'},
    {id:'hp-dxb-0764', title:'District One Mansion', areaId:'mbr-city', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'ready', type:'villa',
     beds:7, baths:9, size:1240, price:18900000, img:4, featured:true},
    {id:'hp-dxb-1205', title:'Business Bay Retail Unit', areaId:'business-bay', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'ready', type:'commercial',
     beds:0, baths:2, size:260, price:1450000, img:5},
    {id:'hp-dxb-1173', title:'Dubai Hills Townhouse', areaId:'dubai-hills-estate', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'off-plan', type:'townhouse',
     beds:3, baths:4, size:210, price:1120000, img:6, handover:'Q2 2027'},

    {id:'hp-bud-0231', title:'Castle District Residence', areaId:'budapest-i', city:'Budapest',
     country:'Hungary', loc:'hungary', status:'ready', type:'apartment',
     beds:3, baths:2, size:165, price:1380000, img:2},
    {id:'hp-blt-0118', title:'Lake Balaton Villa', areaId:'balatonfured', city:'Balaton',
     country:'Hungary', loc:'hungary', status:'ready', type:'villa',
     beds:5, baths:4, size:340, price:2150000, img:3},

    {id:'hp-esp-0442', title:'Golden Mile Villa', areaId:'marbella-golden-mile', city:'Marbella',
     country:'Spain', loc:'spain', status:'ready', type:'villa',
     beds:6, baths:7, size:620, price:8400000, img:4},
    {id:'hp-esp-0507', title:'Ibiza Cliffside Project', areaId:'ibiza', city:'Ibiza',
     country:'Spain', loc:'spain', status:'off-plan', type:'villa',
     beds:5, baths:6, size:480, price:5600000, img:5, handover:'Q3 2027'},

    {id:'hp-tha-0329', title:'Beachfront Pool Villa', areaId:'bang-tao', city:'Phuket',
     country:'Thailand', loc:'thailand', status:'ready', type:'villa',
     beds:4, baths:5, size:390, price:3250000, img:6},
    {id:'hp-tha-0361', title:'Koh Samui Hillside Residences', areaId:'bophut', city:'Koh Samui',
     country:'Thailand', loc:'thailand', status:'off-plan', type:'apartment',
     beds:2, baths:2, size:140, price:690000, img:1, handover:'Q1 2028'},
    {id:'hp-dxb-1310', title:'Burj View Apartment', areaId:'downtown-dubai', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'ready', type:'apartment',
     beds:2, baths:3, size:145, price:1950000, img:2},
    {id:'hp-dxb-1344', title:'Garden View Apartment', areaId:'jvc', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'off-plan', type:'apartment',
     beds:1, baths:2, size:76, price:265000, img:3, handover:'Q1 2027'},
    {id:'hp-dxb-1298', title:'Waterfront Townhouse', areaId:'sobha-hartland', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'off-plan', type:'townhouse',
     beds:4, baths:5, size:295, price:1780000, img:4, handover:'Q3 2027'},
    {id:'hp-dxb-1401', title:'Beachfront Penthouse', areaId:'dubai-islands', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'off-plan', type:'penthouse',
     beds:3, baths:4, size:320, price:3400000, img:5, handover:'Q4 2028'},
    {id:'hp-dxb-0885', title:'Racecourse Villa', areaId:'meydan-city', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'ready', type:'villa',
     beds:5, baths:6, size:560, price:4250000, img:6},
    {id:'hp-dxb-1226', title:'Canal-Front Office Floor', areaId:'business-bay', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'ready', type:'commercial',
     beds:0, baths:3, size:480, price:2600000, img:1},
    {id:'hp-dxb-0952', title:'Shoreline Apartment', areaId:'palm-jumeirah', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'ready', type:'apartment',
     beds:3, baths:4, size:210, price:2850000, img:2},
    {id:'hp-dxb-1067', title:'Marina Townhouse', areaId:'dubai-marina', city:'Dubai',
     country:'United Arab Emirates', loc:'uae', status:'ready', type:'townhouse',
     beds:4, baths:4, size:265, price:2100000, img:3},

    {id:'hp-bud-0287', title:'Rózsadomb Villa', areaId:'budapest-ii', city:'Budapest',
     country:'Hungary', loc:'hungary', status:'ready', type:'villa',
     beds:5, baths:4, size:420, price:2650000, img:4},
    {id:'hp-bud-0304', title:'Danube-Front Apartment', areaId:'budapest-v', city:'Budapest',
     country:'Hungary', loc:'hungary', status:'ready', type:'apartment',
     beds:3, baths:3, size:190, price:1750000, img:5},
    {id:'hp-blt-0142', title:'Tihany Peninsula Retreat', areaId:'tihany', city:'Balaton',
     country:'Hungary', loc:'hungary', status:'off-plan', type:'villa',
     beds:4, baths:3, size:280, price:1320000, img:6, handover:'Q2 2027'},

    {id:'hp-esp-0519', title:'Marina Penthouse', areaId:'puerto-banus', city:'Marbella',
     country:'Spain', loc:'spain', status:'ready', type:'penthouse',
     beds:3, baths:3, size:245, price:3900000, img:1},
    {id:'hp-esp-0466', title:'La Zagaleta Mountain Estate', areaId:'la-zagaleta', city:'Benahavís',
     country:'Spain', loc:'spain', status:'ready', type:'villa',
     beds:8, baths:9, size:1450, price:14500000, img:2, featured:true},
    {id:'hp-esp-0488', title:'Polo Estate', areaId:'sotogrande', city:'Sotogrande',
     country:'Spain', loc:'spain', status:'ready', type:'villa',
     beds:6, baths:6, size:720, price:6200000, img:3},
    {id:'hp-esp-0533', title:'Son Vida Residence', areaId:'mallorca', city:'Palma',
     country:'Spain', loc:'spain', status:'off-plan', type:'villa',
     beds:5, baths:5, size:540, price:4750000, img:4, handover:'Q1 2028'},

    {id:'hp-tha-0374', title:'Layan Ocean View Villa', areaId:'layan', city:'Phuket',
     country:'Thailand', loc:'thailand', status:'off-plan', type:'villa',
     beds:4, baths:4, size:350, price:2400000, img:5, handover:'Q4 2027'},
    {id:'hp-tha-0348', title:'Surin Hillside Penthouse', areaId:'surin', city:'Phuket',
     country:'Thailand', loc:'thailand', status:'ready', type:'penthouse',
     beds:3, baths:3, size:230, price:1650000, img:6},
    {id:'hp-tha-0390', title:'Chaweng Beach Residence', areaId:'chaweng', city:'Koh Samui',
     country:'Thailand', loc:'thailand', status:'ready', type:'apartment',
     beds:2, baths:2, size:125, price:580000, img:1}
  ];

  const els = {
    q:        document.getElementById('fQ'),
    location: document.getElementById('fLocation'),
    area:     document.getElementById('fArea'),
    status:   document.getElementById('fStatus'),
    type:     document.getElementById('fType'),
    beds:     document.getElementById('fBeds'),
    min:      document.getElementById('fMin'),
    max:      document.getElementById('fMax'),
    sort:     document.getElementById('fSort')
  };
  const count   = document.getElementById('resultCount');
  const empty   = document.getElementById('noResults');
  const clearBtn = document.getElementById('clearFilters');
  const moreBtn  = document.getElementById('showMore');
  const moreBox  = document.getElementById('loadMore');
  const moreText = document.getElementById('loadCount');
  const track    = document.getElementById('loadTrack');
  const bar      = document.getElementById('loadBar');

  const PAGE = 12;      // ennyi kártya látszik egyszerre
  let shown = PAGE;

  const money = n => '$' + n.toLocaleString('en-US');
  const budgetNote = document.getElementById('budgetNote');
  // a mezőkben szóközös tagolással szerepel a szám – csak a számjegyek kellenek
  const digits = v => v.replace(/\D/g, '');
  const num = v => { const d = digits(v); return d ? parseInt(d, 10) : null; };
  // ezres tagolás szóközzel: 3 000 000
  const group = d => d.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  function matches(p, f) {
    if (f.location && p.loc !== f.location) return false;
    if (f.area && p.areaId !== f.area) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.type && p.type !== f.type) return false;
    if (f.beds && p.beds < Number(f.beds)) return false;
    if (f.min !== null && p.price < f.min) return false;
    if (f.max !== null && p.price > f.max) return false;
    if (f.q) {
      const hay = [p.title, AREA_LABEL[p.areaId], p.city, p.country, p.type, p.status].join(' ').toLowerCase();
      // minden szónak szerepelnie kell, hogy a "dubai villa" is szűkítsen
      if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w))) return false;
    }
    return true;
  }

  const SORTS = {
    featured:     (a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.price - a.price,
    'price-asc':  (a,b) => a.price - b.price,
    'price-desc': (a,b) => b.price - a.price,
    'size-desc':  (a,b) => b.size - a.size
  };

  /* ⚠️ DEMÓ: hat kép van összesen, ezért minden ingatlanhoz ugyanabból a
     készletből rakunk össze hármat. Éles adatnál ez a lista a listingből jön. */
  const gallery = p => [p.img, (p.img % 6) + 1, ((p.img + 1) % 6) + 1];

  const CHEV_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12 15 19"/></svg>';
  const CHEV_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 16 12 9 19"/></svg>';

  function card(p) {
    const specs = [
      p.beds ? `<li><strong>${p.beds}</strong> Beds</li>` : '',
      `<li><strong>${p.baths}</strong> Baths</li>`,
      `<li><strong>${p.size.toLocaleString('en-US')}</strong> m²</li>`
    ].join('');
    const badge = p.status === 'off-plan'
      ? `<span class="prop-badge prop-badge--offplan">Off-plan${p.handover ? ' · ' + p.handover : ''}</span>`
      : `<span class="prop-badge">Ready</span>`;

    const imgs = gallery(p);
    const slides = imgs.map((n, i) =>
      `<img src="/images/trending-${n}.jpg" alt="${p.title}${i ? ` – photo ${i + 1}` : ''}"
            loading="lazy" decoding="async">`).join('');
    const dots = imgs.map((_, i) =>
      `<span class="prop-dot${i === 0 ? ' is-on' : ''}"></span>`).join('');

    /* A kártya <article>, nem <a>: gombokat nem lehet linkbe ágyazni.
       A címben lévő link ::after-je feszül ki az egész kártyára, a galéria
       vezérlői pedig e fölé kerülnek – így a kép lapozható, a kártya kattintható. */
    return `
      <article class="prop-card">
        <div class="prop-media" data-i="0" data-n="${imgs.length}">
          <div class="prop-slides">${slides}</div>
          ${badge}
          <button class="prop-nav prop-nav--prev" type="button" aria-label="Previous photo">${CHEV_L}</button>
          <button class="prop-nav prop-nav--next" type="button" aria-label="Next photo">${CHEV_R}</button>
          <div class="prop-dots" aria-hidden="true">${dots}</div>
        </div>
        <div class="prop-price">${money(p.price)}</div>
        <h2 class="prop-title"><a class="prop-link" href="${p.href || '/listing.html'}">${p.title}</a></h2>
        <p class="prop-loc">${AREA_LABEL[p.areaId]}, ${p.city} · ${p.country}</p>
        <ul class="prop-specs">${specs}</ul>
      </article>`;
  }

  /* Egy delegált kezelő az egész rácsra: a kártyák minden szűréskor újraépülnek,
     kártyánkénti listener esetén mindet újra kellene kötni. */
  function step(media, dir) {
    const n = +media.dataset.n;
    const i = (+media.dataset.i + dir + n) % n;
    media.dataset.i = i;
    media.querySelector('.prop-slides').style.transform = `translateX(${-i * 100}%)`;
    media.querySelectorAll('.prop-dot').forEach((d, j) => d.classList.toggle('is-on', j === i));
  }

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.prop-nav');
    if (!btn) return;
    e.preventDefault();
    step(btn.closest('.prop-media'), btn.classList.contains('prop-nav--next') ? 1 : -1);
  });

  let swipeX = null;
  grid.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; }, {passive:true});
  grid.addEventListener('touchend', e => {
    const media = e.target.closest('.prop-media');
    if (swipeX === null || !media) return;
    const dx = e.changedTouches[0].clientX - swipeX;
    if (Math.abs(dx) > 40) step(media, dx < 0 ? 1 : -1);
    swipeX = null;
  }, {passive:true});

  /* A körzetlista a választott országtól függ. `keep` csak akkor marad meg,
     ha az adott országban létezik – így az URL-ből jövő érték is ellenőrzött. */
  function populateAreas(loc, keep) {
    const sel = els.area;
    const groups = AREAS[loc];
    sel.innerHTML = '';
    const first = new Option(groups ? 'Any' : 'Pick a location', '');
    sel.appendChild(first);
    sel.disabled = !groups;
    if (!groups) return;
    groups.forEach(g => {
      const target = g.group ? document.createElement('optgroup') : sel;
      if (g.group) target.label = g.group;
      g.items.forEach(([v, l]) => target.appendChild(new Option(l, v)));
      if (g.group) sel.appendChild(target);
    });
    sel.value = (keep && [...sel.options].some(o => o.value === keep)) ? keep : '';
  }

  function readFilters() {
    return {
      q: els.q.value.trim(), location: els.location.value, area: els.area.value,
      status: els.status.value, type: els.type.value, beds: els.beds.value,
      min: num(els.min.value), max: num(els.max.value)
    };
  }

  function syncUrl(f) {
    const p = new URLSearchParams();
    Object.entries(f).forEach(([k,v]) => { if (v !== null && v !== '') p.set(k, v); });
    if (els.sort.value !== 'featured') p.set('sort', els.sort.value);
    const qs = p.toString();
    // replaceState, hogy a szűrögetés ne töltse tele a vissza-gomb előzményeit
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  /* Mobilon a Location mellett a "More filters" gomb nyitja a többi mezőt.
     A számláló zárt panelnél is jelzi, hány további szűrő él (a Location
     látszik, azt nem számoljuk; a min–max összeg egynek számít). Nyitáskor
     nem visszük a fókuszt a kereső mezőre, mert az a billentyűzetet is
     felhozná. */
  const filtersForm = document.getElementById('filters');
  const filtersBtn = document.getElementById('filtersToggle');
  const filtersCountEl = document.getElementById('filtersCount');
  filtersBtn?.addEventListener('click', () => {
    const open = !filtersForm.classList.contains('is-open');
    filtersForm.classList.toggle('is-open', open);
    filtersBtn.setAttribute('aria-expanded', String(open));
  });
  function updateMoreCount(f) {
    if (!filtersCountEl) return;
    const set = v => v !== null && v !== '';
    const n = ['q', 'area', 'status', 'type', 'beds'].filter(k => set(f[k])).length
            + (set(f.min) || set(f.max) ? 1 : 0);
    filtersCountEl.hidden = !n;
    filtersCountEl.innerHTML = n ? `<span class="sr-only">, active: </span>${n}` : '';
  }

  function render(keepShown) {
    // szűrő- vagy rendezésváltáskor vissza az első oldalra
    if (!keepShown) shown = PAGE;

    const f = readFilters();
    const list = PROPERTIES.filter(p => matches(p, f)).sort(SORTS[els.sort.value] || SORTS.featured);
    const page = list.slice(0, shown);

    // a hibás tartomány 0 találatot ad – ezt meg is mondjuk, ne tűnjön hibának
    budgetNote.hidden = !(f.min !== null && f.max !== null && f.min > f.max);
    // a keret a burkolón van, mert az input maga keret nélküli
    els.min.closest('.money-input').classList.toggle('is-invalid', !budgetNote.hidden);
    els.max.closest('.money-input').classList.toggle('is-invalid', !budgetNote.hidden);

    grid.innerHTML = page.map(card).join('');
    grid.hidden = list.length === 0;
    empty.hidden = list.length > 0;

    const remaining = list.length - page.length;
    // teljes lista esetén nincs mit jelezni: az egész blokk eltűnik
    moreBox.hidden = remaining === 0;
    if (remaining > 0) {
      moreBtn.textContent = `Show ${Math.min(PAGE, remaining)} more`;
      moreText.textContent = `Showing ${page.length} of ${list.length}`;
      bar.style.width = `${(page.length / list.length) * 100}%`;
      track.setAttribute('aria-valuemax', list.length);
      track.setAttribute('aria-valuenow', page.length);
      track.setAttribute('aria-valuetext', `${page.length} of ${list.length} properties`);
    }

    const active = Object.values(f).some(v => v !== null && v !== '');
    clearBtn.hidden = !active;
    // fent a találatszám, lent a betöltési állapot – nem ismételjük egymást
    count.textContent = list.length === 1
      ? '1 property'
      : `${list.length} properties${active ? ` of ${PROPERTIES.length}` : ''}`;

    updateMoreCount(f);
    syncUrl(f);
  }

  function applyUrl() {
    const p = new URLSearchParams(location.search);
    Object.keys(els).forEach(k => {
      if (k === 'area') return;                 // az ország beállítása után jön
      const v = p.get(k);
      if (v === null) return;
      if (k === 'min' || k === 'max') {
        els[k].value = group(digits(v));
        return;
      }
      // ismeretlen érték esetén maradjon az alapállapot
      if (els[k].tagName === 'SELECT' && ![...els[k].options].some(o => o.value === v)) return;
      els[k].value = v;
    });
    populateAreas(els.location.value, p.get('area'));
  }

  function reset() {
    Object.values(els).forEach(el => { if (el !== els.sort) el.value = ''; });
    populateAreas('');
    render();
    els.q.focus();
  }

  // input: gépelés közben; change: legördülőknél
  els.q.addEventListener('input', render);
  els.location.addEventListener('change', () => { populateAreas(els.location.value); render(); });
  ['area','status','type','beds','sort'].forEach(k => els[k].addEventListener('change', render));
  /* Gépelés közbeni tagolás. Az érték újraírása elmozdítaná a kurzort, ezért
     nem karakterpozíciót őrzünk, hanem a kurzor ELŐTTI SZÁMJEGYEK számát –
     a beszúrt szóközök így nem tolják el a beírási pontot. */
  function formatLive(el) {
    const caret = el.selectionStart;
    const digitsBefore = digits(el.value.slice(0, caret)).length;
    const out = group(digits(el.value));
    if (out === el.value) return;
    el.value = out;
    let pos = 0, seen = 0;
    while (pos < out.length && seen < digitsBefore) {
      if (out[pos] >= '0' && out[pos] <= '9') seen++;
      pos++;
    }
    el.setSelectionRange(pos, pos);
  }

  [els.min, els.max].forEach(el => {
    el.addEventListener('input', () => { formatLive(el); render(); });
    // a mező jobb szélére (a pénznemre) kattintva is a beírás induljon
    const wrap = el.closest('.money-input');
    wrap.addEventListener('mousedown', e => {
      if (e.target !== el) { e.preventDefault(); el.focus(); }
    });
  });
  document.getElementById('filters').addEventListener('submit', e => e.preventDefault());
  moreBtn.addEventListener('click', () => {
    const first = shown;                 // az első új kártya indexe
    shown += PAGE;
    render(true);
    // a fókusz az első új kártyára, hogy billentyűzettel ne vesszen el a hely
    const card = grid.children[first];
    if (card) { card.setAttribute('tabindex', '-1'); card.focus({preventScroll:true}); }
  });
  clearBtn.addEventListener('click', reset);
  document.getElementById('resetFromEmpty').addEventListener('click', reset);

  applyUrl();
  render();
})();
