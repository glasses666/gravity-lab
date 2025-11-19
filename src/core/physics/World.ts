import { Body } from './Body';
import { OctreeNode, Boundary } from '../structures/Octree';

// Structure to report collision details to the main thread/audio engine
export interface CollisionEvent {
    mass: number;      // Mass of the new merged body
    velocity: number;  // Relative impact velocity
    x: number;
    y: number;
    z: number;
}

export class World {
  public bodies: Body[] = [];
  public G: number = 1.0;
  public theta: number = 0.5;
  public useBarnesHut: boolean = true;
  public timeStep: number = 0.1;
  
  public calculationTime: number = 0;
  
  // Store events for the current frame
  public recentCollisions: CollisionEvent[] = [];

  constructor() {}

  addBody(body: Body) {
    this.bodies.push(body);
  }

  clear() {
    this.bodies = [];
    this.recentCollisions = [];
  }

  step() {
    const start = performance.now();
    
    // Reset events
    this.recentCollisions = [];

    // 0. Collision Detection & Merging
    this.handleCollisions();

    // 1. Determine Boundaries
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    if (this.bodies.length > 0) {
        for (const b of this.bodies) {
            if (b.position.x < minX) minX = b.position.x;
            if (b.position.x > maxX) maxX = b.position.x;
            if (b.position.y < minY) minY = b.position.y;
            if (b.position.y > maxY) maxY = b.position.y;
            if (b.position.z < minZ) minZ = b.position.z;
            if (b.position.z > maxZ) maxZ = b.position.z;
        }
    } else {
        minX = -100; maxX = 100; minY = -100; maxY = 100; minZ = -100; maxZ = 100;
    }

    const padding = 100;
    const sizeX = (maxX - minX) + padding * 2;
    const sizeY = (maxY - minY) + padding * 2;
    const sizeZ = (maxZ - minZ) + padding * 2;
    const maxDim = Math.max(sizeX, sizeY, sizeZ);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    // 2. Build Octree
    const root = new OctreeNode(new Boundary(centerX, centerY, centerZ, maxDim));
    for (const b of this.bodies) {
        root.insert(b);
    }
    root.computeMassDistribution();

    // 3. Calculate Forces
    for (const b of this.bodies) {
        b.resetForce();
        if (this.useBarnesHut) {
            root.calculateForce(b, this.G, this.theta);
        } else {
            this.calculateBruteForce(b);
        }
    }

    // 4. Integrate
    const dt = this.timeStep;
    for (const b of this.bodies) {
        const ax = b.force.x / b.mass;
        const ay = b.force.y / b.mass;
        const az = b.force.z / b.mass;

        b.velocity.x += ax * dt;
        b.velocity.y += ay * dt;
        b.velocity.z += az * dt;

        b.position.x += b.velocity.x * dt;
        b.position.y += b.velocity.y * dt;
        b.position.z += b.velocity.z * dt;
    }

    this.calculationTime = performance.now() - start;
  }

  calculateBruteForce(body: Body) {
      for (const other of this.bodies) {
          if (body === other) continue;
          
          const dx = other.position.x - body.position.x;
          const dy = other.position.y - body.position.y;
          const dz = other.position.z - body.position.z;
          const distSq = dx*dx + dy*dy + dz*dz;
          
          if (distSq < 0.0001) continue;

          const epsilon = 1; 
          const distCubed = Math.pow(distSq + epsilon * epsilon, 1.5);
          const f = (this.G * body.mass * other.mass) / distCubed;

          body.force.x += f * dx;
          body.force.y += f * dy;
          body.force.z += f * dz;
      }
  }

  handleCollisions() {
      const toRemove = new Set<Body>();
      const newBodies: Body[] = [];

      for (let i = 0; i < this.bodies.length; i++) {
          const b1 = this.bodies[i];
          if (toRemove.has(b1)) continue;

          for (let j = i + 1; j < this.bodies.length; j++) {
              const b2 = this.bodies[j];
              if (toRemove.has(b2)) continue;

              const dx = b1.position.x - b2.position.x;
              const dy = b1.position.y - b2.position.y;
              const dz = b1.position.z - b2.position.z;
              const distSq = dx*dx + dy*dy + dz*dz;
              
              // Radius check
              const minDist = (b1.radius + b2.radius) * 0.8; 

              if (distSq < minDist * minDist) {
                  // Collision!
                  toRemove.add(b1);
                  toRemove.add(b2);

                  const totalMass = b1.mass + b2.mass;
                  
                  // Calculate impact intensity (relative velocity magnitude)
                  const vdx = b1.velocity.x - b2.velocity.x;
                  const vdy = b1.velocity.y - b2.velocity.y;
                  const vdz = b1.velocity.z - b2.velocity.z;
                  const impactSpeed = Math.sqrt(vdx*vdx + vdy*vdy + vdz*vdz);

                  // Record event
                  this.recentCollisions.push({
                      mass: totalMass,
                      velocity: impactSpeed,
                      x: (b1.position.x + b2.position.x)/2,
                      y: (b1.position.y + b2.position.y)/2,
                      z: (b1.position.z + b2.position.z)/2
                  });

                  // New Position (Center of Mass)
                  const newX = (b1.position.x * b1.mass + b2.position.x * b2.mass) / totalMass;
                  const newY = (b1.position.y * b1.mass + b2.position.y * b2.mass) / totalMass;
                  const newZ = (b1.position.z * b1.mass + b2.position.z * b2.mass) / totalMass;

                  // New Velocity (Momentum Conservation)
                  const newVX = (b1.velocity.x * b1.mass + b2.velocity.x * b2.mass) / totalMass;
                  const newVY = (b1.velocity.y * b1.mass + b2.velocity.y * b2.mass) / totalMass;
                  const newVZ = (b1.velocity.z * b1.mass + b2.velocity.z * b2.mass) / totalMass;

                  // New Radius (Volume conservation)
                  const r1 = b1.radius;
                  const r2 = b2.radius;
                  const newRadius = Math.pow(Math.pow(r1, 3) + Math.pow(r2, 3), 1/3);

                  // Determine color (Blend or take larger)
                  // Taking the larger mass's color usually looks more stable
                  const newColor = b1.mass > b2.mass ? b1.color : b2.color;

                  const mergedBody = new Body(newX, newY, newZ, totalMass, newRadius, newColor);
                  mergedBody.velocity.set(newVX, newVY, newVZ);
                  
                  // It is NOT a black hole anymore. Just a bigger star/planet.
                  mergedBody.isBlackHole = false; 

                  newBodies.push(mergedBody);
              }
          }
      }

      if (toRemove.size > 0) {
          this.bodies = this.bodies.filter(b => !toRemove.has(b));
          this.bodies.push(...newBodies);
      }
  }
}
