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
