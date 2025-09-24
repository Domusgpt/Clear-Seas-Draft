/**
 * Polychora4DPhysics - Real 4D physics engine for polytope simulation
 * Handles 4D rigid body dynamics, collisions, and organic motion
 */

export class Polychora4DPhysics {
    constructor() {
        // 4D physics world properties
        this.gravity4D = [0, 0, 0, -2.5];  // 4D gravitational field
        this.airResistance = 0.02;         // 4D drag coefficient
        this.timeStep = 1.0 / 60.0;        // Physics simulation timestep
        
        // 4D rigid bodies (polytopes)
        this.bodies = [];
        
        // Physics parameters
        this.enabled = false;
        this.paused = false;
        
        // Environmental forces
        this.magneticField = [0, 0, 1, 0];  // 4D magnetic field
        this.fluidFlow = [0.5, 0, 0, 0];   // 4D fluid current
        
        console.log('🔮 Polychora4DPhysics initialized');
    }
    
    /**
     * Create a 4D rigid body for a polytope
     */
    createRigidBody(polytypeType, position = [0, 0, 0, 0], options = {}) {
        const body = {
            id: this.generateBodyId(),
            polytopeType: polytypeType,
            
            // 4D position and orientation
            position: [...position],          // 4D position vector
            velocity: [0, 0, 0, 0],          // 4D velocity
            acceleration: [0, 0, 0, 0],       // 4D acceleration
            
            // 4D rotational state (6 rotational degrees of freedom)
            rotation: [0, 0, 0, 0, 0, 0],    // XY, XZ, YZ, XW, YW, ZW rotations
            angularVelocity: [0, 0, 0, 0, 0, 0], // 6D angular velocity
            angularAcceleration: [0, 0, 0, 0, 0, 0], // 6D angular acceleration
            
            // Physical properties
            mass: options.mass || 1.0,
            inertia4D: this.calculate4DInertia(polytypeType, options.mass || 1.0),
            elasticity: options.elasticity || 0.8,      // Bounce factor
            friction: options.friction || 0.1,          // Surface friction
            
            // Material properties
            density: options.density || 1.0,
            viscosity: options.viscosity || 0.0,
            
            // Behavioral properties
            brownianMotion: options.brownianMotion || 0.1,
            magneticSusceptibility: options.magnetic || 0.0,
            
            // Forces acting on body
            forces: [0, 0, 0, 0],            // Current force accumulator
            torques: [0, 0, 0, 0, 0, 0],     // Current 6D torque accumulator
            
            // Collision properties
            boundingRadius: this.calculateBoundingRadius(polytypeType),
            collisionGroup: options.group || 0,
            
            // Animation and organic behavior
            targetPosition: null,            // For seeking behavior
            flockingBehavior: options.flocking || false,
            territorialRadius: options.territorial || 2.0,
            
            // Internal state
            active: true,
            sleeping: false,
            sleepThreshold: 0.01,
            
            // Visual properties for physics feedback
            physicsFeedback: {
                impactIntensity: 0.0,        // Collision feedback
                velocityIntensity: 0.0,      // Speed-based effects
                accelerationGlow: 0.0        // Acceleration-based glow
            }
        };
        
        this.bodies.push(body);
        console.log(`🔮 Created 4D rigid body for polytope ${polytypeType}, ID: ${body.id}`);
        return body;
    }
    
    /**
     * Step the physics simulation
     */
    step(deltaTime = this.timeStep) {
        if (!this.enabled || this.paused) return;
        
        // Apply forces to all bodies
        this.bodies.forEach(body => {
            if (!body.active || body.sleeping) return;
            
            this.clearForces(body);
            this.applyGravity(body);
            this.applyDrag(body);
            this.applyMagneticForces(body);
            this.applyFluidForces(body);
            this.applyBrownianMotion(body);
            this.applyBehavioralForces(body);
        });
        
        // Detect and resolve collisions
        this.detectCollisions();
        
        // Integrate motion
        this.bodies.forEach(body => {
            if (!body.active || body.sleeping) return;
            this.integrate(body, deltaTime);
            this.updateVisualFeedback(body);
            this.checkSleeping(body);
        });
        
        // Update collision spatial partitioning
        this.updateSpatialHash();
    }
    
