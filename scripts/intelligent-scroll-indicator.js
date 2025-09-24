/*
 * INTELLIGENT SCROLL INDICATOR
 * Custom scroll bar with zone visualization and navigation
 */

class IntelligentScrollIndicator {
  constructor(scrollMaster) {
    this.scrollMaster = scrollMaster;
    this.container = null;
    this.zoneIndicators = new Map();
    this.currentZoneMarker = null;
    this.isDragging = false;
    
    this.init();
  }
  
  init() {
    this.createScrollIndicator();
    this.setupInteractions();
    this.updateIndicator();
    
    console.log('📊 Intelligent Scroll Indicator - Initialized');
  }
  
  createScrollIndicator() {
    // Remove default scrollbar
    const style = document.createElement('style');
    style.textContent = `
      body::-webkit-scrollbar {
        width: 0px;
        background: transparent;
      }
      
      body {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
    `;
    document.head.appendChild(style);
    
    // Create custom scroll indicator container
    this.container = document.createElement('div');
    this.container.className = 'intelligent-scroll-indicator';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 60px;
      height: 100vh;
      background: linear-gradient(90deg, 
        rgba(0, 20, 40, 0.1) 0%, 
        rgba(0, 40, 80, 0.3) 50%, 
        rgba(0, 60, 120, 0.5) 100%);
      backdrop-filter: blur(10px);
      border-left: 1px solid rgba(0, 255, 255, 0.2);
      z-index: 10000;
      overflow: hidden;
      cursor: pointer;
      transition: width 0.3s ease, background 0.3s ease;
    `;
    
    // Create zone indicators
    this.createZoneIndicators();
    
    // Create current position marker
    this.createCurrentPositionMarker();
    
    // Create progress visualization
    this.createProgressVisualization();
    
    document.body.appendChild(this.container);
    
    // Hover effects
    this.container.addEventListener('mouseenter', () => {
      this.container.style.width = '80px';
      this.container.style.background = `linear-gradient(90deg, 
        rgba(0, 20, 40, 0.2) 0%, 
        rgba(0, 40, 80, 0.4) 50%, 
        rgba(0, 60, 120, 0.6) 100%)`;
    });
    
    this.container.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        this.container.style.width = '60px';
        this.container.style.background = `linear-gradient(90deg, 
          rgba(0, 20, 40, 0.1) 0%, 
          rgba(0, 40, 80, 0.3) 50%, 
          rgba(0, 60, 120, 0.5) 100%)`;
      }
    });
  }
  
  createZoneIndicators() {
    const zones = Array.from(this.scrollMaster.zones.values());
    const totalHeight = document.body.scrollHeight;
    
    zones.forEach(zone => {
      const indicator = document.createElement('div');
      indicator.className = `zone-indicator zone-indicator-${zone.id}`;
      
      const topPercent = (zone.startY / totalHeight) * 100;
      const heightPercent = ((zone.endY - zone.startY) / totalHeight) * 100;
      
      indicator.style.cssText = `
        position: absolute;
        top: ${topPercent}%;
        left: 5px;
        right: 5px;
        height: ${heightPercent}%;
        background: linear-gradient(180deg,
          ${this.getZoneColor(zone.id, 0.2)} 0%,
          ${this.getZoneColor(zone.id, 0.4)} 50%,
          ${this.getZoneColor(zone.id, 0.2)} 100%);
        border: 1px solid ${this.getZoneColor(zone.id, 0.6)};
        border-radius: 15px;
        transition: all 0.3s ease;
        cursor: pointer;
        overflow: hidden;
      `;
      
      // Add zone label
      const label = document.createElement('div');
      label.className = 'zone-label';
      label.textContent = zone.id.toUpperCase();
      label.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-90deg);
        color: ${this.getZoneColor(zone.id, 0.9)};
        font-size: 8px;
        font-weight: 600;
        letter-spacing: 1px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      
      indicator.appendChild(label);
      
      // Add sub-zone markers
      this.createSubZoneMarkers(indicator, zone);
      
      // Hover effects
      indicator.addEventListener('mouseenter', () => {
        indicator.style.boxShadow = `0 0 20px ${this.getZoneColor(zone.id, 0.8)}`;
        indicator.style.transform = 'translateX(-5px)';
        label.style.opacity = '1';
      });
      
      indicator.addEventListener('mouseleave', () => {
        indicator.style.boxShadow = 'none';
        indicator.style.transform = 'translateX(0)';
        label.style.opacity = '0';
      });
      
      // Click to navigate
      indicator.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateToZone(zone);
      });
      
      this.container.appendChild(indicator);
      this.zoneIndicators.set(zone.id, indicator);
    });
  }
  
  createSubZoneMarkers(indicator, zone) {
    const subZones = ['entry', 'development', 'flourish', 'transition'];
    
    subZones.forEach((subZoneName, index) => {
      const marker = document.createElement('div');
      marker.className = `subzone-marker subzone-${subZoneName}`;
      marker.style.cssText = `
        position: absolute;
        top: ${(index / subZones.length) * 100}%;
        left: 0;
        right: 0;
        height: ${100 / subZones.length}%;
        background: linear-gradient(90deg,
          transparent 0%,
          ${this.getSubZoneColor(subZoneName, 0.3)} 50%,
          transparent 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      
      indicator.appendChild(marker);
    });
    
