/*
 * Clear Seas Solutions - Interactive Portfolio System
 * Dynamic project showcases with VIB34D visualizer integration
 * 
 * Manages project filtering, modal displays, and dynamic content
 * loading with seamless visualizer integration
 */

class PortfolioSystem {
  constructor() {
    this.projects = [];
    this.filteredProjects = [];
    this.currentFilter = 'all';
    this.currentProject = null;
    this.modal = null;
    this.observers = new Map();
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    await this.loadProjects();
    this.setupDOM();
    this.setupEventListeners();
    this.setupAnimations();
    this.renderProjects();
    this.isInitialized = true;
    
    console.log('📁 Portfolio System initialized');
  }

  async loadProjects() {
    // Define comprehensive project portfolio
    this.projects = [
      {
        id: 'vib34d-engine',
        title: 'VIB34D Holographic Engine',
        category: 'visualization',
        status: 'live',
        description: 'Advanced 4D polytope visualization engine with WebGL shaders, real-time parameter control, and mathematical precision. Features quantum lattice systems, holographic effects, and polychora rendering.',
        fullDescription: 'The VIB34D Holographic Engine represents a breakthrough in 4D mathematical visualization, combining advanced WebGL compute shaders with real-time parameter control systems. The engine features four distinct visualization systems: Faceted (geometric patterns), Quantum (3D lattice structures), Holographic (audio-reactive volumetric effects), and Polychora (true 4D polytope mathematics).',
        technologies: ['WebGL', 'GLSL Shaders', '4D Mathematics', 'JavaScript', 'Real-time Rendering', 'Audio Processing'],
        links: {
          live: 'https://domusgpt.github.io/vib34d-holographic-engine/',
          github: 'https://github.com/domusgpt/vib34d-holographic-engine',
          demo: 'https://domusgpt.github.io/vib34d-ultimate-viewer/'
        },
        visualizer: {
          system: 'polychora',
          quality: 'high',
          autoRotate: true
        },
        date: '2025-01-15',
        featured: true
      },
      {
        id: 'flowt-maritime',
        title: 'FLOWT Maritime Platform',
        category: 'platform',
        status: 'development',
        description: 'Production-ready maritime ride-sharing platform connecting riders with licensed boat captains. Features real-time tracking, weather integration, and Coast Guard safety protocols.',
        fullDescription: 'FLOWT represents the "Uber of the water" - a comprehensive maritime ride-sharing platform with enterprise-grade backend infrastructure, multi-role dashboards, and advanced safety systems. The platform includes 21 production Cloud Functions, real-time Firebase integration, and sophisticated captain-rider matching algorithms.',
        technologies: ['React', 'Firebase', 'Google Maps API', 'Stripe', 'WebRTC', 'PWA', 'Node.js'],
        links: {
          demo: '#',
          documentation: '#',
          github: 'private'
        },
        visualizer: {
          system: 'quantum',
          quality: 'medium',
          autoRotate: true
        },
        date: '2024-12-20',
        featured: true
      },
      {
        id: 'polytopal-projection',
        title: 'Polytopal Projection Research',
        category: 'research',
        status: 'concept',
        description: 'Innovative approach to machine-oriented data encoding using polytopal geometries and multi-dimensional projections for enhanced AI system communication.',
        fullDescription: 'This research explores novel applications of polytopal geometries in machine learning and AI systems. By leveraging multi-dimensional mathematical structures, we develop new paradigms for data encoding that allow machines to process and communicate information more efficiently than traditional approaches.',
        technologies: ['Python', 'TensorFlow', 'Mathematical Modeling', 'Data Science', 'AI/ML', 'Computational Geometry'],
        links: {
          paper: '#',
          github: '#',
          presentation: '#'
        },
        visualizer: {
          system: 'faceted',
          quality: 'medium',
          autoRotate: false
        },
        date: '2024-11-30',
        featured: false
      },
      {
        id: 'grant-automation',
        title: 'Grant Application Automation',
        category: 'automation',
        status: 'live',
        description: 'Comprehensive grant application tracking and automation system with AI-powered matching, deadline management, and submission optimization.',
        fullDescription: 'Developed a sophisticated grant application management system that streamlines the funding acquisition process. The system features automated deadline tracking, AI-powered grant matching based on project criteria, and comprehensive submission management with real-time status updates.',
        technologies: ['Python', 'AI/ML', 'Web Scraping', 'Database Management', 'Automation', 'NLP'],
        links: {
          demo: '#',
          github: 'private'
        },
        visualizer: {
          system: 'holographic',
          quality: 'medium',
          autoRotate: true
        },
        date: '2024-10-15',
        featured: false
      }
    ];

    // Sort by featured status and date
    this.projects.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      return new Date(b.date) - new Date(a.date);
    });

    this.filteredProjects = [...this.projects];
  }

  setupDOM() {
    const portfolioSection = document.querySelector('#portfolio');
    if (!portfolioSection) return;

    // Create modal structure if it doesn't exist
    this.createModal();
    
    // Setup filter buttons
    this.setupFilters();
  }

  createModal() {
    if (document.querySelector('.project-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" aria-label="Close modal">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="modal-header">
          <div class="modal-visualizer-container">
            <div class="vib34d-container modal-visualizer"></div>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-content-area"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;
  }

  setupFilters() {
    const categories = ['all', ...new Set(this.projects.map(p => p.category))];
    const filtersContainer = document.querySelector('.portfolio-filters');
    
    if (!filtersContainer) return;

    filtersContainer.innerHTML = categories.map(category => `
      <button class="filter-btn ${category === 'all' ? 'active' : ''}" 
              data-filter="${category}">
        ${this.formatCategoryName(category)}
      </button>
    `).join('');
  }

  formatCategoryName(category) {
    const names = {
      'all': 'All Projects',
      'visualization': 'Visualization',
      'platform': 'Platforms',
      'research': 'Research',
      'automation': 'Automation'
    };
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  setupEventListeners() {
    // Filter buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.filter-btn')) {
        this.handleFilterChange(e.target.dataset.filter);
      }
      
      if (e.target.matches('.project-card') || e.target.closest('.project-card')) {
        const card = e.target.closest('.project-card');
        const projectId = card.dataset.projectId;
        this.openProjectModal(projectId);
      }
      
      if (e.target.matches('.modal-close') || e.target.closest('.modal-close')) {
        this.closeProjectModal();
      }
    });

    // Modal backdrop close
    document.addEventListener('click', (e) => {
      if (e.target.matches('.project-modal')) {
        this.closeProjectModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeProjectModal();
      }
    });

    // External link handlers
    document.addEventListener('click', (e) => {
      if (e.target.matches('.project-link')) {
        e.preventDefault();
        const url = e.target.href;
        if (url && url !== '#') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    });
  }

  handleFilterChange(filter) {
    if (filter === this.currentFilter) return;

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.currentFilter = filter;
    this.filterProjects();
    this.renderProjects();
  }

  filterProjects() {
    if (this.currentFilter === 'all') {
      this.filteredProjects = [...this.projects];
    } else {
      this.filteredProjects = this.projects.filter(
        project => project.category === this.currentFilter
      );
    }
  }

  renderProjects() {
    const grid = document.querySelector('.portfolio-grid');
    if (!grid) return;

    // Animate out existing cards
    const existingCards = grid.querySelectorAll('.project-card');
    if (existingCards.length > 0) {
      existingCards.forEach((card, index) => {
        setTimeout(() => {
          card.style.transform = 'translateY(20px)';
          card.style.opacity = '0';
        }, index * 50);
      });

      setTimeout(() => {
        this.renderProjectCards(grid);
      }, existingCards.length * 50 + 200);
    } else {
      this.renderProjectCards(grid);
    }
  }

  renderProjectCards(grid) {
    grid.innerHTML = this.filteredProjects.map(project => `
      <div class="project-card" data-project-id="${project.id}" data-aos="fade-up">
        <div class="project-visualizer">
          <div class="vib34d-container project-canvas" 
               data-system="${project.visualizer.system}"
               data-quality="${project.visualizer.quality}"
               data-auto-rotate="${project.visualizer.autoRotate}"></div>
          <div class="project-overlay">
            <div class="project-quick-info">
              <h4>${project.title}</h4>
              <p>Click to explore</p>
            </div>
          </div>
          <div class="project-status ${project.status}">${project.status}</div>
        </div>
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.technologies.slice(0, 4).map(tech => 
              `<span class="tech-tag">${tech}</span>`
            ).join('')}
            ${project.technologies.length > 4 ? 
              `<span class="tech-tag">+${project.technologies.length - 4}</span>` : ''
            }
          </div>
          <div class="project-links">
            ${this.renderProjectLinks(project.links)}
          </div>
        </div>
      </div>
    `).join('');

    // Animate in new cards
    const newCards = grid.querySelectorAll('.project-card');
    newCards.forEach((card, index) => {
      card.style.transform = 'translateY(20px)';
      card.style.opacity = '0';
      
      setTimeout(() => {
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
      }, index * 100);
    });

    // Initialize visualizers for new cards
    setTimeout(() => {
      if (window.vib34dManager) {
        window.vib34dManager.initializeVisualizers();
      }
    }, 500);
  }

  renderProjectLinks(links) {
    return Object.entries(links)
      .filter(([key, url]) => url && url !== '#' && url !== 'private')
      .map(([key, url]) => `
        <a href="${url}" class="project-link" data-type="${key}">
          ${this.getLinkIcon(key)}
          ${this.formatLinkText(key)}
        </a>
      `).join('');
  }

  getLinkIcon(type) {
    const icons = {
      live: `<svg viewBox="0 0 24 24" fill="none"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="currentColor" stroke-width="2"/></svg>`,
      github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
      demo: `<svg viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" stroke-width="2"/></svg>`,
      paper: `<svg viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/></svg>`
    };
    return icons[type] || '';
  }

  formatLinkText(type) {
    const texts = {
      live: 'Live Demo',
      github: 'Source Code',
      demo: 'Demo',
      paper: 'Research Paper',
      documentation: 'Docs'
    };
    return texts[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  openProjectModal(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project || !this.modal) return;

    this.currentProject = project;
    
    // Update modal content
    this.updateModalContent(project);
    
    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize modal visualizer
    setTimeout(() => {
      if (window.vib34dManager) {
        const modalVisualizer = this.modal.querySelector('.modal-visualizer');
        if (modalVisualizer) {
          modalVisualizer.dataset.system = project.visualizer.system;
          modalVisualizer.dataset.quality = 'high';
          window.vib34dManager.activateVisualizer(
            `modal-${project.id}`, 
            modalVisualizer
          );
        }
      }
    }, 300);
  }

  updateModalContent(project) {
    const contentArea = this.modal.querySelector('.modal-content-area');
    if (!contentArea) return;

    contentArea.innerHTML = `
      <h2 class="modal-title">${project.title}</h2>
      <div class="modal-meta">
        <span class="modal-category">${this.formatCategoryName(project.category)}</span>
        <span class="modal-status ${project.status}">${project.status}</span>
        <span class="modal-date">${this.formatDate(project.date)}</span>
      </div>
      <div class="modal-description">
        <p>${project.fullDescription}</p>
      </div>
      <div class="modal-details">
        <div class="detail-section">
          <h4>Technologies Used</h4>
          <div class="tech-grid">
            ${project.technologies.map(tech => 
              `<span class="tech-tag">${tech}</span>`
            ).join('')}
          </div>
        </div>
        <div class="detail-section">
          <h4>Project Links</h4>
          <div class="link-grid">
            ${this.renderModalLinks(project.links)}
          </div>
        </div>
      </div>
    `;
  }

  renderModalLinks(links) {
    return Object.entries(links)
      .filter(([key, url]) => url && url !== '#')
      .map(([key, url]) => {
        if (url === 'private') {
          return `<span class="private-link">${this.formatLinkText(key)} (Private)</span>`;
        }
        return `
          <a href="${url}" class="modal-link" target="_blank" rel="noopener noreferrer">
            ${this.getLinkIcon(key)}
            ${this.formatLinkText(key)}
          </a>
        `;
      }).join('');
  }

  closeProjectModal() {
    if (!this.modal) return;

    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Cleanup modal visualizer
    if (window.vib34dManager && this.currentProject) {
      window.vib34dManager.deactivateVisualizer(`modal-${this.currentProject.id}`);
    }
    
    this.currentProject = null;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  setupAnimations() {
    // Intersection observer for animation triggers
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all project cards when they're added
    const observeCards = () => {
      document.querySelectorAll('.project-card[data-aos]').forEach(card => {
        animationObserver.observe(card);
      });
    };

    // Initial observation
    setTimeout(observeCards, 100);
    
    // Store observer for cleanup
    this.observers.set('animation', animationObserver);
  }

  // Public API methods
  addProject(project) {
    this.projects.push(project);
    this.filterProjects();
    this.renderProjects();
  }

  removeProject(projectId) {
    this.projects = this.projects.filter(p => p.id !== projectId);
    this.filterProjects();
    this.renderProjects();
  }

  updateProject(projectId, updates) {
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      this.projects[projectIndex] = { ...this.projects[projectIndex], ...updates };
      this.filterProjects();
      this.renderProjects();
    }
  }

  getProject(projectId) {
    return this.projects.find(p => p.id === projectId);
  }

  destroy() {
    // Cleanup observers
    this.observers.forEach(observer => observer.disconnect());
    
    // Remove modal
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    
    console.log('🧹 Portfolio System destroyed');
  }
}

// Global portfolio system instance
let portfolioSystem = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#portfolio')) {
    portfolioSystem = new PortfolioSystem();
    
    // Expose to window for debugging
    if (typeof window !== 'undefined') {
      window.portfolioSystem = portfolioSystem;
    }
  }
});

// Global class access for other scripts
window.PortfolioSystem = PortfolioSystem;