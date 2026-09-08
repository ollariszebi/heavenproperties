/* News & Media: kategóriaszűrő.
   A szűrés kliensoldali és a meglévő kártyákon dolgozik – nincs újratöltés,
   és a lista sorrendje sem változik. */
(function () {
  const filters = document.getElementById('newsFilters');
  const grid    = document.getElementById('newsGrid');
  const empty   = document.getElementById('newsEmpty');
  if (!filters || !grid) return;

  const cards = [...grid.querySelectorAll('.news-card')];

  function apply(cat) {
    let shown = 0;
    cards.forEach(c => {
      const match = cat === 'all' || c.dataset.cat === cat;
      c.hidden = !match;
      if (match) shown++;
    });
    empty.hidden = shown > 0;
    filters.querySelectorAll('.news-filter').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
  }

  filters.addEventListener('click', e => {
    const b = e.target.closest('.news-filter');
    if (b) apply(b.dataset.cat);
  });
})();
