/* ===================================
   CREATIVE.DEV PORTFOLIO - JAVASCRIPT
   Interactive Functionality
   =================================== */

// Project Data
const projects = {
  1: {
    title: 'AI Assignment Grading System',
    meta: 'Machine Learning • 2025',
    description: 'An AI-powered grading system using deep learning to automatically classify student assignments as correct or incorrect. Built with PyTorch and ResNet18 for fast batch processing and intelligent feedback.',
    tags: ['PYTORCH', 'RESNET18', 'CNN ', 'TRANSFER LEARNIN'],
    details: 'This project streamlines educational grading by leveraging computer vision and transfer learning to analyze assignment submissions with 85-95% accuracy. The system features confidence-based quality control, concept gap identification, and batch processing capabilities that reduce grading time by 80% while maintaining consistent evaluation standards across all submissions.'
  },
  2: {
    title: 'Local Music Player (Spotify-like)',
    meta: 'Design • 2024',
    description: 'Basic music player application with a sleek, modern interface inspired by Spotify. Features include playlist management, album art display, and intuitive controls for play, pause, skip, and volume.',
    tags: ['Branding', 'Design', 'Identity', 'Guidelines'],
    details: 'A comprehensive branding project that includes logo design, color palette, typography, and a style guide for a local music player application. The design focuses on creating a vibrant and engaging user experience while maintaining a cohesive visual identity that resonates with music lovers.'
  },
3: {
  title: 'DWLR Flood Alert System',
  meta: 'Development • 2024',
  description: 'Analyzed DWLR water-level data using Z-score based threshold detection; triggers automated alerts when levels exceed anomaly thresholds',
  tags: ['Python', 'Data Analysis', 'Z-Score Anomaly Detection', 'SMTP'],
    details: 'Enterprise-grade application handling thousands of digital assets with advanced search, filtering, and team collaboration features. The platform includes real-time updates, version control, advanced permissions system, and integrations with popular design tools and cloud storage services.'
  },
  4: {
    title: 'Grain Color Sorter',
    meta: 'Neural Networks • 2024',
    description: 'Computer vision system for grain classification using image processing and CNN models, featuring automated color detection, segmentation, and type identification..',
    tags: ['Python', 'OpenCV', 'CNN', 'Image Processing'],
    details: 'This project implements a grain color sorting system that utilizes computer vision techniques and convolutional neural networks (CNNs) to classify grains based on their color. The system processes images of grains, applies image processing algorithms for color detection and segmentation, and uses a trained CNN model to identify the type of grain. This solution is designed to improve efficiency and accuracy in agricultural sorting processes.'
  }
};

/* ===================================
   INITIALIZATION
   =================================== */

// Loading Screen
window.addEventListener('load', () => {
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
    }
  }, 1000);
});

/* ===================================
   NAVIGATION
   =================================== */

// Navigation Scroll Effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
});

// Smooth Scroll Function
function scrollToSection(sectionId) {
  event.preventDefault();
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ===================================
   MODAL FUNCTIONALITY
   =================================== */

// Open Modal with Project Details
function openModal(projectId) {
  const project = projects[projectId];
  const modal = document.getElementById('projectModal');
  const modalContent = document.getElementById('modalContent');
  
  if (!modal || !modalContent || !project) return;
  
  modalContent.innerHTML = `
    <div class="project-meta" style="margin-bottom: 1rem;">${project.meta}</div>
    <h2 class="project-title" style="font-size: 2.5rem; margin-bottom: 1.5rem;">${project.title}</h2>
    <p style="color: var(--vintage-muted); line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.1rem;">${project.description}</p>
    <p style="color: var(--vintage-muted); line-height: 1.8; margin-bottom: 2rem; font-size: 1rem;">${project.details}</p>
    <div style="margin-bottom: 2rem;">
      <h4 style="color: var(--vintage-purple); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem;">Technologies Used</h4>
      <div class="project-tags">
        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 2rem;">
      <button class="btn btn-primary" style="padding: 0.8rem 2rem; font-size: 0.85rem;">View Live Project →</button>
      <button class="btn btn-secondary" style="padding: 0.8rem 2rem; font-size: 0.85rem;">View Case Study</button>
    </div>
  `;
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Close modal on background click
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'projectModal') {
        closeModal();
      }
    });
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

