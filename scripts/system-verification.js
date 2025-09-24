/*
 * SYSTEM VERIFICATION TOOL
 * Validates that the Unified Experience Engine system is working correctly
 * Provides diagnostic information and performance metrics
 */

class SystemVerification {
  constructor() {
    this.results = {};
    this.startTime = performance.now();
  }

  async runVerification() {
    console.log('🔍 Starting Unified Experience Engine System Verification...');
    
    // Test 1: Check if UnifiedExperienceEngine is available
    this.testUnifiedEngineAvailability();
    
    // Test 2: Check coordinated subsystems
    this.testCoordinatedSubsystems();
    
    // Test 3: Test unified RAF loop
    this.testUnifiedRAFLoop();
    
    // Test 4: Test system coordination
    await this.testSystemCoordination();
    
    // Test 5: Performance metrics
    this.testPerformanceMetrics();
    
    // Generate report
    this.generateReport();
  }

  testUnifiedEngineAvailability() {
    console.log('📋 Test 1: Unified Experience Engine Availability');
    
    this.results.unifiedEngine = {
      classAvailable: typeof window.UnifiedExperienceEngine !== 'undefined',
      instanceAvailable: typeof window.unifiedEngine !== 'undefined',
      isActive: window.unifiedEngine ? window.unifiedEngine.isActive : false,
      state: window.unifiedEngine ? window.unifiedEngine.getState() : null
    };
    
    if (this.results.unifiedEngine.classAvailable && this.results.unifiedEngine.instanceAvailable) {
      console.log('✅ UnifiedExperienceEngine is available and initialized');
      console.log('📊 Current engine state:', {
        scroll: this.results.unifiedEngine.state?.scroll,
        performance: this.results.unifiedEngine.state?.performance
      });
    } else if (this.results.unifiedEngine.classAvailable) {
      console.log('⚠️ UnifiedExperienceEngine class available but not initialized');
    } else {
      console.log('❌ UnifiedExperienceEngine is not available');
    }
  }

  testCoordinatedSubsystems() {
    console.log('📋 Test 2: Unified Engine Components');
    
    if (!window.unifiedEngine) {
      console.log('❌ Cannot test components - UnifiedEngine not available');
      this.results.components = { available: false };
      return;
    }
    
    const engine = window.unifiedEngine;
    this.results.components = {
      available: true,
      zones: engine.zones ? engine.zones.size : 0,
      visualizers: engine.visualizers ? engine.visualizers.size : 0,
      isActive: engine.isActive,
      rafId: engine.rafId !== null
    };
    
    console.log(`✅ Zones defined: ${this.results.components.zones}`);
    console.log(`✅ Visualizers registered: ${this.results.components.visualizers}`);
    console.log(`✅ Engine active: ${this.results.components.isActive ? 'Yes' : 'No'}`);
    console.log(`✅ RAF loop running: ${this.results.components.rafId ? 'Yes' : 'No'}`);
    
    // List active zones
    if (engine.zones) {
      console.log('📊 Available zones:', Array.from(engine.zones.keys()));
    }
  }

  testUnifiedRAFLoop() {
    console.log('📋 Test 3: Unified RAF Loop');
    
    let rafCount = 0;
    const startTime = performance.now();
    
    // Monitor RAF calls for 1 second
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      rafCount++;
      return originalRAF.call(window, callback);
    };
    
