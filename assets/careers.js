/* Careers: helyszínszűrő a pozíciólistán. A jelentkezés a pozíció aloldalán történik. */
(function () {
  const filters = document.getElementById('jobFilters');
  const jobs = [...document.querySelectorAll('.job')];
  filters?.addEventListener('click', e => {
    const b = e.target.closest('.news-filter');
    if (!b) return;
    const loc = b.dataset.loc;
    jobs.forEach(j => { j.hidden = !(loc === 'all' || j.dataset.loc === loc); });
    filters.querySelectorAll('.news-filter').forEach(x =>
      x.setAttribute('aria-pressed', String(x === b)));
  });
})();

/* Banner-videó: a kezdőkép (a videó saját első képe) fölé csak akkor
   úsztatjuk be, amikor már valóban lejátszik.
   Minőség: szándékosan "auto" (adaptív). A 1080p API-s kényszerítése mért
   eredmény alapján akadozást okozott (20 mp alatt 1,5 mp videó), mert a
   lejátszó nem tud a sávszélességhez igazodni. */
(function () {
  const wrap = document.querySelector('.hero-video');
  const iframe = wrap && wrap.querySelector('iframe');
  if (!iframe) return;
  const reveal = () => wrap.classList.add('is-playing');

  // Player API nélkül nem tudjuk figyelni a lejátszást – egy idő után mutatjuk
  if (!window.Vimeo || !window.Vimeo.Player) { setTimeout(reveal, 7000); return; }
  const player = new window.Vimeo.Player(iframe);

  // egy kis ráhagyás, hogy az adaptív minőség az első pillanatok után feljebb lépjen
  const onTime = ({ seconds }) => {
    if (seconds < 1) return;
    reveal();
    player.off('timeupdate', onTime);
  };
  player.on('timeupdate', onTime);

  /* Biztonsági háló: ha az események elmaradnának, de a videó megy, akkor is
     megjelenik. El sem indult videót nem mutatunk – marad a kezdőkép. */
  setTimeout(() => {
    if (wrap.classList.contains('is-playing')) return;
    player.getCurrentTime().then(t => { if (t > 0) reveal(); }).catch(() => {});
  }, 9000);
})();
