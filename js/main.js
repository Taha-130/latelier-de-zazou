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
const selectOffre = document.getElementById('select-type-offre');
const autreOffre  = document.getElementById('autre-detail-offre');

if (selectOffre && autreOffre) {
  selectOffre.addEventListener('change', () => {
    const isAutre = selectOffre.value === 'Autre';
    autreOffre.classList.toggle('hidden', !isAutre);
    if (!isAutre) autreOffre.querySelector('input').value = '';
  });
}


/* ────────────────────────────────────────────────────────────
   4. VALIDATION — téléphone 10 chiffres + email format
──────────────────────────────────────────────────────────── */

/* Affiche un message d'erreur sous le champ */
function showError(input, msg) {
  clearError(input);
  input.style.borderBottomColor = '#c0392b';
  const err = document.createElement('p');
  err.className   = 'field-error';
  err.textContent = msg;
  err.style.cssText = 'font-family:Montserrat,sans-serif;font-size:10px;color:#c0392b;margin-top:4px;font-weight:300;';
  input.parentNode.appendChild(err);
}

function clearError(input) {
  input.style.borderBottomColor = '';
  const prev = input.parentNode.querySelector('.field-error');
  if (prev) prev.remove();
}

/* Efface l'erreur dès que l'utilisateur retape */
function watchField(input) {
  input.addEventListener('input', () => clearError(input), { once: true });
}

function validateForm(form) {
  let valid = true;

  /* Champs required vides */
  form.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      showError(field, 'Ce champ est obligatoire.');
      watchField(field);
      valid = false;
    }
  });

  /* Format e-mail */
  const emailField = form.querySelector('[type="email"]');
  if (emailField && emailField.value.trim()) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailField.value.trim());
    if (!emailOk) {
      showError(emailField, 'Adresse e-mail invalide.');
      watchField(emailField);
      valid = false;
    }
  }

  /* Téléphone : 10 chiffres (espaces / tirets / points acceptés à la saisie) */
  const telField = form.querySelector('[type="tel"]');
  if (telField && telField.value.trim()) {
    const digits = telField.value.replace(/[\s.\-]/g, '');
    const telOk  = /^0[1-9]\d{8}$/.test(digits);
    if (!telOk) {
      showError(telField, 'Numéro invalide — 10 chiffres attendus (ex : 06 12 34 56 78).');
      watchField(telField);
      valid = false;
    }
  }

  return valid;
}


/* ────────────────────────────────────────────────────────────
   5. ENVOI DU FORMULAIRE VIA FORMSPREE
──────────────────────────────────────────────────────────── */
const formOffre = document.getElementById('form-offre');
const successEl = document.getElementById('form-success');

if (formOffre) {
  const btn          = formOffre.querySelector('[type="submit"]');
  const originalText = btn.textContent;

  formOffre.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validateForm(formOffre)) return;

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
