(function () {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navigation = document.getElementById('primary-navigation');

  const updateHeaderState = () => {
    if (!header) return;
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  if (navToggle && navigation) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navigation.classList.toggle('is-open', !expanded);
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navigation.classList.remove('is-open');
      });
    });
  }

  const revealables = document.querySelectorAll('[data-animate="reveal"]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    revealables.forEach((element) => observer.observe(element));
  } else {
    revealables.forEach((element) => element.classList.add('is-visible'));
  }

  const canvas = document.getElementById('polytopal-field');
  if (canvas && canvas.getContext) {
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let teardownPolytopal = null;
    let staticResizeHandler = null;

    const drawStaticGradient = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.08)');
      gradient.addColorStop(1, 'rgba(255, 0, 110, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const enableStaticGradient = () => {
      drawStaticGradient();
      if (!staticResizeHandler) {
        staticResizeHandler = throttle(drawStaticGradient, 200);
        window.addEventListener('resize', staticResizeHandler, { passive: true });
      }
    };

    const disableStaticGradient = () => {
      if (staticResizeHandler) {
        window.removeEventListener('resize', staticResizeHandler);
        staticResizeHandler = null;
      }
    };

    if (!reduceMotionQuery.matches) {
      teardownPolytopal = initPolytopalField(canvas);
      disableStaticGradient();
    } else {
      enableStaticGradient();
    }

    const handleReduceMotionChange = (event) => {
      if (event.matches) {
        if (typeof teardownPolytopal === 'function') {
          teardownPolytopal();
          teardownPolytopal = null;
        }
        enableStaticGradient();
      } else if (!teardownPolytopal) {
        disableStaticGradient();
        teardownPolytopal = initPolytopalField(canvas);
      }
    };

    if (reduceMotionQuery.addEventListener) {
      reduceMotionQuery.addEventListener('change', handleReduceMotionChange);
    } else if (reduceMotionQuery.addListener) {
      reduceMotionQuery.addListener(handleReduceMotionChange);
    }
  }

  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
})();

function initPolytopalField(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let animationFrameId = null;
  let nodes = [];

  const pointer = { x: 0, y: 0, active: false };

  const settings = {
    baseCount: 70,
    maxVelocity: 0.35,
    connectionDistance: 180
  };

  const createNode = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * settings.maxVelocity,
    vy: (Math.random() - 0.5) * settings.maxVelocity,
    radius: Math.random() * 1.4 + 0.8
  });

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const deviceRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * deviceRatio;
    canvas.height = height * deviceRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(deviceRatio, deviceRatio);

    const nodeCount = Math.round(settings.baseCount * (width / 1280 + 0.4));
    nodes = Array.from({ length: nodeCount }, createNode);
  };

  const updateNodes = () => {
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < -50) node.x = width + 50;
      if (node.x > width + 50) node.x = -50;
      if (node.y < -50) node.y = height + 50;
      if (node.y > height + 50) node.y = -50;

      if (pointer.active) {
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const distSq = dx * dx + dy * dy + 0.001;
        const influence = Math.min(0.45, 1200 / distSq);
        node.vx += dx * influence * 0.00035;
        node.vy += dy * influence * 0.00035;
      }

      node.vx = clamp(node.vx, -settings.maxVelocity, settings.maxVelocity);
      node.vy = clamp(node.vy, -settings.maxVelocity, settings.maxVelocity);
    });
  };

  const drawConnections = () => {
    const maxDistance = settings.connectionDistance * (width < 768 ? 0.75 : 1);

    for (let i = 0; i < nodes.length; i += 1) {
      const nodeA = nodes[i];

      for (let j = i + 1; j < nodes.length; j += 1) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.hypot(dx, dy);

        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.45;
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        }
      }

      if (pointer.active) {
        const dxPointer = nodeA.x - pointer.x;
        const dyPointer = nodeA.y - pointer.y;
        const pointerDistance = Math.hypot(dxPointer, dyPointer);
        const pointerThreshold = maxDistance * 1.1;

        if (pointerDistance < pointerThreshold) {
          const alpha = (1 - pointerDistance / pointerThreshold) * 0.6;
          ctx.strokeStyle = `rgba(255, 0, 110, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }
  };

  const drawNodes = () => {
    nodes.forEach((node) => {
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 8);
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.55)');
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
      ctx.fill();
    });

    if (pointer.active) {
      const pointerGradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 120);
      pointerGradient.addColorStop(0, 'rgba(255, 0, 110, 0.25)');
      pointerGradient.addColorStop(1, 'rgba(255, 0, 110, 0)');
      ctx.fillStyle = pointerGradient;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 120, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const renderFrame = () => {
    ctx.clearRect(0, 0, width, height);

    const backdropGradient = ctx.createLinearGradient(0, 0, width, height);
    backdropGradient.addColorStop(0, 'rgba(0, 212, 255, 0.07)');
    backdropGradient.addColorStop(1, 'rgba(255, 0, 110, 0.05)');
    ctx.fillStyle = backdropGradient;
    ctx.fillRect(0, 0, width, height);

    updateNodes();
    drawConnections();
    drawNodes();

    animationFrameId = window.requestAnimationFrame(renderFrame);
  };

  const throttledResize = throttle(resizeCanvas, 250);
  window.addEventListener('resize', throttledResize, { passive: true });

  const handleMouseMove = (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  };

  const handleMouseLeave = () => {
    pointer.active = false;
  };

  const handleTouchMove = (event) => {
    if (event.touches && event.touches.length > 0) {
      pointer.x = event.touches[0].clientX;
      pointer.y = event.touches[0].clientY;
      pointer.active = true;
    }
  };

  const handleTouchEnd = () => {
    pointer.active = false;
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  window.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchend', handleTouchEnd);

  resizeCanvas();
  renderFrame();

  return () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener('resize', throttledResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);

    ctx.clearRect(0, 0, width, height);
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function throttle(callback, wait) {
  let ticking = false;
  let lastArgs;

  const invoke = () => {
    ticking = false;
    if (lastArgs) {
      callback.apply(null, lastArgs);
      lastArgs = null;
    } else {
      callback();
    }
  };

  return function throttledFunction(...args) {
    lastArgs = args;
    if (!ticking) {
      ticking = true;
      window.setTimeout(invoke, wait);
    }
  };
}
