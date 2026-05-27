/* ============================================================
   L'Atelier de Zazou — JavaScript principal
============================================================ */

const FORMSPREE_URL = 'https://formspree.io/f/xnjrlvpa';

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
   3. TOGGLE FORMULAIRE (Offre ↔ Avis)
      + déclenchement depuis les CTAs hero/galerie
──────────────────────────────────────────────────────────── */
const tabOffre  = document.getElementById('tab-offre');
const tabAvis   = document.getElementById('tab-avis');
const formOffre = document.getElementById('form-offre');
const formAvis  = document.getElementById('form-avis');
const successEl = document.getElementById('form-success');

function showTab(tab) {
  successEl.classList.add('hidden');
  if (tab === 'offre') {
    formOffre.classList.remove('hidden');
    formAvis.classList.add('hidden');
    tabOffre.classList.add('is-active');
    tabAvis.classList.remove('is-active');
  } else {
    formAvis.classList.remove('hidden');
    formOffre.classList.add('hidden');
    tabAvis.classList.add('is-active');
    tabOffre.classList.remove('is-active');
  }
}

tabOffre.addEventListener('click', () => showTab('offre'));
tabAvis.addEventListener('click',  () => showTab('avis'));

document.querySelectorAll('.cta-link[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    if (target) setTimeout(() => showTab(target), 350);
  });
});


/* ────────────────────────────────────────────────────────────
   4. NOTATION PAR ÉTOILES
──────────────────────────────────────────────────────────── */
const stars     = document.querySelectorAll('#star-row .star');
const ratingVal = document.getElementById('rating-val');

function renderStars(upTo) {
  stars.forEach((s, i) => s.classList.toggle('lit', i < upTo));
}

stars.forEach(star => {
  const v = parseInt(star.dataset.v);
  star.addEventListener('mouseover',  () => renderStars(v));
  star.addEventListener('mouseleave', () => renderStars(parseInt(ratingVal.value) || 0));
  star.addEventListener('click', () => {
    ratingVal.value = v;
    renderStars(v);
  });
});

document.getElementById('star-row').addEventListener('mouseleave', () => {
  renderStars(parseInt(ratingVal.value) || 0);
});


/* ────────────────────────────────────────────────────────────
   5. CHAMP "PRÉCISER" si type d'événement = Autre
──────────────────────────────────────────────────────────── */
function watchAutreSelect(selectId, detailId) {
  const sel    = document.getElementById(selectId);
  const detail = document.getElementById(detailId);
  if (!sel || !detail) return;
  sel.addEventListener('change', () => {
    const isAutre = sel.value === 'Autre';
    detail.classList.toggle('hidden', !isAutre);
    if (!isAutre) detail.querySelector('input').value = '';
  });
}
watchAutreSelect('select-type-offre', 'autre-detail-offre');
watchAutreSelect('select-type-avis',  'autre-detail-avis');


/* ────────────────────────────────────────────────────────────
   6. ENVOI DES FORMULAIRES VIA FORMSPREE
      Endpoint : https://formspree.io/f/xnjrlvpa
      Les messages arrivent à : Latelierdezazou@gmail.com
──────────────────────────────────────────────────────────── */
[formOffre, formAvis].forEach(form => {
  const btn          = form.querySelector('[type="submit"]');
  const originalText = btn.textContent;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    /* État "chargement" */
    btn.textContent = 'Envoi en cours…';
    btn.disabled    = true;

    try {
      const response = await fetch(FORMSPREE_URL, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(form),
      });

      if (response.ok) {
        /* ✅ Succès — affiche le message de confirmation */
        form.classList.add('hidden');
        successEl.classList.remove('hidden');

        /* Réinitialisation après 7 secondes */
        setTimeout(() => {
          successEl.classList.add('hidden');
          form.classList.remove('hidden');
          form.reset();
          renderStars(0);
          ratingVal.value    = 0;
          btn.textContent    = originalText;
          btn.disabled       = false;
          /* Refermer les champs "Autre" si ouverts */
          document.querySelectorAll('#autre-detail-offre, #autre-detail-avis')
            .forEach(d => d.classList.add('hidden'));
        }, 7000);

      } else {
        /* ❌ Erreur Formspree */
        btn.textContent = 'Une erreur est survenue — réessayez';
        btn.disabled    = false;
        const data = await response.json().catch(() => ({}));
        console.error('Formspree error:', data);
      }

    } catch (networkErr) {
      /* ❌ Erreur réseau */
      btn.textContent = 'Erreur réseau — vérifiez votre connexion';
      btn.disabled    = false;
      console.error('Network error:', networkErr);
    }
  });
});