/* ===================================
   TIME DISPLAY
   =================================== */

// Local Time Display
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeElement = document.getElementById('localTime');
  
  if (timeElement) {
    // Get timezone offset
    const offset = -now.getTimezoneOffset() / 60;
    const gmtOffset = offset >= 0 ? `+${offset}` : offset;
    timeElement.textContent = `Local Time: ${hours}:${minutes} GMT${gmtOffset}`;
  }
}

// Update time immediately and then every minute
updateTime();
setInterval(updateTime, 60000);

/* ===================================
   SCROLL ANIMATIONS
   =================================== */

// Intersection Observer for Scroll Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Observe all project cards and sections
  const elements = document.querySelectorAll('.project-card, .section-header, .about-content, .stat-item');
  
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

/* ===================================
   PARALLAX EFFECTS
   =================================== */

// Parallax effect for hero section
let ticking = false;

function updateParallax() {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero-content');
  
  if (hero && scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    hero.style.opacity = 1 - (scrolled / window.innerHeight);
  }
  
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

/* ===================================
   CURSOR EFFECTS (Optional Enhancement)
   =================================== */

// Custom cursor for interactive elements
function initCustomCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid var(--vintage-purple);
    border-radius: 50%;
    pointer-events: none;
    z-index: 10001;
    transition: transform 0.2s ease;
    display: none;
  `;
  document.body.appendChild(cursor);

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.display = 'block';
  });

  function animateCursor() {
    const speed = 0.2;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Scale cursor on hover over interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .project-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'scale(1)';
    });
  });
}

// Initialize custom cursor on desktop only
if (window.innerWidth > 768) {
  document.addEventListener('DOMContentLoaded', initCustomCursor);
}

/* ===================================
   FORM HANDLING (for contact forms)
   =================================== */

// Contact form submission handler (if you add a form later)
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Add your form submission logic here
  console.log('Form submitted:', Object.fromEntries(formData));
  
  // Show success message
  alert('Thank you for your message! I\'ll get back to you soon.');
  form.reset();
}

/* ===================================
   PROJECT FILTERING (Optional Enhancement)
   =================================== */

// Filter projects by category
function filterProjects(category) {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    if (category === 'all') {
      card.style.display = 'block';
      card.style.animation = 'fadeInUp 0.5s ease';
    } else {
      const projectMeta = card.querySelector('.project-meta').textContent.toLowerCase();
      if (projectMeta.includes(category.toLowerCase())) {
        card.style.display = 'block';
        card.style.animation = 'fadeInUp 0.5s ease';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

/* ===================================
   PERFORMANCE OPTIMIZATIONS
   =================================== */

// Lazy load images when they enter viewport
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
});

/* ===================================
   MOBILE MENU (Optional Enhancement)
   =================================== */

// Mobile menu toggle
function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('mobile-active');
  }
}

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/* ===================================
   CONSOLE MESSAGE
   =================================== */

// Fun console message for developers
console.log('%cWelcome to my portfolio! 🚀', 'color: #7f0df2; font-size: 20px; font-weight: bold;');
console.log('%cLike what you see? Let\'s work together!', 'color: #e6a756; font-size: 14px;');
console.log('%cFind me at: rugvedzambare05@gmail.com', 'color: #94a3b8; font-size: 12px;');

/* ===================================
   EXPORT FUNCTIONS (if using modules)
   =================================== */

// If you want to use ES6 modules, uncomment these:
// export { scrollToSection, openModal, closeModal, filterProjects };