    // Show sub-zone markers on hover
    indicator.addEventListener('mouseenter', () => {
      const markers = indicator.querySelectorAll('.subzone-marker');
      markers.forEach(marker => marker.style.opacity = '1');
    });
    
    indicator.addEventListener('mouseleave', () => {
      const markers = indicator.querySelectorAll('.subzone-marker');
      markers.forEach(marker => marker.style.opacity = '0');
    });
  }
  
  createCurrentPositionMarker() {
    this.currentZoneMarker = document.createElement('div');
    this.currentZoneMarker.className = 'current-position-marker';
    this.currentZoneMarker.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg,
        rgba(0, 255, 255, 0.8) 0%,
        rgba(255, 255, 255, 1) 50%,
        rgba(0, 255, 255, 0.8) 100%);
      border-radius: 2px;
      box-shadow: 
        0 0 10px rgba(0, 255, 255, 0.8),
        0 0 20px rgba(0, 255, 255, 0.4);
      transition: all 0.1s ease-out;
      pointer-events: none;
    `;
    
    this.container.appendChild(this.currentZoneMarker);
  }
  
  createProgressVisualization() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    progressBar.style.cssText = `
      position: absolute;
      left: 2px;
      top: 0;
      width: 2px;
      height: 0%;
      background: linear-gradient(180deg,
        rgba(0, 255, 255, 0.9) 0%,
        rgba(0, 200, 255, 0.7) 50%,
        rgba(0, 150, 255, 0.5) 100%);
      border-radius: 1px;
      transition: height 0.1s ease-out;
      pointer-events: none;
    `;
    
    this.progressBar = progressBar;
    this.container.appendChild(progressBar);
  }
  
  updateIndicator(scrollY = window.scrollY) {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = Math.max(0, Math.min(1, scrollY / totalHeight));
    
    // Update current position marker
    this.currentZoneMarker.style.top = `${scrollPercent * 100}%`;
    
    // Update progress bar
    this.progressBar.style.height = `${scrollPercent * 100}%`;
    
    // Update zone indicator states
    const currentZone = this.scrollMaster.currentZone;
    this.zoneIndicators.forEach((indicator, zoneId) => {
      if (currentZone && zoneId === currentZone.id) {
        indicator.style.background = `linear-gradient(180deg,
          ${this.getZoneColor(zoneId, 0.6)} 0%,
          ${this.getZoneColor(zoneId, 0.8)} 50%,
          ${this.getZoneColor(zoneId, 0.6)} 100%)`;
        indicator.style.borderColor = this.getZoneColor(zoneId, 1.0);
        indicator.style.boxShadow = `0 0 15px ${this.getZoneColor(zoneId, 0.6)}`;
      } else {
        indicator.style.background = `linear-gradient(180deg,
          ${this.getZoneColor(zoneId, 0.2)} 0%,
          ${this.getZoneColor(zoneId, 0.4)} 50%,
          ${this.getZoneColor(zoneId, 0.2)} 100%)`;
        indicator.style.borderColor = this.getZoneColor(zoneId, 0.6);
        indicator.style.boxShadow = 'none';
      }
    });
  }
  
  setupInteractions() {
    let dragStartY = 0;
    let dragStartScroll = 0;
    
    // Click to navigate
    this.container.addEventListener('click', (e) => {
      if (this.isDragging) return;
      
      const rect = this.container.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickPercent = clickY / rect.height;
      
      const targetScroll = clickPercent * (document.body.scrollHeight - window.innerHeight);
      
      // Smooth scroll to position
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
    
    // Drag to scroll
    this.container.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = true;
      dragStartY = e.clientY;
      dragStartScroll = window.scrollY;
      
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.handleDragEnd);
      
      this.container.style.cursor = 'grabbing';
    });
    
    this.handleDrag = (e) => {
      if (!this.isDragging) return;
      
      const dragDelta = e.clientY - dragStartY;
      const scrollRange = document.body.scrollHeight - window.innerHeight;
      const scrollDelta = (dragDelta / window.innerHeight) * scrollRange;
      
      const newScroll = Math.max(0, Math.min(scrollRange, dragStartScroll + scrollDelta));
      window.scrollTo(0, newScroll);
    };
    
    this.handleDragEnd = () => {
      this.isDragging = false;
      this.container.style.cursor = 'pointer';
      
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.handleDragEnd);
    };
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const zones = Array.from(this.scrollMaster.zones.values());
      const currentZoneIndex = zones.findIndex(zone => zone === this.scrollMaster.currentZone);
      
      switch (e.key) {
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          if (currentZoneIndex > 0) {
            this.navigateToZone(zones[currentZoneIndex - 1]);
          }
          break;
          
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          if (currentZoneIndex < zones.length - 1) {
            this.navigateToZone(zones[currentZoneIndex + 1]);
          }
          break;
          
        case 'Home':
          e.preventDefault();
          this.navigateToZone(zones[0]);
          break;
          
        case 'End':
          e.preventDefault();
          this.navigateToZone(zones[zones.length - 1]);
          break;
      }
    });
  }
  
  navigateToZone(zone) {
    const targetY = zone.startY + (zone.endY - zone.startY) * 0.1; // Navigate to entry sub-zone
    
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
    
    // Add visual feedback
    const indicator = this.zoneIndicators.get(zone.id);
    if (indicator) {
      indicator.style.transform = 'translateX(-10px) scale(1.05)';
      setTimeout(() => {
        indicator.style.transform = 'translateX(0) scale(1)';
      }, 300);
    }
  }
  
  getZoneColor(zoneId, alpha = 1) {
    const colors = {
      hero: `rgba(0, 255, 255, ${alpha})`,        // Cyan
      technology: `rgba(100, 255, 100, ${alpha})`, // Green
      portfolio: `rgba(255, 100, 255, ${alpha})`,  // Magenta
      research: `rgba(255, 200, 0, ${alpha})`,     // Gold
      about: `rgba(100, 200, 255, ${alpha})`,      // Light Blue
      contact: `rgba(255, 100, 100, ${alpha})`     // Red
    };
    
    return colors[zoneId] || `rgba(255, 255, 255, ${alpha})`;
  }
  
  getSubZoneColor(subZoneName, alpha = 1) {
    const colors = {
      entry: `rgba(100, 255, 100, ${alpha})`,      // Green
      development: `rgba(255, 255, 100, ${alpha})`, // Yellow  
      flourish: `rgba(255, 100, 255, ${alpha})`,    // Magenta
      transition: `rgba(100, 100, 255, ${alpha})`   // Blue
    };
    
    return colors[subZoneName] || `rgba(255, 255, 255, ${alpha})`;
  }
}

// Export for use by scroll master
window.IntelligentScrollIndicator = IntelligentScrollIndicator;