    setTimeout(() => {
      window.requestAnimationFrame = originalRAF;
      const endTime = performance.now();
      const duration = endTime - startTime;
      const fps = (rafCount / duration) * 1000;
      
      this.results.rafLoop = {
        calls: rafCount,
        duration: duration,
        estimatedFPS: fps,
        unified: rafCount < 5 // Should be low if unified properly
      };
      
      console.log(`📊 RAF calls in 1s: ${rafCount}, Estimated FPS: ${fps.toFixed(2)}`);
      
      if (rafCount < 5) {
        console.log('✅ RAF loop appears to be unified (low call count)');
      } else {
        console.log('⚠️ Multiple RAF loops detected - may indicate coordination issues');
      }
    }, 1000);
  }

  async testSystemCoordination() {
    console.log('📋 Test 4: System Coordination');
    
    return new Promise((resolve) => {
      if (!window.unifiedEngine) {
        console.log('❌ Cannot test coordination - UnifiedEngine not available');
        this.results.coordination = { available: false };
        resolve();
        return;
      }

      // Test coordination by checking engine state changes
      const engine = window.unifiedEngine;
      const initialState = {
        scrollY: engine.state.scroll.y,
        zone: engine.state.scroll.zone?.id || null
      };
      
      let stateChanges = 0;
      const originalScroll = window.scrollY;
      
      // Monitor state changes
      const checkStateChange = () => {
        const currentState = {
          scrollY: engine.state.scroll.y,
          zone: engine.state.scroll.zone?.id || null
        };
        
        if (currentState.scrollY !== initialState.scrollY || currentState.zone !== initialState.zone) {
          stateChanges++;
        }
      };
      
      // Trigger a small scroll
      window.scrollTo({ top: Math.max(100, originalScroll + 50), behavior: 'smooth' });
      
      // Check state changes multiple times
      const checkInterval = setInterval(checkStateChange, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        // Restore original scroll position
        window.scrollTo({ top: originalScroll, behavior: 'auto' });
        
        this.results.coordination = {
          available: true,
          stateChanges: stateChanges,
          working: stateChanges > 0,
          engineActive: engine.isActive
        };
        
        if (stateChanges > 0) {
          console.log(`✅ System coordination working (${stateChanges} state changes detected)`);
        } else {
          console.log('⚠️ No state changes detected during scroll test');
        }
        
        console.log(`📊 Engine active: ${engine.isActive}, RAF running: ${engine.rafId !== null}`);
        
        resolve();
      }, 1000);
    });
  }

  testPerformanceMetrics() {
    console.log('📋 Test 5: Performance Metrics');
    
    // Check memory usage
    const memInfo = performance.memory ? {
      used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
      total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
      limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
    } : null;
    
    // Check timing performance
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    
    this.results.performance = {
      memory: memInfo,
      loadTime: loadTime,
      verificationTime: performance.now() - this.startTime
    };
    
    console.log('📊 Performance Metrics:');
    if (memInfo) {
      console.log(`   Memory: ${memInfo.used}MB / ${memInfo.total}MB (limit: ${memInfo.limit}MB)`);
    }
    console.log(`   Page Load Time: ${loadTime}ms`);
    console.log(`   Verification Time: ${this.results.performance.verificationTime.toFixed(2)}ms`);
  }

  generateReport() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;
    
    console.log('\n🎯 UNIFIED EXPERIENCE ENGINE VERIFICATION REPORT');
    console.log('='*50);
    
    // Overall status
    const overallHealthy = 
      this.results.unifiedEngine?.classAvailable &&
      this.results.unifiedEngine?.instanceAvailable &&
      this.results.rafLoop?.unified &&
      (this.results.coordination?.working ?? true);
    
    console.log(`Overall Status: ${overallHealthy ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}`);
    console.log(`Verification Time: ${totalTime.toFixed(2)}ms\n`);
    
    // Detailed results
    console.log('📊 Detailed Results:');
    console.log('Unified Engine Available:', this.results.unifiedEngine?.instanceAvailable ? '✅' : '❌');
    console.log('Engine Components:', 
      `Zones: ${this.results.components?.zones || 0}, Visualizers: ${this.results.components?.visualizers || 0}`);
    console.log('RAF Loop Unified:', this.results.rafLoop?.unified ? '✅' : '⚠️');
    console.log('System Coordination:', this.results.coordination?.working ? '✅' : '⚠️');
    
    if (this.results.performance?.memory) {
      console.log(`Memory Usage: ${this.results.performance.memory.used}MB`);
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (!this.results.unifiedEngine?.instanceAvailable) {
      console.log('- Check that unified-experience-engine.js is loaded properly');
      console.log('- Verify no syntax errors are preventing initialization');
    }
    if (!this.results.rafLoop?.unified) {
      console.log('- Multiple RAF loops detected - legacy systems may still be running');
    }
    if (!this.results.coordination?.working) {
      console.log('- Engine coordination may not be working - check console for errors');
    }
    if (this.results.components?.zones === 0) {
      console.log('- No zones detected - check section elements have proper IDs');
    }
    if (overallHealthy) {
      console.log('- Unified Experience Engine is operating correctly! 🎉');
      console.log('- All scroll conflicts should be resolved');
    }
    
    console.log('\n' + '='*50);
    
    // Store results for external access
    window.verificationResults = this.results;
    
    return this.results;
  }
}

// Auto-run verification if this script is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for systems to initialize
    setTimeout(() => {
      window.systemVerification = new SystemVerification();
      
      // Provide easy access function
      window.runVerification = () => {
        window.systemVerification.runVerification();
      };
      
      console.log('🔧 System Verification Tool loaded.');
      console.log('💻 Run "runVerification()" in console to test the Unified Experience Engine.');
    }, 2000);
  });
}

// Export for manual use
window.SystemVerification = SystemVerification;