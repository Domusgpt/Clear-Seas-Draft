/*
 * COORDINATED ZONE PACING CONTROLLER
 * Works with MasterConductor for scroll timing and zone presentation
 * Removes independent RAF loops and integrates with unified timing
 */

class CoordinatedZonePacingController {
  constructor(masterConductor, scrollMaster) {
    this.masterConductor = masterConductor;
    this.scrollMaster = scrollMaster;
    this.currentZone = null;
    this.zoneState = {
      isTransitioning: false,
      transitionStartTime: 0,
      currentSubZone: null,
      zoneEnterTime: 0,
      minimumZoneTime: 500, // Quick 500ms minimum
      transitionCooldown: 200, // Fast 200ms cooldown
      lastTransitionTime: 0
    };
    
    this.scrollState = {
      velocity: 0,
      damping: 1.0,
      isDamped: false,
      pendingScroll: 0,
      needsUpdate: false
    };
    
    // Fast presentation timings - immediate response
    this.zonePresentationTimes = {
      hero: { entry: 200, development: 600, flourish: 400, transition: 200 },
      technology: { entry: 150, development: 500, flourish: 350, transition: 150 },
      portfolio: { entry: 200, development: 550, flourish: 400, transition: 200 },
      research: { entry: 180, development: 650, flourish: 450, transition: 180 },
      about: { entry: 100, development: 400, flourish: 300, transition: 100 },
      contact: { entry: 150, development: 450, flourish: 350, transition: 150 }
    };
    
    // Store original scroll functions for internal use
    this.originalScrollTo = window.scrollTo.bind(window);
    this.originalScrollBy = window.scrollBy.bind(window);
    
    this.init();
  }
  
  init() {
    this.setupScrollInterception();
    this.createZoneProgressIndicators();
    
    // Register with master conductor for coordinated updates
    this.masterConductor.registerSystem('zonePacingController', this);
    
    console.log('⏱️ Coordinated Zone Pacing Controller - Initialized with MasterConductor integration');
  }
  
  // COORDINATED UPDATE METHOD - Called by MasterConductor
  coordinatedUpdate(timing) {
    if (!this.scrollState.needsUpdate) return;
    
    const startTime = performance.now();
    
    // Track zone progress with coordinated timing
    this.trackZoneProgress(timing);
    
    // Update zone progress indicators
    this.updateZoneProgressIndicators();
    
    // Check for extended presentation requirements
    this.checkExtendedPresentationRequirements();
    
    // Report performance back to conductor
    const frameTime = performance.now() - startTime;
    this.masterConductor.reportSystemPerformance('zonePacingController', frameTime);
    
    this.scrollState.needsUpdate = false;
  }
  
  setupScrollInterception() {
    // Override scrollTo with pacing control
    window.scrollTo = (options) => {
      if (typeof options === 'object') {
        this.controlledScrollTo(options.top || 0, options.behavior || 'auto');
      } else {
        this.controlledScrollTo(options || 0, 'auto');
      }
    };
    
    // Override scrollBy with pacing control
    window.scrollBy = (options) => {
      if (typeof options === 'object') {
        const targetY = window.scrollY + (options.top || 0);
        this.controlledScrollTo(targetY, options.behavior || 'auto');
      } else {
        const targetY = window.scrollY + (options || 0);
        this.controlledScrollTo(targetY, 'auto');
      }
    };
  }
  
  controlledScrollTo(targetY, behavior = 'smooth') {
    const currentTime = performance.now();
    const currentY = window.scrollY;
    const deltaY = targetY - currentY;
    
    // Check if we're trying to transition zones too quickly
    if (this.shouldDampScroll(targetY, deltaY)) {
      this.applyScrollDamping(targetY, deltaY);
      return;
    }
    
    // Check if we need to enforce zone presentation timing
    if (this.shouldEnforceZoneTiming(targetY)) {
      this.enforceZonePresentationTime(targetY);
      return;
    }
    
    // Allow normal scroll
    this.executeControlledScroll(targetY, behavior);
  }
  
