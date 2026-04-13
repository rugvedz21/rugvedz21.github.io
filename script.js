/* ===================================
   RUGVED ZAMBARE - PORTFOLIO JS
   =================================== */

// Project Data
const projects = {
  1: {
    title: 'AI Assignment Grading System',
    meta: 'Machine Learning &bull; 2025',
    description: 'An AI-powered grading system using deep learning to automatically classify student assignments as correct or incorrect. Built with PyTorch and ResNet18 for fast batch processing and intelligent feedback.',
    tags: ['PyTorch', 'ResNet18', 'CNN', 'Transfer Learning', 'Python'],
    details: 'This project streamlines educational grading by leveraging computer vision and transfer learning to analyze assignment submissions with 85-95% accuracy. The system features confidence-based quality control, concept gap identification, and batch processing capabilities that reduce grading time by 80% while maintaining consistent evaluation standards across all submissions.',
    links: { github: 'https://github.com/rugvedz21' }
  },
  2: {
    title: 'Local Music Player',
    meta: 'Full Stack &bull; 2024',
    description: 'A Spotify-inspired music player application with a sleek, modern interface. Features include playlist management, album art display, and intuitive playback controls.',
    tags: ['JavaScript', 'HTML/CSS', 'Web Audio API', 'UI Design'],
    details: 'A comprehensive music player built from scratch featuring playlist creation and management, album art display, smooth animations, and responsive controls for play, pause, skip, and volume. The UI is designed for a vibrant and engaging user experience while maintaining a cohesive visual identity.',
    links: { github: 'https://github.com/rugvedz21' }
  },
  3: {
    title: 'DWLR Flood Alert System',
    meta: 'Data Analysis &bull; 2024',
    description: 'Anomaly detection system that analyzes DWLR water-level data using Z-score based threshold detection, triggering automated alerts when levels exceed thresholds.',
    tags: ['Python', 'Pandas', 'Z-Score', 'SMTP', 'Data Analysis'],
    details: 'Designed and implemented a statistical anomaly detection pipeline for real-time water level monitoring. The system processes DWLR sensor data, applies Z-score based anomaly detection to identify dangerous water levels, and automatically triggers email alerts via SMTP when thresholds are breached. Built for reliability and early warning in flood-prone regions.',
    links: { github: 'https://github.com/rugvedz21' }
  },
  4: {
    title: 'Grain Color Sorter',
    meta: 'Computer Vision &bull; 2024',
    description: 'Computer vision system for grain classification using image processing and CNN models, featuring automated color detection, segmentation, and type identification.',
    tags: ['Python', 'OpenCV', 'CNN', 'Image Processing', 'NumPy'],
    details: 'This project implements a grain color sorting system that utilizes computer vision techniques and convolutional neural networks (CNNs) to classify grains based on their color. The system processes images of grains, applies image processing algorithms for color detection and segmentation, and uses a trained CNN model to identify the type of grain. Designed to improve efficiency and accuracy in agricultural sorting processes.',
    links: { github: 'https://github.com/rugvedz21' }
  }
};

/* ===================================
   LOADING
   =================================== */

window.addEventListener('load', () => {
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('hidden');
  }, 600);
});

/* ===================================
   TYPING ANIMATION
   =================================== */

const roles = [
  'Machine Learning Developer',
  'Computer Vision Enthusiast',
  'Python Developer',
  'CS Student & Builder'
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedElement = document.getElementById('typed-text');

function typeEffect() {
  if (!typedElement) return;

  const currentRole = roles[roleIndex];

  if (isDeleting) {
    typedElement.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedElement.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? 40 : 80;

  if (!isDeleting && charIndex === currentRole.length) {
    speed = 2000; // Pause at end
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    speed = 400;
  }

  setTimeout(typeEffect, speed);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(typeEffect, 800);
});

/* ===================================
   NAVIGATION
   =================================== */

window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
});

function scrollToSection(sectionId) {
  if (event) event.preventDefault();
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Close mobile menu if open
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    if (navLinks) navLinks.classList.remove('mobile-active');
    if (hamburger) hamburger.classList.remove('active');
  }
}

/* ===================================
   MOBILE MENU
   =================================== */

function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (navLinks && hamburger) {
    navLinks.classList.toggle('mobile-active');
    hamburger.classList.toggle('active');
  }
}

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (navLinks && hamburger &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target) &&
      navLinks.classList.contains('mobile-active')) {
    navLinks.classList.remove('mobile-active');
    hamburger.classList.remove('active');
  }
});

/* ===================================
   MODAL
   =================================== */

function openModal(projectId) {
  const project = projects[projectId];
  const modal = document.getElementById('projectModal');
  const modalContent = document.getElementById('modalContent');

  if (!modal || !modalContent || !project) return;

  modalContent.innerHTML = `
    <div class="project-meta" style="margin-bottom: 0.75rem;">${project.meta}</div>
    <h2 style="font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; margin-bottom: 1.25rem; letter-spacing: -0.5px;">${project.title}</h2>
    <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 1rem; font-size: 1rem;">${project.description}</p>
    <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 1.5rem; font-size: 0.92rem;">${project.details}</p>
    <div style="margin-bottom: 1.5rem;">
      <h4 style="color: var(--accent); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 0.75rem; font-weight: 600;">Tech Stack</h4>
      <div class="project-tags">
        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
      ${project.links.github ? `<a href="${project.links.github}" target="_blank" class="btn btn-primary" style="padding: 0.7rem 1.5rem; font-size: 0.82rem;">View on GitHub</a>` : ''}
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'projectModal') closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ===================================
   SCROLL ANIMATIONS
   =================================== */

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll(
    '.project-card, .section-header, .about-content, .about-image, .skill-category, .timeline-item, .contact-card, .contact-form'
  );
  elements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
});

/* ===================================
   TIME DISPLAY
   =================================== */

function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeElement = document.getElementById('localTime');
  if (timeElement) {
    const offset = -now.getTimezoneOffset() / 60;
    const gmtOffset = offset >= 0 ? `+${offset}` : offset;
    timeElement.textContent = `Local Time: ${hours}:${minutes} GMT${gmtOffset}`;
  }
}

updateTime();
setInterval(updateTime, 60000);

/* ===================================
   CONTACT FORM
   =================================== */

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Simulate sending (replace with actual form backend like Formspree/Netlify)
  setTimeout(() => {
    btn.textContent = 'Message Sent!';
    btn.style.background = 'var(--success)';
    form.reset();

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 2500);
  }, 1000);
}

/* ===================================
   PARALLAX (subtle)
   =================================== */

let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero-content');
      if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
      }
      ticking = false;
    });
    ticking = true;
  }
});