    /**
     * Apply 4D gravitational force
     */
    applyGravity(body) {
        const force = [
            this.gravity4D[0] * body.mass,
            this.gravity4D[1] * body.mass,
            this.gravity4D[2] * body.mass,
            this.gravity4D[3] * body.mass
        ];
        
        this.addForce(body, force);
    }
    
    /**
     * Apply 4D air resistance
     */
    applyDrag(body) {
        const speed = this.magnitude4D(body.velocity);
        if (speed < 0.001) return;
        
        const dragMagnitude = this.airResistance * speed * speed;
        const dragDirection = this.normalize4D(body.velocity);
        
        const dragForce = [
            -dragDirection[0] * dragMagnitude,
            -dragDirection[1] * dragMagnitude,
            -dragDirection[2] * dragMagnitude,
            -dragDirection[3] * dragMagnitude
        ];
        
        this.addForce(body, dragForce);
    }
    
    /**
     * Apply 4D magnetic forces
     */
    applyMagneticForces(body) {
        if (body.magneticSusceptibility === 0) return;
        
        // 4D Lorentz force: F = q(v × B) in 4D
        const magneticForce = this.cross4D(body.velocity, this.magneticField);
        
        magneticForce.forEach((component, i) => {
            body.forces[i] += component * body.magneticSusceptibility;
        });
    }
    
    /**
     * Apply 4D fluid flow forces
     */
    applyFluidForces(body) {
        const relativeVelocity = [
            this.fluidFlow[0] - body.velocity[0],
            this.fluidFlow[1] - body.velocity[1], 
            this.fluidFlow[2] - body.velocity[2],
            this.fluidFlow[3] - body.velocity[3]
        ];
        
        const flowSpeed = this.magnitude4D(relativeVelocity);
        if (flowSpeed < 0.001) return;
        
        const flowForce = this.multiply4D(relativeVelocity, body.viscosity * flowSpeed);
        this.addForce(body, flowForce);
    }
    
    /**
     * Apply Brownian motion (thermal noise)
     */
    applyBrownianMotion(body) {
        if (body.brownianMotion === 0) return;
        
        const randomForce = [
            (Math.random() - 0.5) * body.brownianMotion,
            (Math.random() - 0.5) * body.brownianMotion,
            (Math.random() - 0.5) * body.brownianMotion,
            (Math.random() - 0.5) * body.brownianMotion
        ];
        
        this.addForce(body, randomForce);
    }
    
    /**
     * Apply behavioral forces (flocking, territorial, seeking)
     */
    applyBehavioralForces(body) {
        if (body.flockingBehavior) {
            this.applyFlockingForce(body);
        }
        
        if (body.targetPosition) {
            this.applySeekingForce(body);
        }
        
        this.applyTerritorialForce(body);
    }
    
    /**
     * Apply flocking behavior (boids algorithm in 4D)
     */
    applyFlockingForce(body) {
        let separation = [0, 0, 0, 0];
        let alignment = [0, 0, 0, 0];
        let cohesion = [0, 0, 0, 0];
        let neighborCount = 0;
        
        const maxDistance = body.territorialRadius;
        
        this.bodies.forEach(other => {
            if (other === body || !other.active) return;
            
            const distance = this.distance4D(body.position, other.position);
            if (distance > maxDistance) return;
            
            neighborCount++;
            
            // Separation: avoid crowding
            if (distance < maxDistance * 0.3) {
                const diff = this.subtract4D(body.position, other.position);
                const separationForce = this.multiply4D(this.normalize4D(diff), 1.0 / (distance + 0.1));
                separation = this.add4D(separation, separationForce);
            }
            
            // Alignment: steer towards average heading
            alignment = this.add4D(alignment, other.velocity);
            
            // Cohesion: steer towards average position
            cohesion = this.add4D(cohesion, other.position);
        });
        
        if (neighborCount > 0) {
            // Apply separation
            if (this.magnitude4D(separation) > 0) {
                separation = this.multiply4D(this.normalize4D(separation), 0.5);
                this.addForce(body, separation);
            }
            
            // Apply alignment
            alignment = this.multiply4D(alignment, 1.0 / neighborCount);
            const alignmentForce = this.multiply4D(this.subtract4D(alignment, body.velocity), 0.3);
            this.addForce(body, alignmentForce);
            
            // Apply cohesion
            cohesion = this.multiply4D(cohesion, 1.0 / neighborCount);
            const cohesionForce = this.multiply4D(this.subtract4D(cohesion, body.position), 0.2);
            this.addForce(body, cohesionForce);
        }
    }
    
