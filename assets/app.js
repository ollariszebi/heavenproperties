  /* "Zuhanás" átmenet a heróból a Destinations szekcióba.
     Görgetéshez kötött, nem időzített – így a felhasználó tempójában
     történik, a köbös easing pedig gyorsulást ad neki (whip cut érzet). */
  (() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const hero      = document.getElementById('hero');
    const heroBg    = document.querySelector('.hero-bg');
    const heroInner = document.querySelector('.hero-inner');
    const dest      = document.getElementById('destinations');
    if (!hero || !heroBg || !heroInner || !dest) return;

    const clamp   = (v, a, b) => Math.min(b, Math.max(a, v));
    const easeIn  = t => t * t * t;                 // gyorsuló – a zuhanás
    const easeOut = t => 1 - Math.pow(1 - t, 3);    // lassuló – a beérkezés

    let queued = false;
    let lastBlur = -1;

    function frame() {
      queued = false;
      const h = hero.offsetHeight;
      const y = window.scrollY;

      // --- a hero elszáll felfelé és kiélesedésből elmosódik ---
      // a hero első harmadában még nem történik semmi: az effekt csak akkor
      // indul, amikor a szekciót ténylegesen elkezded elhagyni
      const p = clamp((y - h * 0.35) / (h * 0.5), 0, 1);
      const e = easeIn(p);
      heroBg.style.setProperty('--hero-zoom', (1 + e * 0.16).toFixed(4));
      heroInner.style.transform = `translate3d(0, ${(-e * 200).toFixed(1)}px, 0)`;
      heroInner.style.opacity   = clamp(1 - p * 1.3, 0, 1).toFixed(3);
      heroInner.style.filter    = e > 0.008 ? `blur(${(e * 10).toFixed(2)}px)` : 'none';

      // --- a Destinations alulról érkezik, elmosódásból élesedve ---
      const q = easeOut(clamp((y - h * 0.45) / (h * 0.42), 0, 1));
      dest.style.setProperty('--rp', q.toFixed(4));
      // a blur drága: csak amíg tart az átmenet, utána teljesen levesszük
      const blur = (1 - q) * (1 - q) * 14;
      if (Math.abs(blur - lastBlur) > 0.05) {
        dest.style.filter = blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'none';
        lastBlur = blur;
      }
    }

    function onScroll() {
      if (!queued) { queued = true; requestAnimationFrame(frame); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    frame();
  })();

  /* ⚠️ KAPCSOLATI ŰRLAP – NINCS BEKÖTVE.
     A beküldés jelenleg SEHOVA nem megy: se e-mail, se adatbázis, se CRM.
     A megerősítő üzenet csak a felület bemutatására szolgál.
     Élesítés előtt itt kell a tényleges küldést megvalósítani
     (fetch POST a saját backendre / form-szolgáltatóra), és a
     visszajelzést a valódi válaszhoz kötni. */
  (() => {
    const form = document.getElementById('contactForm');
    const note = document.getElementById('formNote');
    if(!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      form.classList.add('was-validated');
      if(!form.checkValidity()){
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
      note.textContent = 'Thank you — an advisor will be in touch within one business day.';
    });
  })();

  /* AI kereső – egyelőre csak a felület. A submit itt szándékosan nem
     csinál semmit, de a beküldést blokkoljuk, különben az Enter
     újratöltené az oldalt, és elrontottnak hatna. Backend bekötésekor
     ezt a blokkot kell a tényleges hívásra cserélni. */
  (() => {
    const form = document.getElementById('aiForm');
    const input = document.getElementById('aiInput');
    if(!form) return;
    const log = document.getElementById('aiChatLog');

    /* ⚠️ ITT KÖTENDŐ BE A VALÓDI ASSZISZTENS.
       Ez az egyetlen pont, amit ki kell cserélni: Vercel + Next.js alatt egy
       route handler hívja a Claude API-t, és ez a függvény a válasz szövegét
       adja vissza. Addig őszintén jelzi, hogy még nem él, és felkínálja a
       tanácsadót / a listakeresést – nem hagyja zsákutcában a felhasználót.
         async function askAssistant(question){
           const r = await fetch('/api/assistant', {
             method:'POST', headers:{'Content-Type':'application/json'},
             body: JSON.stringify({ question })
           });
           return (await r.json()).answer;   // string
         }                                                                  */
    async function askAssistant(question){
      await new Promise(r => setTimeout(r, 1000));
      return { pending:true, question };
    }

    function scrollDown(){ log.scrollTop = log.scrollHeight; }

    function addUser(text){
      const el = document.createElement('div');
      el.className = 'ai-msg ai-msg--user';
      el.textContent = text;
      log.appendChild(el); scrollDown();
    }

    // gépelés-jelző buborék, amit a válasz felülír
    function addTyping(){
      const el = document.createElement('div');
      el.className = 'ai-msg ai-msg--bot';
      el.innerHTML = '<span class="ai-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
      log.appendChild(el); scrollDown();
      return el;
    }

    function fillPending(el, question){
      el.innerHTML =
        '<strong>The assistant goes live with the new site.</strong> '
      + 'Until then your question doesn’t disappear — send it to a senior '
      + 'advisor for a personal reply within one business day, or run it against '
      + 'the current listings.';
      const actions = document.createElement('div');
      actions.className = 'ai-msg-actions';

      const advisor = document.createElement('button');
      advisor.type = 'button';
      advisor.textContent = 'Send to an advisor';
      advisor.addEventListener('click', () => {
        const msg = document.querySelector('#contactForm [name="message"]');
        if (msg) msg.value = question;
        document.getElementById('contact')?.scrollIntoView({block:'start'});
        msg?.focus({preventScroll:true});
      });

      const list = document.createElement('button');
      list.type = 'button'; list.className = 'secondary';
      list.textContent = 'Search the listings';
      list.addEventListener('click', () => {
        location.href = '/properties.html?q=' + encodeURIComponent(question);
      });

      actions.append(advisor, list);
      el.appendChild(actions);
      scrollDown();
    }

    async function send(question){
      addUser(question);
      // az első üzenet után a javaslat-chipek elrejtése (már belépett a beszélgetésbe)
      document.getElementById('aiSuggest')?.remove();
      const typing = addTyping();
      const res = await askAssistant(question);
      if (res && res.pending) fillPending(typing, res.question);
      else { typing.textContent = res; scrollDown(); }
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q){ input.focus(); return; }
      input.value = '';
      send(q);
    });

    // javasolt kérdés: beírja és rögtön el is küldi
    log.querySelectorAll('.ai-chip').forEach(chip => {
      chip.addEventListener('click', () => send(chip.textContent.trim()));
    });
  })();

  // Videó: a YouTube lejátszó csak kattintásra töltődik be (gyorsabb
  // oldalbetöltés, és alapállapotban nincs YouTube-felirat a képen)
  (() => {
    const facade = document.getElementById('videoFacade');
    if(!facade) return;
    facade.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/lp2kfu1g7eI'
                + '?start=1&autoplay=1&rel=0&modestbranding=1';
      frame.title = "Dubai's property market in 2026";
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      const wrap = document.createElement('div');
      wrap.className = 'feature-video';
      wrap.appendChild(frame);
      facade.replaceWith(wrap);
    }, { once: true });
  })();

  // Properties mega menü: desktopon hoverre nyílik, érintésen/billentyűvel kattintásra
  (() => {
    const zone  = document.getElementById('headerOverlay');
    const btn   = document.getElementById('propertiesBtn');
    const touch = window.matchMedia('(hover:none)');
    let open = false;

    const set = v => {
      open = v;
      zone.classList.toggle('nav-open', v);
      // a homályosító réteg a fejlécen kívül van, ezért kell a body-n is jelölni
      document.body.classList.toggle('nav-open', v);
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
    };

    btn.addEventListener('click', e => { e.preventDefault(); set(!open); });
    btn.addEventListener('mouseenter', () => { if(!touch.matches) set(true); });
    // a panel a DOM-ban a zone gyereke, így a bele mozgás nem zárja be
    zone.addEventListener('mouseleave', () => { if(!touch.matches) set(false); });
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && open){ set(false); btn.focus(); }
    });
    document.addEventListener('click', e => {
      if(open && !zone.contains(e.target)) set(false);
    });
    // Tab-bal kilépve a menüből záruljon be
    zone.addEventListener('focusout', e => {
      if(open && !zone.contains(e.relatedTarget)) set(false);
    });
  })();

  /* Mérföldkövek: belépő animáció + felszámláló.
     A rejtett kezdőállapotot itt kapcsoljuk be, hogy JS nélkül is látszódjon
     a szekció (lásd .stats-anim a stíluslapban). */
  (() => {
    const band = document.querySelector('.stats-band');
    if (!band) return;

    const values = [...band.querySelectorAll('.stat-value')].map(el => {
      // a szám a suffix ELŐTTI szövegcsomó – a "+" és az "m²" nem tartozik bele
      const node = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      return node ? { node, to: parseInt(node.textContent.replace(/\D/g, ''), 10) } : null;
    }).filter(v => v && !isNaN(v.to));

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) { band.classList.add('is-in'); return; }

    band.classList.add('stats-anim');
    values.forEach(v => { v.node.textContent = '0'; });

    const DUR = 1700;
    const easeOut = t => 1 - Math.pow(1 - t, 4);   // gyorsan indul, lágyan áll meg

    function countUp() {
      // az időzítést az ELSŐ kirajzolt képkockától mérjük: ha a fül közben
      // háttérben van, a rAF áll, és egy előre rögzített kezdőidővel a
      // számláló a visszatéréskor egyből a végértékre ugrana
      let start = null;
      const tick = now => {
        if (start === null) start = now;
        const t = Math.min((now - start) / DUR, 1);
        const k = easeOut(t);
        values.forEach(v => {
          v.node.textContent = Math.round(v.to * k).toLocaleString('en-US');
        });
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();                    // egyszer fut le, nem ismétlődik
      band.classList.add('is-in');
      // a számok a fejléc megjelenése után indulnak
      setTimeout(countUp, 260);
    }, { threshold: 0.3 });

    io.observe(band);
  })();

  // Hamburger: teljes képernyős menü. A fejlécből mobilon kikerül a
  // navigáció, ezért ez az egyetlen útja a menüpontoknak – nem lehet néma.
  (() => {
    const btn   = document.getElementById('hamburger');
    const menu  = document.getElementById('mobileMenu');
    const close = document.getElementById('mmClose');
    const backdrop = document.getElementById('mmBackdrop');
    if (!btn || !menu) return;

    let opener = null;

    const stops = () => [close, ...menu.querySelectorAll('a')];

    const onKey = e => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      // fókuszcsapda: a réteg mögé nem lehet kitabolni
      const f = stops();
      const i = f.indexOf(document.activeElement);
      const next = e.shiftKey ? f[(i - 1 + f.length) % f.length] : f[(i + 1) % f.length];
      e.preventDefault();
      next.focus();
    };

    function setOpen(v) {
      menu.hidden = !v;
      if (backdrop) backdrop.hidden = !v;
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      document.body.classList.toggle('menu-open', v);
      if (v) {
        opener = document.activeElement;
        close.focus();
        document.addEventListener('keydown', onKey);
      } else {
        document.removeEventListener('keydown', onKey);
        if (opener) opener.focus();
      }
    }

    btn.addEventListener('click', () => setOpen(menu.hidden));
    close.addEventListener('click', () => setOpen(false));
    // a tompított háttérre kattintva is záruljon – a fiók csak ráúszik az oldalra
    backdrop?.addEventListener('click', () => setOpen(false));
    // horgonyra kattintva záruljon, különben a réteg takarná a célt
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  })();

  // Trending cards
  const trend = [
    {price:"$1,020,694", title:"Chalet in Santa Cristina D'Aro, Catalonia, Spain", img:1},
    {price:"$8,384,277", title:"Villa in Cernobbio, Lombardy, Italy", img:2, badge:"Video"},
    {price:"$583,254", title:"Apartment in Santa Eularia Des Riu, Balearic Islands, Spain", img:3},
    {price:"$1,166,508", title:"House in Mauritius", img:4},
    {price:"$3,809,378", title:"Finca in Campos, Balearic Islands, Spain", img:5, badge:"Video"},
    {price:"$318,984", title:"House in Moreton, England", img:6, badge:"Video"},
    {price:"$3,425,598", title:"Villa in Messen, Solothurn, Switzerland", img:1, sub:"Directly from developer"},
    {price:"$1,549,802", title:"Villa in Playa Flamingo, Guanacaste Province, Costa Rica", img:2, badge:"Video"}
  ];
  const trendGrid = document.getElementById('trendGrid');
  if (trendGrid) trend.forEach(t=>{
    const card = document.createElement('div');
    card.className = 'trend-card';
    card.innerHTML = `
      <div class="trend-thumb swatch" style="background-image:url('/images/trending-${t.img}.jpg')">
        ${t.badge ? `<div class="badge">${t.badge}</div>` : ''}
      </div>
      <div class="trend-price">${t.price}</div>
      <div class="trend-title">${t.title}</div>
      ${t.sub ? `<div class="trend-sub">${t.sub}</div>` : ''}
    `;
    trendGrid.appendChild(card);
  });

/* WhatsApp widget (főoldal): kártya nyitás/zárás, Esc és kívülre kattintás zár. */
(function () {
  const widget = document.getElementById('waWidget');
  if (!widget) return;
  const fab = document.getElementById('waFab');
  const card = document.getElementById('waCard');
  const close = document.getElementById('waClose');
  // a betöltés utáni első pillanatban ne ugorjon be – kis késleltetéssel jön
  setTimeout(() => widget.classList.add('is-ready'), 1200);
  // fókusz csak billentyűs nyitásnál ugrik a gombra (egérnél ne villanjon keret)
  const setOpen = (open, moveFocus) => {
    card.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    if (open && moveFocus) card.querySelector('.wa-start').focus({ preventScroll: true });
  };
  fab.addEventListener('click', e => setOpen(card.hidden, e.detail === 0));
  close.addEventListener('click', () => { setOpen(false); fab.focus(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !card.hidden) { setOpen(false); fab.focus(); }
  });
  document.addEventListener('click', e => {
    if (!card.hidden && !widget.contains(e.target)) setOpen(false);
  });
})();
