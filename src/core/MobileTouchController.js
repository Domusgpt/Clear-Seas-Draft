// src/core/MobileTouchController.js
class MobileTouchController {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.touches = new Map();
    this.gestureState = {
      pinching: false,
      rotating: false,
      panning: false
    };
    
    this.lastMoveTime = 0;
    this.lastDistance = null;
    this.lastAngle = null;
    this.panThreshold = 5; // pixels
    this.touchStartTime = 0;
    
    this.setupTouchHandlers();
  }

  setupTouchHandlers() {
    const canvas = this.canvasManager.masterCanvas || document.body;
    
    // Use passive listeners for better scrolling performance
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), 
      { passive: false });
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), 
      { passive: false });
    canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), 
      { passive: true });
    canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this), 
      { passive: true });
  }

  handleTouchStart(event) {
    event.preventDefault();
    this.touchStartTime = Date.now();
    
    for (const touch of event.changedTouches) {
      this.touches.set(touch.identifier, {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: Date.now()
      });
    }
    
    this.detectGesture();
    this.onTouchStart?.(event, this.getTouchData());
  }

  handleTouchMove(event) {
    event.preventDefault();
    
    // Throttle to 60fps
    const now = Date.now();
    if (this.lastMoveTime && now - this.lastMoveTime < 16) return;
    this.lastMoveTime = now;
    
    for (const touch of event.changedTouches) {
      const tracked = this.touches.get(touch.identifier);
      if (tracked) {
        tracked.currentX = touch.clientX;
        tracked.currentY = touch.clientY;
      }
    }
    
    this.processGesture();
    this.onTouchMove?.(event, this.getTouchData());
  }

  handleTouchEnd(event) {
    const touchDuration = Date.now() - this.touchStartTime;
    
    // Detect tap vs long press
    if (touchDuration < 300 && this.touches.size === 1) {
      const touch = Array.from(this.touches.values())[0];
      const distance = Math.sqrt(
        Math.pow(touch.currentX - touch.startX, 2) + 
        Math.pow(touch.currentY - touch.startY, 2)
      );
      
      if (distance < this.panThreshold) {
        this.onTap?.(touch.currentX, touch.currentY);
      }
    }
    
    for (const touch of event.changedTouches) {
      this.touches.delete(touch.identifier);
    }
    
    this.updateGestureState();
    this.onTouchEnd?.(event, this.getTouchData());
  }

  handleTouchCancel(event) {
    this.touches.clear();
    this.resetGestureState();
    this.onTouchCancel?.(event);
  }

  detectGesture() {
    const touchCount = this.touches.size;
    
    if (touchCount === 1) {
      this.gestureState.panning = true;
    } else if (touchCount === 2) {
      this.gestureState.pinching = true;
      this.gestureState.rotating = true;
      
      // Initialize gesture tracking
      const touches = Array.from(this.touches.values());
      this.lastDistance = this.getDistance(touches[0], touches[1]);
      this.lastAngle = this.getAngle(touches[0], touches[1]);
    }
  }

  processGesture() {
    if (this.gestureState.pinching && this.touches.size === 2) {
      const touches = Array.from(this.touches.values());
      const currentDistance = this.getDistance(touches[0], touches[1]);
      const currentAngle = this.getAngle(touches[0], touches[1]);
      
      // Calculate pinch scale
      if (this.lastDistance) {
        const scale = currentDistance / this.lastDistance;
        this.onPinch?.(scale, this.getTouchCenter(touches));
      }
      
      // Calculate rotation
      if (this.lastAngle !== null) {
        let deltaAngle = currentAngle - this.lastAngle;
        
        // Normalize angle difference to [-π, π]
        while (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        while (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
        
        this.onRotate?.(deltaAngle, this.getTouchCenter(touches));
      }
      
      this.lastDistance = currentDistance;
      this.lastAngle = currentAngle;
    }
    
    if (this.gestureState.panning && this.touches.size === 1) {
      const touch = this.touches.values().next().value;
      const deltaX = touch.currentX - touch.startX;
      const deltaY = touch.currentY - touch.startY;
      
      // Only trigger pan if movement exceeds threshold
      if (Math.abs(deltaX) > this.panThreshold || Math.abs(deltaY) > this.panThreshold) {
        this.onPan?.(deltaX, deltaY, touch);
      }
    }
  }

  updateGestureState() {
    const touchCount = this.touches.size;
    
    if (touchCount === 0) {
      this.resetGestureState();
    } else if (touchCount === 1) {
      this.gestureState.panning = true;
      this.gestureState.pinching = false;
      this.gestureState.rotating = false;
    }
  }

  resetGestureState() {
    this.gestureState = {
      pinching: false,
      rotating: false,
      panning: false
    };
    this.lastDistance = null;
    this.lastAngle = null;
  }

  getDistance(touch1, touch2) {
    const dx = touch2.currentX - touch1.currentX;
    const dy = touch2.currentY - touch1.currentY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getAngle(touch1, touch2) {
    const dx = touch2.currentX - touch1.currentX;
    const dy = touch2.currentY - touch1.currentY;
    return Math.atan2(dy, dx);
  }

  getTouchCenter(touches) {
    if (touches.length === 0) return { x: 0, y: 0 };
    
    const centerX = touches.reduce((sum, touch) => sum + touch.currentX, 0) / touches.length;
    const centerY = touches.reduce((sum, touch) => sum + touch.currentY, 0) / touches.length;
    
    return { x: centerX, y: centerY };
  }

  getTouchData() {
    return {
      touches: Array.from(this.touches.values()),
      gestureState: { ...this.gestureState },
      touchCount: this.touches.size
    };
  }

  // Event handlers (to be overridden)
  onTouchStart = null;
  onTouchMove = null;
  onTouchEnd = null;
  onTouchCancel = null;
  onTap = null;
  onPan = null;
  onPinch = null;
  onRotate = null;

  // Convenience method to set up common touch interactions
  setupVisualizationControls(visualizationSystem) {
    this.onPan = (deltaX, deltaY, touch) => {
      if (visualizationSystem.handlePan) {
        const normalizedX = deltaX / window.innerWidth;
        const normalizedY = deltaY / window.innerHeight;
        visualizationSystem.handlePan(normalizedX, normalizedY);
      }
    };

    this.onPinch = (scale, center) => {
      if (visualizationSystem.handleZoom) {
        visualizationSystem.handleZoom(scale, center);
      }
    };

    this.onRotate = (deltaAngle, center) => {
      if (visualizationSystem.handleRotate) {
        visualizationSystem.handleRotate(deltaAngle, center);
      }
    };

    this.onTap = (x, y) => {
      if (visualizationSystem.handleTap) {
        visualizationSystem.handleTap(x, y);
      }
    };
  }

  dispose() {
    const canvas = this.canvasManager.masterCanvas || document.body;
    
    canvas.removeEventListener('touchstart', this.handleTouchStart);
    canvas.removeEventListener('touchmove', this.handleTouchMove);
    canvas.removeEventListener('touchend', this.handleTouchEnd);
    canvas.removeEventListener('touchcancel', this.handleTouchCancel);
    
    this.touches.clear();
    this.resetGestureState();
  }
}

export default MobileTouchController;