    /**
     * Apply seeking force towards target
     */
    applySeekingForce(body) {
        const desired = this.subtract4D(body.targetPosition, body.position);
        const distance = this.magnitude4D(desired);
        
        if (distance < 0.1) {
            body.targetPosition = null; // Reached target
            return;
        }
        
        const seekingForce = this.multiply4D(this.normalize4D(desired), Math.min(distance * 0.5, 2.0));
        this.addForce(body, seekingForce);
    }
    
    /**
     * Apply territorial behavior
     */
    applyTerritorialForce(body) {
        this.bodies.forEach(other => {
            if (other === body || !other.active) return;
            
            const distance = this.distance4D(body.position, other.position);
            const minDistance = body.territorialRadius * 0.5;
            
            if (distance < minDistance) {
                const repulsion = this.subtract4D(body.position, other.position);
                const repulsionForce = this.multiply4D(
                    this.normalize4D(repulsion), 
                    (minDistance - distance) * 2.0
                );
                this.addForce(body, repulsionForce);
            }
        });
    }
    
    /**
     * Detect and resolve 4D collisions
     */
    detectCollisions() {
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];
                
                if (!bodyA.active || !bodyB.active) continue;
                
                const distance = this.distance4D(bodyA.position, bodyB.position);
                const collisionDistance = bodyA.boundingRadius + bodyB.boundingRadius;
                
