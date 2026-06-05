/* ============================================================
   L'Atelier de Zazou — JavaScript principal
============================================================ */

const FORMSPREE_URL = 'https://formspree.io/f/xeeweaeq';

/* ────────────────────────────────────────────────────────────
   1. NAVBAR — transparent → fond crème + ombre au scroll
──────────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 70;
  navbar.classList.toggle('bg-cream/96',      scrolled);
  navbar.classList.toggle('shadow-sm',         scrolled);
  navbar.classList.toggle('backdrop-blur-sm',  scrolled);
  navbar.classList.toggle('py-3',  scrolled);
  navbar.classList.toggle('py-5', !scrolled);
}, { passive: true });


/* ────────────────────────────────────────────────────────────
   2. BURGER MENU mobile
──────────────────────────────────────────────────────────── */
const burgerBtn  = document.getElementById('burger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const b1 = document.getElementById('b1');
const b2 = document.getElementById('b2');
const b3 = document.getElementById('b3');
let menuOpen = false;

function toggleMenu(force) {
  menuOpen = force !== undefined ? force : !menuOpen;
  mobileMenu.classList.toggle('translate-x-full', !menuOpen);
  mobileMenu.classList.toggle('translate-x-0',     menuOpen);
  if (menuOpen) {
    b1.style.transform = 'rotate(45deg) translate(4px, 4px)';
    b2.style.opacity   = '0';
    b3.style.transform = 'rotate(-45deg) translate(4px, -4px)';
  } else {
    b1.style.transform = '';
    b2.style.opacity   = '';
    b3.style.transform = '';
  }
}

burgerBtn.addEventListener('click', () => toggleMenu());
document.querySelectorAll('.nav-close').forEach(el =>
  el.addEventListener('click', () => toggleMenu(false))
);


/* ────────────────────────────────────────────────────────────
   3. CHAMP "PRÉCISER" si type d'événement = Autre
──────────────────────────────────────────────────────────── */
const selectOffre   = document.getElementById('select-type-offre');
const autreOffre    = document.getElementById('autre-detail-offre');

if (selectOffre && autreOffre) {
  selectOffre.addEventListener('change', () => {
    const isAutre = selectOffre.value === 'Autre';
    autreOffre.classList.toggle('hidden', !isAutre);
    if (!isAutre) autreOffre.querySelector('input').value = '';
  });
}


/* ────────────────────────────────────────────────────────────
   4. ENVOI DU FORMULAIRE VIA FORMSPREE
      Endpoint : https://formspree.io/f/xnjrlvpa
      Les messages arrivent à : Latelierdezazou@gmail.com
──────────────────────────────────────────────────────────── */
const formOffre = document.getElementById('form-offre');
const successEl = document.getElementById('form-success');

if (formOffre) {
  const btn          = formOffre.querySelector('[type="submit"]');
  const originalText = btn.textContent;

  formOffre.addEventListener('submit', async e => {
    e.preventDefault();

    btn.textContent = 'Envoi en cours…';
    btn.disabled    = true;

    try {
      const response = await fetch(FORMSPREE_URL, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(formOffre),
      });

      if (response.ok) {
        formOffre.classList.add('hidden');
        successEl.classList.remove('hidden');

        setTimeout(() => {
          successEl.classList.add('hidden');
          formOffre.classList.remove('hidden');
          formOffre.reset();
          autreOffre && autreOffre.classList.add('hidden');
          btn.textContent = originalText;
          btn.disabled    = false;
        }, 7000);

      } else {
        btn.textContent = 'Une erreur est survenue — réessayez';
        btn.disabled    = false;
      }

    } catch {
      btn.textContent = 'Erreur réseau — vérifiez votre connexion';
      btn.disabled    = false;
    }
  });
}
