/*
 * Clear Seas Solutions - Research & Blog System
 * Dynamic content management for academic papers and blog posts
 * 
 * Handles research paper display, blog post management, and
 * content filtering with integrated VIB34D visualization
 */

class ResearchSystem {
  constructor() {
    this.papers = [];
    this.blogPosts = [];
    this.filteredPapers = [];
    this.filteredBlogPosts = [];
    this.currentCategory = 'all';
    this.isInitialized = false;
    this.observers = new Map();
    
    this.init();
  }

  async init() {
    await this.loadContent();
    this.setupDOM();
    this.setupEventListeners();
    this.setupAnimations();
    this.renderContent();
    this.isInitialized = true;
    
    console.log('🔬 Research System initialized');
  }

  async loadContent() {
    // Load research papers
    this.papers = [
      {
        id: 'polytopal-encoding-2025',
        title: 'Polytopal Projection Systems for Enhanced Machine-Oriented Data Encoding',
        authors: ['Clear Seas Solutions Research Team'],
        type: 'Research Paper',
        category: 'machine-learning',
        abstract: 'This paper presents a novel approach to data encoding using polytopal geometric structures that enable more efficient machine-to-machine communication. By leveraging multi-dimensional mathematical projections, we demonstrate significant improvements in data compression and semantic preservation across various AI applications.',
        keywords: ['Polytopal Geometry', 'Machine Learning', 'Data Encoding', '4D Mathematics', 'AI Communication'],
        date: '2025-01-15',
        status: 'published',
        links: {
          pdf: '#',
          arxiv: '#',
          github: '#'
        },
        visualizer: {
          system: 'polychora',
          quality: 'high'
        },
        citations: 0,
        downloads: 247
      },
      {
        id: 'holographic-visualization-2024',
        title: 'Real-Time Holographic Visualization of Multi-Dimensional Mathematical Structures',
        authors: ['Clear Seas Solutions Research Team', 'VIB34D Consortium'],
        type: 'Conference Paper',
        category: 'visualization',
        abstract: 'We present a comprehensive system for real-time visualization of complex mathematical structures using holographic rendering techniques. Our approach combines WebGL compute shaders with advanced 4D projection algorithms to create immersive educational and research tools.',
        keywords: ['Holographic Visualization', 'WebGL', '4D Rendering', 'Mathematical Visualization', 'Educational Technology'],
        date: '2024-12-08',
        status: 'accepted',
        links: {
          pdf: '#',
          demo: 'https://domusgpt.github.io/vib34d-holographic-engine/',
          presentation: '#'
        },
        visualizer: {
          system: 'holographic',
          quality: 'high'
        },
        citations: 3,
        downloads: 892
      },
      {
        id: 'maritime-automation-2024',
        title: 'Automated Systems for Maritime Transportation: Safety, Efficiency, and Scalability',
        authors: ['Clear Seas Solutions Research Team'],
        type: 'Industry Report',
        category: 'automation',
        abstract: 'An comprehensive analysis of automation opportunities in maritime transportation, focusing on ride-sharing platforms, safety protocols, and regulatory compliance. We examine the technological infrastructure required for scalable maritime automation systems.',
        keywords: ['Maritime Technology', 'Automation', 'Transportation', 'Safety Systems', 'Platform Engineering'],
        date: '2024-11-22',
        status: 'published',
        links: {
          pdf: '#',
          github: 'private'
        },
        visualizer: {
          system: 'quantum',
          quality: 'medium'
        },
        citations: 1,
        downloads: 456
      }
    ];

    // Load blog posts
    this.blogPosts = [
      {
        id: 'vib34d-development-journey',
        title: 'The VIB34D Development Journey: From Concept to Production',
        category: 'development',
        excerpt: 'A deep dive into the development process behind the VIB34D Holographic Engine, exploring the technical challenges, breakthrough moments, and lessons learned while building a production-ready 4D visualization system.',
        content: `The VIB34D Holographic Engine represents months of intensive development, mathematical research, and creative problem-solving. In this post, I'll take you through the journey from initial concept to the production system you can explore today.

## The Initial Vision

The project began with a simple question: How can we make complex mathematical structures more accessible and intuitive? Traditional 2D representations of 4D objects lose so much information that they often obscure rather than illuminate the underlying mathematics.

## Technical Breakthroughs

Several key innovations emerged during development:

### 1. Multi-System Architecture
Rather than creating a single visualization approach, we developed four distinct systems:
- **Faceted**: Clean geometric patterns for educational clarity
- **Quantum**: Complex 3D lattice structures with holographic effects
- **Holographic**: Audio-reactive volumetric rendering
- **Polychora**: True 4D polytope mathematics with real-time projection

### 2. Performance Optimization
Managing multiple WebGL contexts while maintaining 60fps required sophisticated resource management and priority-based rendering systems.

### 3. Parameter Synchronization
Creating a unified parameter system that works meaningfully across all four visualization modes was one of our most challenging design problems.

## Lessons Learned

The development process taught us valuable lessons about mathematical visualization, user experience design, and the importance of making complex systems accessible to non-experts.`,
        author: 'Clear Seas Solutions Team',
        date: '2025-01-10',
        readTime: 8,
        tags: ['Development', 'VIB34D', 'WebGL', 'Mathematics'],
        visualizer: {
          system: 'polychora',
          quality: 'high'
        },
        featured: true
      },
      {
        id: 'future-of-maritime-tech',
        title: 'The Future of Maritime Technology: Automation and Safety',
        category: 'industry',
        excerpt: 'Exploring how emerging technologies are transforming maritime transportation, from AI-powered navigation systems to automated safety protocols and the regulatory landscape shaping the industry.',
        content: `Maritime technology is experiencing a renaissance, driven by advances in AI, IoT, and automated systems. The FLOWT platform represents just one example of how technology can revolutionize traditional maritime operations.

## Current State of the Industry

The maritime industry has been relatively slow to adopt new technologies compared to other transportation sectors. However, this is rapidly changing as the benefits of automation become clear.

## Key Technology Trends

Several trends are shaping the future of maritime technology:

### Autonomous Navigation
AI-powered navigation systems that can process real-time weather data, traffic conditions, and safety protocols to optimize routes and ensure passenger safety.

### Predictive Maintenance
IoT sensors and machine learning algorithms that can predict equipment failures before they occur, reducing downtime and improving safety.

### Real-Time Monitoring
Comprehensive monitoring systems that provide real-time insights into vessel performance, environmental conditions, and passenger safety.

## Regulatory Considerations

The regulatory landscape for maritime automation is complex and evolving. Coast Guard integration and compliance with maritime safety standards are critical factors in any automated system design.`,
        author: 'Clear Seas Solutions Team',
        date: '2024-12-15',
        readTime: 6,
        tags: ['Maritime', 'Automation', 'Technology', 'Safety'],
        visualizer: {
          system: 'quantum',
          quality: 'medium'
        },
        featured: false
      },
      {
        id: 'mathematical-visualization-principles',
        title: 'Principles of Effective Mathematical Visualization',
        category: 'research',
        excerpt: 'A guide to the fundamental principles behind effective mathematical visualization, exploring how visual design choices impact comprehension and the role of interactive elements in mathematical education.',
        content: `Effective mathematical visualization is both an art and a science. It requires deep understanding of the underlying mathematics combined with intuitive design principles that make complex concepts accessible.

## Core Principles

### 1. Clarity Over Complexity
The most effective visualizations often strip away unnecessary detail to focus on core concepts. Our faceted system exemplifies this approach with clean, geometric patterns that highlight structural relationships.

### 2. Progressive Disclosure
Complex mathematical structures should be revealed gradually, allowing users to build understanding step by step. Interactive parameter controls enable this progressive exploration.

### 3. Multiple Perspectives
Different visual approaches can illuminate different aspects of the same mathematical structure. Our multi-system architecture provides various lenses through which to examine 4D geometries.

## Implementation Strategies

Translating these principles into working software requires careful attention to performance, user experience, and mathematical accuracy. WebGL provides the computational power needed for real-time rendering, while thoughtful UI design ensures accessibility.

## Future Directions

Mathematical visualization continues to evolve with advances in graphics technology, VR/AR systems, and our understanding of how people learn mathematical concepts.`,
        author: 'Clear Seas Solutions Research Team',
        date: '2024-11-28',
        readTime: 5,
        tags: ['Mathematics', 'Visualization', 'Education', 'Design'],
        visualizer: {
          system: 'faceted',
          quality: 'medium'
        },
        featured: true
      }
    ];

    // Sort content by date and featured status
    this.papers.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.blogPosts.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      return new Date(b.date) - new Date(a.date);
    });

    this.filteredPapers = [...this.papers];
    this.filteredBlogPosts = [...this.blogPosts];
  }

  setupDOM() {
    this.setupCategoryFilters();
  }

  setupCategoryFilters() {
    const categories = ['all', 'machine-learning', 'visualization', 'automation', 'development', 'industry', 'research'];
    const filtersContainer = document.querySelector('.research-categories');
    
    if (!filtersContainer) return;

    filtersContainer.innerHTML = categories.map(category => `
      <button class="category-btn ${category === 'all' ? 'active' : ''}" 
              data-category="${category}">
        ${this.formatCategoryName(category)}
      </button>
    `).join('');
  }

  formatCategoryName(category) {
    const names = {
      'all': 'All Research',
      'machine-learning': 'AI & ML',
      'visualization': 'Visualization',
      'automation': 'Automation',
      'development': 'Development',
      'industry': 'Industry',
      'research': 'Research'
    };
    return names[category] || category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  setupEventListeners() {
    // Category filter buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.category-btn')) {
        this.handleCategoryChange(e.target.dataset.category);
      }
      
      if (e.target.matches('.research-card') || e.target.closest('.research-card')) {
        const card = e.target.closest('.research-card');
        const paperId = card.dataset.paperId;
        this.openPaperModal(paperId);
      }
      
      if (e.target.matches('.blog-card') || e.target.closest('.blog-card')) {
        const card = e.target.closest('.blog-card');
        const postId = card.dataset.postId;
        this.openBlogModal(postId);
      }
    });

    // External link handlers
    document.addEventListener('click', (e) => {
      if (e.target.matches('.research-link') || e.target.matches('.blog-read-more')) {
        e.preventDefault();
        const url = e.target.href;
        if (url && url !== '#') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    });
  }

  handleCategoryChange(category) {
    if (category === this.currentCategory) return;

    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    this.currentCategory = category;
    this.filterContent();
    this.renderContent();
  }

  filterContent() {
    if (this.currentCategory === 'all') {
      this.filteredPapers = [...this.papers];
      this.filteredBlogPosts = [...this.blogPosts];
    } else {
      this.filteredPapers = this.papers.filter(
        paper => paper.category === this.currentCategory
      );
      this.filteredBlogPosts = this.blogPosts.filter(
        post => post.category === this.currentCategory
      );
    }
  }

  renderContent() {
    this.renderResearchPapers();
    this.renderBlogPosts();
  }

  renderResearchPapers() {
    const grid = document.querySelector('.research-grid');
    if (!grid) return;

    grid.innerHTML = this.filteredPapers.map(paper => `
      <div class="research-card" data-paper-id="${paper.id}" data-aos="fade-up">
        <div class="research-visual">
          <div class="vib34d-container research-canvas" 
               data-system="${paper.visualizer.system}"
               data-quality="${paper.visualizer.quality}"></div>
          <div class="research-overlay"></div>
          <div class="research-meta">
            <span class="research-type">${paper.type}</span>
            <span class="research-date">${this.formatDate(paper.date)}</span>
          </div>
        </div>
        <div class="research-content">
          <h3 class="research-title-text">${paper.title}</h3>
          <p class="research-authors">${paper.authors.join(', ')}</p>
          <p class="research-abstract">${paper.abstract}</p>
          <div class="research-keywords">
            ${paper.keywords.map(keyword => 
              `<span class="keyword-tag">${keyword}</span>`
            ).join('')}
          </div>
          <div class="research-actions">
            ${this.renderPaperLinks(paper.links)}
          </div>
        </div>
      </div>
    `).join('');

    this.animateCards('.research-card');
  }

  renderBlogPosts() {
    const grid = document.querySelector('.blog-grid');
    if (!grid) return;

    grid.innerHTML = this.filteredBlogPosts.map(post => `
      <div class="blog-card" data-post-id="${post.id}" data-aos="fade-up">
        <div class="blog-image">
          <div class="vib34d-container blog-canvas" 
               data-system="${post.visualizer.system}"
               data-quality="${post.visualizer.quality}"></div>
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <span class="blog-category">${this.formatCategoryName(post.category)}</span>
            <span class="blog-date">${this.formatDate(post.date)}</span>
          </div>
          <h3 class="blog-title-text">${post.title}</h3>
          <p class="blog-excerpt">${post.excerpt}</p>
          <a href="#" class="blog-read-more">
            Read More
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" stroke-width="2"/>
            </svg>
          </a>
        </div>
      </div>
    `).join('');

    this.animateCards('.blog-card');
  }

  renderPaperLinks(links) {
    const primaryLink = Object.entries(links)[0];
    const secondaryLinks = Object.entries(links).slice(1);

    return `
      <a href="${primaryLink[1]}" class="research-link primary">
        ${this.getLinkIcon(primaryLink[0])}
        ${this.formatLinkText(primaryLink[0])}
      </a>
      ${secondaryLinks.map(([key, url]) => `
        <a href="${url}" class="research-link">
          ${this.getLinkIcon(key)}
          ${this.formatLinkText(key)}
        </a>
      `).join('')}
    `;
  }

  getLinkIcon(type) {
    const icons = {
      pdf: `<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/><polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/></svg>`,
      arxiv: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" stroke-width="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" stroke-width="2"/></svg>`,
      github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
      demo: `<svg viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" stroke-width="2"/></svg>`,
      presentation: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="2"/></svg>`
    };
    return icons[type] || '';
  }

  formatLinkText(type) {
    const texts = {
      pdf: 'Download PDF',
      arxiv: 'arXiv',
      github: 'Code',
      demo: 'Live Demo',
      presentation: 'Slides'
    };
    return texts[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  animateCards(selector) {
    const cards = document.querySelectorAll(selector);
    cards.forEach((card, index) => {
      card.style.transform = 'translateY(30px)';
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

  openPaperModal(paperId) {
    const paper = this.papers.find(p => p.id === paperId);
    if (!paper) return;

    // For now, just open the PDF link if available
    if (paper.links.pdf && paper.links.pdf !== '#') {
      window.open(paper.links.pdf, '_blank', 'noopener,noreferrer');
    }
  }

  openBlogModal(postId) {
    const post = this.blogPosts.find(p => p.id === postId);
    if (!post) return;

    // For now, scroll to top and show post content in console
    // In a full implementation, this would open a detailed modal
    console.log('Blog Post:', post);
    
    // Could implement a detailed blog post modal similar to portfolio
    // For now, just provide feedback
    alert(`Blog post "${post.title}" - Full blog system coming soon!`);
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

    // Observe cards when they're added
    const observeCards = () => {
      document.querySelectorAll('.research-card[data-aos], .blog-card[data-aos]').forEach(card => {
        animationObserver.observe(card);
      });
    };

    setTimeout(observeCards, 100);
    this.observers.set('animation', animationObserver);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Public API methods
  addPaper(paper) {
    this.papers.push(paper);
    this.filterContent();
    this.renderContent();
  }

  addBlogPost(post) {
    this.blogPosts.push(post);
    this.filterContent();
    this.renderContent();
  }

  getPaper(paperId) {
    return this.papers.find(p => p.id === paperId);
  }

  getBlogPost(postId) {
    return this.blogPosts.find(p => p.id === postId);
  }

  destroy() {
    // Cleanup observers
    this.observers.forEach(observer => observer.disconnect());
    
    console.log('🧹 Research System destroyed');
  }
}

// Global research system instance
let researchSystem = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#research')) {
    researchSystem = new ResearchSystem();
    
    // Expose to window for debugging
    if (typeof window !== 'undefined') {
      window.researchSystem = researchSystem;
    }
  }
});

// Global class access for other scripts
window.ResearchSystem = ResearchSystem;