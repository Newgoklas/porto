const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const yearEl = document.getElementById('year');
const revealItems = document.querySelectorAll('.reveal');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

// Jika gambar proyek/sertifikat gagal dimuat (misalnya file belum diunggah
// ke folder /image), tampilkan kotak placeholder yang tetap rapi
// alih-alih ikon broken-image bawaan browser.
document
  .querySelectorAll('.project-media img, .certificate-image img')
  .forEach((img) => {
    img.addEventListener('error', () => {
      img.closest('.project-media, .certificate-image')?.classList.add('img-error');
    });
  });

// Galeri sertifikat mode bertumpuk (stack) yang bisa digeser seperti slide.
const certViewport = document.getElementById('certViewport');

if (certViewport) {
  const certCards = Array.from(certViewport.querySelectorAll('.certificate-card'));
  const certTotal = certCards.length;
  const certCounter = document.getElementById('certCounter');
  const certPrevBtn = document.getElementById('certPrev');
  const certNextBtn = document.getElementById('certNext');

  let certIndex = 0;
  let dragStartX = 0;
  let dragDeltaX = 0;
  let isDragging = false;
  let didDrag = false;

  function renderCertStack() {
    certCards.forEach((card, i) => {
      let offset = i - certIndex;
      if (offset > certTotal / 2) offset -= certTotal;
      if (offset < -certTotal / 2) offset += certTotal;
      const abs = Math.abs(offset);

      if (abs > 3) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.zIndex = '0';
        card.style.transform = 'translate(-50%, -50%) scale(.8)';
        return;
      }

      const scale = 1 - abs * 0.07;
      const liftY = abs * 16;
      const shiftX = offset * 22;
      const rotate = offset * 4;

      card.style.zIndex = String(20 - abs);
      card.style.opacity = abs === 0 ? '1' : String(Math.max(0.15, 0.6 - abs * 0.18));
      card.style.pointerEvents = abs === 0 ? 'auto' : 'none';
      card.style.transform =
        `translate(calc(-50% + ${shiftX}px), calc(-50% + ${liftY}px)) scale(${scale}) rotate(${rotate}deg)`;
    });

    if (certCounter) {
      certCounter.textContent = `${certIndex + 1} / ${certTotal}`;
    }
  }

  function goNext() {
    certIndex = (certIndex + 1) % certTotal;
    renderCertStack();
  }

  function goPrev() {
    certIndex = (certIndex - 1 + certTotal) % certTotal;
    renderCertStack();
  }

  if (certNextBtn) certNextBtn.addEventListener('click', goNext);
  if (certPrevBtn) certPrevBtn.addEventListener('click', goPrev);

  function onPointerDown(event) {
    const frontCard = certCards[certIndex];
    if (!frontCard.contains(event.target)) return;

    isDragging = true;
    didDrag = false;
    dragStartX = event.clientX;
    dragDeltaX = 0;
    frontCard.classList.add('dragging');
    frontCard.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!isDragging) return;
    const frontCard = certCards[certIndex];
    dragDeltaX = event.clientX - dragStartX;

    if (Math.abs(dragDeltaX) > 6) didDrag = true;

    const rotate = dragDeltaX * 0.04;
    frontCard.style.transform =
      `translate(calc(-50% + ${dragDeltaX}px), -50%) rotate(${rotate}deg)`;
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    const frontCard = certCards[certIndex];
    frontCard.classList.remove('dragging');

    const threshold = 70;
    if (dragDeltaX <= -threshold) {
      goNext();
    } else if (dragDeltaX >= threshold) {
      goPrev();
    } else {
      renderCertStack();
    }
    dragDeltaX = 0;
  }

  certViewport.addEventListener('pointerdown', onPointerDown);
  certViewport.addEventListener('pointermove', onPointerMove);
  certViewport.addEventListener('pointerup', onPointerUp);
  certViewport.addEventListener('pointerleave', onPointerUp);

  // Cegah klik pada tautan "Lihat Sertifikat" ter-trigger tidak sengaja
  // saat kartu baru saja digeser (bukan diklik).
  certViewport.addEventListener(
    'click',
    (event) => {
      if (didDrag) {
        event.preventDefault();
        event.stopPropagation();
        didDrag = false;
      }
    },
    true
  );

  renderCertStack();
}