  shouldDampScroll(targetY, deltaY) {
    const currentZone = this.getCurrentZoneFromY(window.scrollY);
    const targetZone = this.getCurrentZoneFromY(targetY);
    
    // Damp if trying to skip zones or scroll too fast through zones
    if (currentZone !== targetZone) {
      const timeSinceLastTransition = performance.now() - this.zoneState.lastTransitionTime;
      
      // Enforce cooldown between zone transitions
      if (timeSinceLastTransition < this.zoneState.transitionCooldown) {
        return true;
      }
      
      // Check if current zone has had minimum presentation time
      const timeInCurrentZone = performance.now() - this.zoneState.zoneEnterTime;
      if (timeInCurrentZone < this.zoneState.minimumZoneTime) {
        return true;
      }
    }
    
    // Damp very fast scrolling
    const scrollSpeed = Math.abs(deltaY);
    if (scrollSpeed > window.innerHeight * 2) {
      return true;
    }
    
    return false;
  }
  
  shouldEnforceZoneTiming(targetY) {
    const currentZone = this.getCurrentZoneFromY(window.scrollY);
    const targetZone = this.getCurrentZoneFromY(targetY);
    
    if (currentZone && currentZone !== targetZone) {
      const currentSubZone = this.getCurrentSubZone(currentZone, window.scrollY);
      
      // Check if current sub-zone has had enough presentation time
      if (currentSubZone && this.zoneState.currentSubZone === currentSubZone.name) {
        const timeInSubZone = performance.now() - this.zoneState.subZoneEnterTime;
        const requiredTime = this.zonePresentationTimes[currentZone.id]?.[currentSubZone.name] || 2000;
        
        return timeInSubZone < requiredTime;
      }
    }
    
    return false;
  }
  
  applyScrollDamping(targetY, deltaY) {
    console.log('🛑 Coordinated scroll damping applied - Slowing down zone transition');
    
    // Create visual feedback for damped scroll
    this.showScrollDampingFeedback();
    
    // Apply heavy damping to scroll velocity
    const dampingFactor = 0.2;
    const dampedDelta = deltaY * dampingFactor;
    const intermediateTarget = window.scrollY + dampedDelta;
    
    // Use MasterConductor's coordinated animation
    this.masterConductor.requestCoordinatedAnimation({
      type: 'scroll',
      target: intermediateTarget,
      duration: 800,
      easing: 'ease-out'
    });
    
    // Queue the full scroll for later
    setTimeout(() => {
      if (!this.shouldDampScroll(targetY, targetY - window.scrollY)) {
        this.masterConductor.requestCoordinatedAnimation({
          type: 'scroll',
          target: targetY,
          duration: 1200,
          easing: 'ease-in-out'
        });
      }
    }, 1000);
  }
  
  enforceZonePresentationTime(targetY) {
    console.log('⏳ Enforcing coordinated zone presentation timing');
    
    const currentZone = this.getCurrentZoneFromY(window.scrollY);
    const currentSubZone = this.getCurrentSubZone(currentZone, window.scrollY);
    
    if (currentSubZone) {
      const timeInSubZone = performance.now() - (this.zoneState.subZoneEnterTime || 0);
      const requiredTime = this.zonePresentationTimes[currentZone.id]?.[currentSubZone.name] || 2000;
      const remainingTime = Math.max(0, requiredTime - timeInSubZone);
      
      // Show presentation timing feedback
      this.showPresentationTimingFeedback(currentZone, currentSubZone, remainingTime);
      
      // Allow slow, controlled movement toward target
      const allowedMovement = Math.min(Math.abs(targetY - window.scrollY), window.innerHeight * 0.1);
      const direction = targetY > window.scrollY ? 1 : -1;
      const controlledTarget = window.scrollY + (allowedMovement * direction);
      
      // Use MasterConductor's coordinated animation
      this.masterConductor.requestCoordinatedAnimation({
        type: 'scroll',
        target: controlledTarget,
        duration: remainingTime / 2,
        easing: 'ease-out'
      });
      
      // Queue full movement after timing requirement is met
      setTimeout(() => {
        this.masterConductor.requestCoordinatedAnimation({
          type: 'scroll',
          target: targetY,
          duration: 1000,
          easing: 'ease-in-out'
        });
      }, remainingTime);
    }
  }
  
