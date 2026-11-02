/**
 * APP.JS — 7 cards deck with Donate QR Modal
 * Generous space between title and turntable carousel
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ====================================================
     TURNTABLE DECK
  ==================================================== */
  const deckWrap = document.getElementById('main-deck-wrap');
  const deckEl   = document.getElementById('main-deck');
  const cards    = deckEl ? [...deckEl.querySelectorAll('.card')] : [];

  const TOTAL      = cards.length;
  const ANGLE_STEP = 13.5; // degrees per step
  const X_STEP     = 128;  // px horizontal displacement

  let current  = 0;
  let dragX    = 0;
  let startX   = 0;
  let dragging = false;

  /* Position cards radially with generous space from top header */
  function updatePositions() {
    cards.forEach((card, idx) => {
      let diff = idx - current;
      // Circular wrap around
      if (diff >  TOTAL / 2) diff -= TOTAL;
      if (diff < -TOTAL / 2) diff += TOTAL;

      const abs = Math.abs(diff);

      if (diff === 0) {
        // Center card: stands out proudly, elevated with healthy space from title
        card.style.transform  = `translateX(0px) translateY(-14px) scale(1.06) rotate(0deg)`;
        card.style.zIndex     = '30';
        card.style.opacity    = '1';
        card.style.filter     = 'brightness(1.03)';
        card.classList.add('is-center');
      } else {
        card.classList.remove('is-center');
        const tx  = diff * X_STEP;
        const ty  = abs * abs * 18 + 14;
        const sc  = Math.max(0.65, 1 - abs * 0.10);
        const rot = diff * ANGLE_STEP;
        const zi  = 20 - abs;
        const br  = Math.max(0.55, 1 - abs * 0.14);
        card.style.transform = `translateX(${tx}px) translateY(${ty}px) scale(${sc}) rotate(${rot}deg)`;
        card.style.zIndex    = zi.toString();
        card.style.opacity   = '1'; // Solid opaque, strictly non-transparent
        card.style.filter    = `brightness(${br})`;
      }
    });
  }

  function next() { current = (current + 1) % TOTAL; updatePositions(); }
  function prev() { current = (current - 1 + TOTAL) % TOTAL; updatePositions(); }
  function goTo(i) { current = ((i % TOTAL) + TOTAL) % TOTAL; updatePositions(); }

  const deck = { update: updatePositions };

  // Initialize deck carousel immediately
  updatePositions();

  /* Card click interactions */
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      if (Math.abs(dragX) > 12) return; // Prevent click while dragging
      if (idx !== current) {
        goTo(idx);
      } else {
        const type = card.dataset.type;
        if (type === 'modal-donate') {
          openDonateModal();
        } else {
          const url = card.dataset.url;
          if (url) window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    });
  });

  /* Mouse drag interaction */
  deckWrap.addEventListener('mousedown', e => {
    dragging = true;
    startX   = e.clientX;
    dragX    = 0;
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    dragX = e.clientX - startX;
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    if (dragX < -38) next();
    else if (dragX > 38) prev();
    dragX = 0;
  });

  /* Touch drag interaction for Mobile & Tablet */
  deckWrap.addEventListener('touchstart', e => {
    dragging = true;
    startX   = e.touches[0].clientX;
    dragX    = 0;
  }, { passive: true });
  deckWrap.addEventListener('touchmove', e => {
    if (!dragging) return;
    dragX = e.touches[0].clientX - startX;
  }, { passive: true });
  deckWrap.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    if (dragX < -34) next();
    else if (dragX > 34) prev();
    dragX = 0;
  });

  /* Mouse wheel with smooth throttle */
  let wheelLock = false;
  deckWrap.addEventListener('wheel', e => {
    e.preventDefault();
    if (wheelLock) return;
    if (e.deltaY > 12 || e.deltaX > 12) next();
    else if (e.deltaY < -12 || e.deltaX < -12) prev();
    wheelLock = true;
    setTimeout(() => { wheelLock = false; }, 180);
  }, { passive: false });

  /* Keyboard arrow navigation */
  document.addEventListener('keydown', e => {
    const donateModal = document.getElementById('donate-modal');
    if (donateModal?.classList.contains('active')) {
      if (e.key === 'Escape') closeDonateModal();
      return;
    }
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });


  /* ====================================================
     DONATE QR MODAL
  ==================================================== */
  const donateModal = document.getElementById('donate-modal');
  const btnCloseDonate = document.getElementById('btn-close-donate');

  function openDonateModal() {
    donateModal?.classList.add('active');
  }

  function closeDonateModal() {
    donateModal?.classList.remove('active');
  }

  btnCloseDonate?.addEventListener('click', closeDonateModal);
  donateModal?.addEventListener('click', e => {
    if (e.target === donateModal) closeDonateModal();
  });

});
