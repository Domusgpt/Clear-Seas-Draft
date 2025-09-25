/*
 * IMMERSIVE EXPERIENCE ACTUALIZER
 * Converts boring text descriptions into actual working animations and interactions
 * Paul Phillips - Clear Seas Solutions LLC
 */

class ImmersiveExperienceActualizer {
  constructor() {
    this.activeAnimations = new Map();
    this.observers = [];
    this.init();
  }

  init() {
    // Replace placeholders with actual working features
    this.activateCounterAnimations();
    this.activateStagedReveals();
    this.activateScrollLocking();
    this.activateCollaborativeBursts();
    this.activateAmbientSystems();
    this.activateResponsiveElements();
  }

  activateCounterAnimations() {
    // Find metric values that need animation
    const metrics = document.querySelectorAll('[data-count], .hero__metrics dd');

    metrics.forEach(metric => {
      if (metric.textContent.includes('//Describe')) {
        // Replace placeholder with actual animated counter
        metric.innerHTML = '<span class="animated-counter" data-target="247" data-prefix="+" data-suffix=" active">0</span>';
      }

      // Animate existing counters
      const counter = metric.querySelector('[data-target], [data-count]');
      if (counter) {
        this.createCounterAnimation(counter);
      }
    });
  }

  createCounterAnimation(element) {
    const target = parseInt(element.dataset.target || element.dataset.count || '100');
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !element.classList.contains('animated')) {
          element.classList.add('animated');
          this.animateCounter(element, target, prefix, suffix);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(element);
    this.observers.push(observer);
  }

  animateCounter(element, target, prefix, suffix) {
    let current = 0;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.floor(target * eased);

      element.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  activateStagedReveals() {
    // Find elements that need staged reveals
    const revealElements = document.querySelectorAll('[data-reveal]');

    revealElements.forEach((element, index) => {
      element.style.cssText += `
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        transition-delay: ${index * 100}ms;
      `;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.2 });

      observer.observe(element);
      this.observers.push(observer);
    });
  }

  activateScrollLocking() {
    // Find scroll-locked showcases and make them work
    const showcases = document.querySelectorAll('[data-stack], .showcase__stack');

    showcases.forEach(showcase => {
      const cards = showcase.querySelectorAll('.stacked-card, [data-stack-card]');
      if (cards.length === 0) return;

      let activeIndex = 0;

      // Style for scroll-locked behavior
      showcase.style.position = 'sticky';
      showcase.style.top = '20px';
      showcase.style.height = '80vh';

      cards.forEach((card, index) => {
        card.style.cssText += `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          opacity: ${index === 0 ? '1' : '0'};
          transform: translateY(${index * 20}px);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: ${cards.length - index};
        `;
      });

      // Scroll-triggered card switching
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const rect = showcase.getBoundingClientRect();
            const scrollProgress = Math.max(0, Math.min(1,
              (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
            ));

            const targetIndex = Math.floor(scrollProgress * cards.length);

            if (targetIndex !== activeIndex && targetIndex >= 0 && targetIndex < cards.length) {
              this.switchCard(cards, activeIndex, targetIndex);
              activeIndex = targetIndex;
            }

            ticking = false;
          });
          ticking = true;
        }
      });
    });
  }

  switchCard(cards, from, to) {
    // Animate out current card
    if (cards[from]) {
      cards[from].style.opacity = '0';
      cards[from].style.transform = 'translateY(-30px) scale(0.95)';
    }

    // Animate in new card
    if (cards[to]) {
      setTimeout(() => {
        cards[to].style.opacity = '1';
        cards[to].style.transform = 'translateY(0) scale(1)';
      }, 200);
    }
  }

  activateCollaborativeBursts() {
    // Convert collaboration placeholders into actual interactive elements
    const collaborationElements = document.querySelectorAll('.collaboration-placeholder, [class*="collaboration"]');

    collaborationElements.forEach(element => {
      if (element.textContent.includes('//')) {
        element.innerHTML = `
          <div class="collaboration-burst">
            <div class="burst-particles"></div>
            <div class="burst-content">
              <span class="burst-icon">⚡</span>
              <span class="burst-text">Active Collaboration</span>
            </div>
          </div>
        `;

        // Add click interaction
        element.addEventListener('click', () => {
          this.createBurstEffect(element);
        });
      }
    });
  }

  createBurstEffect(element) {
    const burst = element.querySelector('.burst-particles');
    if (!burst) return;

    // Create particles
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'burst-particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: hsl(${i * 30}, 70%, 60%);
        border-radius: 50%;
        animation: burst-particle 1s ease-out forwards;
        animation-delay: ${i * 50}ms;
        --angle: ${i * 30}deg;
      `;

      burst.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => particle.remove(), 1000);
    }
  }

  activateAmbientSystems() {
    // Create ambient background effects
    const sections = document.querySelectorAll('section[data-background]');

    sections.forEach(section => {
      const ambientOverlay = document.createElement('div');
      ambientOverlay.className = 'ambient-overlay';
      ambientOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0.1;
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
          rgba(0, 255, 255, 0.3) 0%,
          rgba(255, 0, 255, 0.2) 50%,
          transparent 70%);
        transition: opacity 0.3s ease;
      `;

      section.style.position = 'relative';
      section.appendChild(ambientOverlay);

      // Mouse tracking for ambient effects
      section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        ambientOverlay.style.setProperty('--mouse-x', `${x}%`);
        ambientOverlay.style.setProperty('--mouse-y', `${y}%`);
        ambientOverlay.style.opacity = '0.2';
      });

      section.addEventListener('mouseleave', () => {
        ambientOverlay.style.opacity = '0.1';
      });
    });
  }

  activateResponsiveElements() {
    // Find elements that should respond to cursor/scroll
    const responsiveElements = document.querySelectorAll('[class*="responsive"], .micro-card, .system-card');

    responsiveElements.forEach(element => {
      // Add hover effects
      element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      element.addEventListener('mouseenter', () => {
        element.style.transform = 'translateY(-5px) scale(1.02)';
        element.style.boxShadow = '0 10px 30px rgba(0, 255, 255, 0.2)';
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0) scale(1)';
        element.style.boxShadow = 'none';
      });

      // Add scroll-based scaling
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const scale = entry.intersectionRatio;
          entry.target.style.opacity = Math.max(0.3, scale);
        });
      }, { threshold: [0, 0.2, 0.5, 0.8, 1] });

      observer.observe(element);
      this.observers.push(observer);
    });
  }

  destroy() {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Cancel animations
    this.activeAnimations.forEach(animation => {
      if (animation.cancel) animation.cancel();
    });
    this.activeAnimations.clear();
  }
}

// Add required CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes burst-particle {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(
        calc(cos(var(--angle)) * 50px),
        calc(sin(var(--angle)) * 50px)
      ) scale(0);
      opacity: 0;
    }
  }

  .collaboration-burst {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1));
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .collaboration-burst:hover {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2));
    border-color: rgba(0, 255, 255, 0.5);
    transform: scale(1.05);
  }

  .burst-particles {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .burst-icon {
    font-size: 1.2em;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  .animated-counter {
    font-weight: bold;
    color: #00ffff;
  }
`;
document.head.appendChild(style);

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.immersiveActualizer = new ImmersiveExperienceActualizer();
  });
} else {
  window.immersiveActualizer = new ImmersiveExperienceActualizer();
}

window.ImmersiveExperienceActualizer = ImmersiveExperienceActualizer;