  executeControlledScroll(targetY, behavior) {
    // Update zone state
    this.updateZoneState(targetY);
    
    // Use MasterConductor's coordinated scroll
    this.masterConductor.requestCoordinatedAnimation({
      type: 'scroll',
      target: targetY,
      duration: behavior === 'smooth' ? 800 : 0,
      easing: 'ease-in-out'
    });
  }
  
  updateZoneState(targetY) {
    const newZone = this.getCurrentZoneFromY(targetY);
    
    if (newZone !== this.currentZone) {
      // Zone transition
      this.zoneState.lastTransitionTime = performance.now();
      this.zoneState.zoneEnterTime = performance.now();
      this.zoneState.isTransitioning = true;
      
      console.log(`🌊 Coordinated zone transition to ${newZone?.id || 'none'} with pacing control`);
      
      setTimeout(() => {
        this.zoneState.isTransitioning = false;
      }, this.zoneState.transitionCooldown);
      
      this.currentZone = newZone;
    }
    
    // Update sub-zone state
    const newSubZone = this.getCurrentSubZone(newZone, targetY);
    if (newSubZone && newSubZone.name !== this.zoneState.currentSubZone) {
      this.zoneState.currentSubZone = newSubZone.name;
      this.zoneState.subZoneEnterTime = performance.now();
      
      // Trigger sub-zone presentation
      this.triggerSubZonePresentation(newZone, newSubZone);
    }
    
    // Flag for coordinated update
    this.scrollState.needsUpdate = true;
  }
  
  getCurrentZoneFromY(scrollY) {
    // Use scroll master's zone detection
    return this.scrollMaster.determineCurrentZone(scrollY);
  }
  
  getCurrentSubZone(zone, scrollY) {
    if (!zone) return null;
    return this.scrollMaster.determineSubZone(zone, scrollY);
  }
  
  triggerSubZonePresentation(zone, subZone) {
    console.log(`🎭 Starting coordinated ${subZone.name} presentation for ${zone.id}`);
    
    // Add presentation timing classes
    if (zone.element) {
      zone.element.classList.add(`presenting-${subZone.name}`);
      zone.element.classList.add('zone-presenting');
      
      // Get presentation time for this sub-zone
      const presentationTime = this.zonePresentationTimes[zone.id]?.[subZone.name] || 2000;
      
      // Remove presentation classes after timing
      setTimeout(() => {
        zone.element.classList.remove(`presenting-${subZone.name}`);
        
        // Check if this was the last sub-zone presentation
        const presentingClasses = Array.from(zone.element.classList).filter(c => c.startsWith('presenting-'));
        if (presentingClasses.length === 0) {
          zone.element.classList.remove('zone-presenting');
        }
      }, presentationTime);
    }
    
    // Update visualizer with presentation timing
    if (zone.visualizerInstance) {
      zone.visualizerInstance.updateParameters({
        presentationMode: subZone.name,
        presentationProgress: 0,
        presentationDuration: this.zonePresentationTimes[zone.id]?.[subZone.name] || 2000
      });
      
      // Use MasterConductor for coordinated presentation progress
      this.masterConductor.requestCoordinatedAnimation({
        type: 'custom',
        duration: this.zonePresentationTimes[zone.id]?.[subZone.name] || 2000,
        onUpdate: (progress) => {
          if (zone.visualizerInstance) {
            zone.visualizerInstance.updateParameters({
              presentationProgress: progress
            });
          }
        }
      });
    }
  }
  
  trackZoneProgress(timing) {
    const currentY = window.scrollY;
    const currentZone = this.getCurrentZoneFromY(currentY);
    
    if (currentZone) {
      const subZone = this.getCurrentSubZone(currentZone, currentY);
      
      // Store current zone and subzone for indicators
      this.currentDisplayZone = currentZone;
      this.currentDisplaySubZone = subZone;
    }
  }
  
