/* Cikkoldal: megosztás. Ugyanaz a minta, mint a listing oldalon –
   natív megosztó, ha van, különben vágólap. */
(function () {
  const btn = document.getElementById('articleShare');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const data = { title: document.title, url: location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(location.href);
      flash('Link copied');
    } catch (e) {
      /* a felhasználó megszakította a megosztást – nem hiba */
      if (e && e.name === 'AbortError') return;
      flash('Could not copy the link');
    }
  });

  function flash(text) {
    const old = btn.nextElementSibling;
    if (old && old.classList.contains('share-note')) old.remove();
    const n = document.createElement('span');
    n.className = 'share-note';
    n.setAttribute('role', 'status');
    n.textContent = text;
    btn.after(n);
    setTimeout(() => n.remove(), 2600);
  }
})();
