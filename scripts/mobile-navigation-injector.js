/*
 * MOBILE NAVIGATION INJECTOR
 * Creates thumb-friendly bottom navigation for mobile devices
 */

class MobileNavigationInjector {
  constructor() {
    this.isMobile = this.detectMobile();
    this.init();
  }
  
  detectMobile() {
    return window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }
  
  init() {
    if (this.isMobile) {
      this.createMobileNavigation();
      console.log('📱 Mobile Navigation - Thumb-friendly nav injected');
    }
  }
  
  createMobileNavigation() {
    // Create mobile navigation container
    const mobileNav = document.createElement('nav');
    mobileNav.className = 'mobile-nav';
    mobileNav.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10001;
      background: linear-gradient(0deg,
        rgba(0, 20, 40, 0.95) 0%,
        rgba(0, 40, 80, 0.9) 100%);
      backdrop-filter: blur(15px);
      border-top: 1px solid rgba(0, 255, 255, 0.2);
      padding: 10px;
      display: flex;
      justify-content: space-around;
      transform: translateZ(200px);
      box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.3);
      padding-bottom: max(10px, env(safe-area-inset-bottom));
    `;
    
    // Navigation items
    const navItems = [
      { id: 'hero', label: 'Home', icon: '🏠' },
      { id: 'technology', label: 'Tech', icon: '⚡' },
      { id: 'portfolio', label: 'Work', icon: '💼' },
      { id: 'research', label: 'Research', icon: '🔬' },
      { id: 'about', label: 'About', icon: '👋' },
      { id: 'contact', label: 'Contact', icon: '📧' }
    ];
    
    navItems.forEach(item => {
      const navLink = document.createElement('a');
      navLink.href = `#${item.id}`;
      navLink.className = 'mobile-nav-link touch-target';
      navLink.dataset.section = item.id;
      
      navLink.innerHTML = `
        <div class="nav-icon">${item.icon}</div>
        <div class="nav-label">${item.label}</div>
      `;
      
      navLink.style.cssText = `
        padding: 8px 6px;
        border-radius: 12px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        min-width: 44px;
        min-height: 44px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        text-align: center;
        transition: all 0.3s ease;
        flex: 1;
        position: relative;
        overflow: hidden;
      `;
      
      // Add touch ripple effect
      navLink.addEventListener('touchstart', this.createRipple);
      
      // Navigation click handler
      navLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToSection(item.id);
        this.setActiveNavItem(navLink);
      });
      
      mobileNav.appendChild(navLink);
    });
    
    // Add styles for nav icons and labels
    const style = document.createElement('style');
    style.textContent = `
      .mobile-nav-link .nav-icon {
        font-size: 1.2rem;
        margin-bottom: 2px;
      }
      
      .mobile-nav-link .nav-label {
        font-size: 0.65rem;
        font-weight: 500;
        opacity: 0.8;
      }
      
      .mobile-nav-link.active,
      .mobile-nav-link:active {
        background: rgba(0, 255, 255, 0.2);
        color: rgba(0, 255, 255, 1);
        transform: translateZ(10px) scale(1.05);
        box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
      }
      
      .mobile-nav-link.active .nav-label {
        opacity: 1;
      }
      
      /* Ripple effect */
      .mobile-nav-link::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(0, 255, 255, 0.4);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s, opacity 0.6s;
        opacity: 0;
        pointer-events: none;
      }
      
      .mobile-nav-link.ripple::after {
        width: 60px;
        height: 60px;
        opacity: 1;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(mobileNav);
    
    // Set initial active state
    this.setActiveNavItem(mobileNav.querySelector('[data-section="hero"]'));
    
    // Update active state based on scroll position
    this.setupScrollTracking();
  }
  
  createRipple = (e) => {
    const link = e.currentTarget;
    link.classList.add('ripple');
    
    setTimeout(() => {
      link.classList.remove('ripple');
    }, 600);
  }
  
  navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      // Calculate optimal scroll position (20% into the section)
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top + window.scrollY;
      const targetScroll = sectionTop + (window.innerHeight * 0.1); // 10vh into section
      
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      
      // Add visual feedback
      section.style.transition = 'all 0.6s ease';
      section.style.transform = 'scale(1.01)';
      section.style.filter = 'brightness(1.1)';
      
      setTimeout(() => {
        section.style.transform = '';
        section.style.filter = '';
      }, 600);
    }
  }
  
  setActiveNavItem(activeLink) {
    // Remove active from all links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active to current link
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  
  setupScrollTracking() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        this.updateActiveNavBasedOnScroll();
        scrollTimeout = null;
      }, 100);
    });
  }
  
  updateActiveNavBasedOnScroll() {
    const scrollY = window.scrollY + (window.innerHeight * 0.3); // Offset for better detection
    const sections = ['hero', 'technology', 'portfolio', 'research', 'about', 'contact'];
    
    let activeSection = 'hero';
    
    for (const sectionId of sections) {
      const section = document.getElementById(sectionId);
      if (section) {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        
        if (scrollY >= sectionTop) {
          activeSection = sectionId;
        }
      }
    }
    
    const activeLink = document.querySelector(`[data-section="${activeSection}"]`);
    this.setActiveNavItem(activeLink);
  }
}

// Initialize mobile navigation
window.addEventListener('DOMContentLoaded', () => {
  window.mobileNavigation = new MobileNavigationInjector();
});