  showScrollDampingFeedback() {
    // Create visual feedback for scroll damping
    const feedback = document.createElement('div');
    feedback.className = 'scroll-damping-feedback';
    feedback.innerHTML = '⏳ Loading zone experience...';
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) translateZ(100px);
      background: rgba(0, 40, 80, 0.9);
      color: rgba(0, 255, 255, 1);
      padding: 15px 25px;
      border-radius: 25px;
      font-size: 0.9rem;
      font-weight: 600;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 255, 255, 0.3);
      z-index: 10002;
      animation: dampingFeedbackPulse 2s ease-in-out;
      pointer-events: none;
    `;
    
    // Add feedback animation
    if (!document.head.querySelector('#damping-feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'damping-feedback-styles';
      style.textContent = `
        @keyframes dampingFeedbackPulse {
          0% { opacity: 0; transform: translate(-50%, -50%) translateZ(100px) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -50%) translateZ(100px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translateZ(100px) scale(0.9); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 2000);
  }
  
  showPresentationTimingFeedback(zone, subZone, remainingTime) {
    const feedback = document.createElement('div');
    feedback.className = 'presentation-timing-feedback';
    feedback.innerHTML = `
      <div class="timing-title">${zone.id.toUpperCase()} - ${subZone.name}</div>
      <div class="timing-progress">
        <div class="timing-bar" style="animation: timingProgress ${remainingTime}ms linear"></div>
      </div>
      <div class="timing-text">Experience in progress...</div>
    `;
    
    feedback.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%) translateZ(50px);
      background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.95));
      color: white;
      padding: 20px;
      border-radius: 15px;
      min-width: 280px;
      text-align: center;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(0, 255, 255, 0.2);
      z-index: 10002;
      animation: presentationFeedbackSlide 0.5s ease-out;
    `;
    
    // Add presentation feedback styles
    if (!document.head.querySelector('#presentation-feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'presentation-feedback-styles';
      style.textContent = `
        @keyframes presentationFeedbackSlide {
          0% { opacity: 0; transform: translateX(-50%) translateZ(50px) translateY(50px); }
          100% { opacity: 1; transform: translateX(-50%) translateZ(50px) translateY(0); }
        }
        
        @keyframes timingProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        .timing-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(0, 255, 255, 1);
          margin-bottom: 10px;
          letter-spacing: 1px;
        }
        
        .timing-progress {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .timing-bar {
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(0, 255, 255, 0.8), 
            rgba(255, 255, 255, 1), 
            rgba(0, 255, 255, 0.8));
          width: 0%;
        }
        
        .timing-text {
          font-size: 0.7rem;
          opacity: 0.8;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.animation = 'presentationFeedbackSlide 0.5s ease-in reverse';
      setTimeout(() => feedback.remove(), 500);
    }, remainingTime + 500);
  }
  
  createZoneProgressIndicators() {
    // Enhanced zone indicators showing presentation progress
    const progressContainer = document.createElement('div');
    progressContainer.className = 'zone-progress-indicators';
    progressContainer.style.cssText = `
      position: fixed;
      left: 20px;
      top: 50%;
      transform: translateY(-50%) translateZ(50px);
      z-index: 10001;
      pointer-events: none;
    `;
    
    // Create indicators for each zone
    const zones = ['hero', 'technology', 'portfolio', 'research', 'about', 'contact'];
    zones.forEach((zoneId, index) => {
      const indicator = document.createElement('div');
      indicator.className = `zone-progress-indicator zone-indicator-${zoneId}`;
      indicator.style.cssText = `
        width: 6px;
        height: 40px;
        background: linear-gradient(180deg, 
          rgba(255, 255, 255, 0.1) 0%,
          rgba(0, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0.1) 100%);
        margin-bottom: 10px;
        border-radius: 3px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      `;
      
      // Add progress bar inside indicator
      const progressBar = document.createElement('div');
      progressBar.className = 'zone-progress-bar';
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background: linear-gradient(180deg,
          rgba(0, 255, 255, 1) 0%,
          rgba(255, 255, 255, 0.9) 100%);
        transition: height 0.5s ease-out;
      `;
      
      indicator.appendChild(progressBar);
      progressContainer.appendChild(indicator);
    });
    
    document.body.appendChild(progressContainer);
    this.progressContainer = progressContainer;
  }
  
  updateZoneProgressIndicators() {
    if (!this.progressContainer || !this.currentDisplayZone) return;
    
    const indicators = this.progressContainer.querySelectorAll('.zone-progress-indicator');
    indicators.forEach((indicator, index) => {
      const progressBar = indicator.querySelector('.zone-progress-bar');
      
      if (indicator.classList.contains(`zone-indicator-${this.currentDisplayZone.id}`)) {
        // Current zone - show sub-zone progress
        const progress = this.currentDisplaySubZone ? this.currentDisplaySubZone.progress * 100 : 0;
        progressBar.style.height = `${progress}%`;
        
        indicator.style.background = `linear-gradient(180deg, 
          rgba(0, 255, 255, 0.6) 0%,
          rgba(255, 255, 255, 0.8) 50%,
          rgba(0, 255, 255, 0.6) 100%)`;
        indicator.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
        indicator.style.width = '8px';
      } else {
        // Other zones
        progressBar.style.height = '0%';
        indicator.style.background = `linear-gradient(180deg, 
          rgba(255, 255, 255, 0.1) 0%,
          rgba(0, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0.1) 100%)`;
        indicator.style.boxShadow = 'none';
        indicator.style.width = '6px';
      }
    });
  }
  
  checkExtendedPresentationRequirements() {
    // Check if zone needs extended presentation time
    if (!this.currentDisplaySubZone) return;
    
    const timeInSubZone = performance.now() - (this.zoneState.subZoneEnterTime || 0);
    const requiredTime = this.zonePresentationTimes[this.currentDisplayZone.id]?.[this.currentDisplaySubZone.name] || 2000;
    
    // If we're in flourish sub-zone, ensure dramatic presentation
    if (this.currentDisplaySubZone.name === 'flourish' && timeInSubZone < requiredTime * 0.8) {
      // Apply flourish effects
      this.triggerFlourishEffects(this.currentDisplayZone, this.currentDisplaySubZone);
    }
  }
  
  triggerFlourishEffects(zone, subZone) {
    if (!zone.element) return;
    
    // Enhanced flourish effects - coordinated with MasterConductor
    this.masterConductor.requestCoordinatedAnimation({
      type: 'custom',
      duration: 2000,
      onUpdate: (progress) => {
        const intensity = Math.sin(progress * Math.PI); // Bell curve
        zone.element.style.transition = 'all 0.1s ease';
        zone.element.style.transform = `translateZ(${20 + 40 * intensity}px) scale(${1 + 0.03 * intensity})`;
        zone.element.style.filter = `brightness(${1 + 0.2 * intensity}) saturate(${1 + 0.3 * intensity}) contrast(${1 + 0.1 * intensity})`;
        zone.element.style.boxShadow = `0 ${30 * intensity}px ${80 * intensity}px rgba(0, 0, 0, 0.4), 0 0 ${60 * intensity}px rgba(0, 255, 255, 0.4)`;
      },
      onComplete: () => {
        zone.element.style.transform = 'translateZ(20px) scale(1.0)';
        zone.element.style.filter = '';
        zone.element.style.boxShadow = '';
      }
    });
  }
  
  // Method for MasterConductor to get current state
  getPacingState() {
    return {
      currentZone: this.currentZone,
      zoneState: this.zoneState,
      scrollState: this.scrollState,
      needsUpdate: this.scrollState.needsUpdate
    };
  }
  
  // Cleanup method for proper disposal
  destroy() {
    // Restore original scroll functions
    window.scrollTo = this.originalScrollTo;
    window.scrollBy = this.originalScrollBy;
    
    // Remove progress indicators
    if (this.progressContainer) {
      this.progressContainer.remove();
    }
    
    console.log('⏱️ Coordinated Zone Pacing Controller destroyed');
  }
}

// Export for MasterConductor
window.CoordinatedZonePacingController = CoordinatedZonePacingController;