                if (distance < collisionDistance) {
                    this.resolveCollision(bodyA, bodyB, distance);
                }
            }
        }
    }
    
    /**
     * Resolve 4D collision between two bodies
     */
    resolveCollision(bodyA, bodyB, distance) {
        // Calculate collision normal in 4D
        const normal = this.normalize4D(this.subtract4D(bodyB.position, bodyA.position));
        
        // Separate bodies to prevent overlap
        const overlap = (bodyA.boundingRadius + bodyB.boundingRadius) - distance;
        const separation = this.multiply4D(normal, overlap * 0.5);
        
        bodyA.position = this.subtract4D(bodyA.position, separation);
        bodyB.position = this.add4D(bodyB.position, separation);
        
        // Calculate relative velocity
        const relativeVelocity = this.subtract4D(bodyA.velocity, bodyB.velocity);
        const velocityAlongNormal = this.dot4D(relativeVelocity, normal);
        
        // Don't resolve if velocities are separating
        if (velocityAlongNormal > 0) return;
        
        // Calculate collision impulse
        const restitution = Math.min(bodyA.elasticity, bodyB.elasticity);
        const impulse = -(1 + restitution) * velocityAlongNormal / (1/bodyA.mass + 1/bodyB.mass);
        
        // Apply impulse
        const impulseVector = this.multiply4D(normal, impulse);
        
        bodyA.velocity = this.add4D(bodyA.velocity, this.multiply4D(impulseVector, 1/bodyA.mass));
        bodyB.velocity = this.subtract4D(bodyB.velocity, this.multiply4D(impulseVector, 1/bodyB.mass));
        
        // Update visual feedback
        const impactIntensity = Math.abs(impulse) * 0.1;
        bodyA.physicsFeedback.impactIntensity = Math.max(bodyA.physicsFeedback.impactIntensity, impactIntensity);
        bodyB.physicsFeedback.impactIntensity = Math.max(bodyB.physicsFeedback.impactIntensity, impactIntensity);
        
        console.log(`🔮 4D collision resolved between bodies ${bodyA.id} and ${bodyB.id}, impulse: ${impulse.toFixed(3)}`);
    }
    
    /**
     * Integrate motion using Verlet integration
     */
    integrate(body, deltaTime) {
        // Linear motion integration
        body.acceleration = this.multiply4D(body.forces, 1.0 / body.mass);
        
        body.velocity = this.add4D(
            body.velocity, 
            this.multiply4D(body.acceleration, deltaTime)
        );
        
        body.position = this.add4D(
            body.position,
            this.multiply4D(body.velocity, deltaTime)
        );
        
        // Rotational motion integration (simplified 6D)
        for (let i = 0; i < 6; i++) {
            body.angularAcceleration[i] = body.torques[i] / body.inertia4D[i];
            body.angularVelocity[i] += body.angularAcceleration[i] * deltaTime;
            body.rotation[i] += body.angularVelocity[i] * deltaTime;
            
            // Keep rotations in [0, 2π] range
            body.rotation[i] = body.rotation[i] % (Math.PI * 2);
        }
    }
    
    /**
     * Update visual feedback based on physics
     */
    updateVisualFeedback(body) {
        // Velocity-based intensity
        const speed = this.magnitude4D(body.velocity);
        body.physicsFeedback.velocityIntensity = Math.min(speed * 0.5, 2.0);
        
        // Acceleration-based glow
        const acceleration = this.magnitude4D(body.acceleration);
        body.physicsFeedback.accelerationGlow = Math.min(acceleration * 0.3, 1.0);
        
        // Decay impact intensity
        body.physicsFeedback.impactIntensity *= 0.95;
    }
    
    // === 4D VECTOR MATH UTILITIES ===
    
    add4D(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
    }
    
    subtract4D(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
    }
    
    multiply4D(vec, scalar) {
        return [vec[0] * scalar, vec[1] * scalar, vec[2] * scalar, vec[3] * scalar];
    }
    
    dot4D(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    }
    
    magnitude4D(vec) {
        return Math.sqrt(this.dot4D(vec, vec));
    }
    
    normalize4D(vec) {
        const mag = this.magnitude4D(vec);
        return mag > 0.001 ? this.multiply4D(vec, 1.0 / mag) : [0, 0, 0, 0];
    }
    
    distance4D(a, b) {
        return this.magnitude4D(this.subtract4D(a, b));
    }
    
    /**
     * 4D cross product (simplified - returns 4D vector)
     */
    cross4D(a, b) {
        // Simplified 4D cross product
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2], 
            a[0] * b[1] - a[1] * b[0],
            a[3] // W component
        ];
    }
    
    // === UTILITY METHODS ===
    
    addForce(body, force) {
        body.forces = this.add4D(body.forces, force);
    }
    
    clearForces(body) {
        body.forces = [0, 0, 0, 0];
        body.torques = [0, 0, 0, 0, 0, 0];
    }
    
    generateBodyId() {
        return `body_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    calculate4DInertia(polytopeType, mass) {
        // Simplified 6D inertia tensor (diagonal elements only)
        const baseMoment = mass * 0.4; // Approximate for regular polytopes
        return [baseMoment, baseMoment, baseMoment, baseMoment, baseMoment, baseMoment];
    }
    
    calculateBoundingRadius(polytopeType) {
        // Approximate bounding radii for different polytopes
        const radii = [1.2, 1.5, 1.0, 1.3, 0.8, 2.0]; // Corresponds to polytope types
        return radii[polytopeType] || 1.0;
    }
    
    checkSleeping(body) {
        const totalEnergy = this.magnitude4D(body.velocity) + this.magnitude4D(body.angularVelocity);
        
        if (totalEnergy < body.sleepThreshold) {
            body.sleeping = true;
        } else if (totalEnergy > body.sleepThreshold * 2) {
            body.sleeping = false;
        }
    }
    
    updateSpatialHash() {
        // Placeholder for spatial partitioning optimization
        // Would implement 4D spatial hash for efficient collision detection
    }
    
    // === PUBLIC API METHODS ===
    
    enable() {
        this.enabled = true;
        console.log('🔮 Polychora4DPhysics enabled');
    }
    
    disable() {
        this.enabled = false;
        console.log('🔮 Polychora4DPhysics disabled');
    }
    
    pause() {
        this.paused = true;
    }
    
    resume() {
        this.paused = false;
    }
    
    setGravity(gravity4D) {
        this.gravity4D = [...gravity4D];
    }
    
    setMagneticField(field4D) {
        this.magneticField = [...field4D];
    }
    
    setFluidFlow(flow4D) {
        this.fluidFlow = [...flow4D];
    }
    
    getAllBodies() {
        return this.bodies;
    }
    
    getBodyById(id) {
        return this.bodies.find(body => body.id === id);
    }
    
    removeBody(id) {
        this.bodies = this.bodies.filter(body => body.id !== id);
    }
    
    clearAllBodies() {
        this.bodies = [];
    }
    
    /**
     * Get physics feedback for visualization
     */
    getPhysicsFeedback() {
        return this.bodies.map(body => ({
            id: body.id,
            position: body.position,
            rotation: body.rotation,
            feedback: body.physicsFeedback,
            polytopeType: body.polytopeType
        }));
    }
}