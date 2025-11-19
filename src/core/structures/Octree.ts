import { Vector3 } from '../math/Vector3';
import { Body } from '../physics/Body';

export class Boundary {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public size: number // Length of one side of the cube
  ) {}

  contains(p: Vector3): boolean {
    const half = this.size / 2;
    return (
      p.x >= this.x - half &&
      p.x < this.x + half &&
      p.y >= this.y - half &&
      p.y < this.y + half &&
      p.z >= this.z - half &&
      p.z < this.z + half
    );
  }
}

export class OctreeNode {
  public boundary: Boundary;
  public centerOfMass: Vector3;
  public totalMass: number;
  public body: Body | null = null; // Leaf node holds a body
  public children: OctreeNode[] = []; // Internal nodes have 8 children
  public isLeaf: boolean = true;

  constructor(boundary: Boundary) {
    this.boundary = boundary;
    this.centerOfMass = new Vector3(0, 0, 0);
    this.totalMass = 0;
  }

  // Insert a body into the tree
  insert(newBody: Body): boolean {
    if (!this.boundary.contains(newBody.position)) {
      return false;
    }

    if (this.totalMass === 0) {
        // Empty node
        this.body = newBody;
        this.totalMass = newBody.mass;
        this.centerOfMass = newBody.position.clone();
        return true;
    }

    // Node is not empty. 
    // If it's a leaf (and currently holds a body), we must subdivide
    if (this.isLeaf && this.body) {
        // We have an existing body 'A', and we are adding 'B'.
        // We must subdivide and re-insert 'A' into children, then insert 'B'.
        this.subdivide();
        const existingBody = this.body;
        this.body = null; // No longer a leaf holding a single body
        this.isLeaf = false;
        
        // Re-insert the old body into children
        for (const child of this.children) {
            if (child.insert(existingBody)) break;
        }
    }

    // If not a leaf (already subdivided), or just became one:
    // Update mass distribution before recursing (optional, but cleaner to do at end or during)
    // Here we push the new body down.
    
    // Try to insert newBody into children
    if (!this.isLeaf) {
        for (const child of this.children) {
            if (child.insert(newBody)) {
                // Success. Update mass prop of this node?
                // Actually, mass props are easier to update bottom-up or incrementally.
                // Let's update incrementally here.
                return true;
            }
        }
    }
    
    return false; // Should not happen if boundary contains point
  }

  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const z = this.boundary.z;
    const newSize = this.boundary.size / 2;
    const offset = newSize / 2;

    // Create 8 children
    // 0: -x, -y, -z
    // 1: +x, -y, -z
    // ...
    const offsets = [
        [-1, -1, -1], [1, -1, -1],
        [-1, 1, -1],  [1, 1, -1],
        [-1, -1, 1],  [1, -1, 1],
        [-1, 1, 1],   [1, 1, 1]
    ];

    for (let i = 0; i < 8; i++) {
        this.children.push(new OctreeNode(new Boundary(
            x + offsets[i][0] * offset,
            y + offsets[i][1] * offset,
            z + offsets[i][2] * offset,
            newSize
        )));
    }
  }

  // Update center of mass and total mass based on children (Call this after building tree)
  computeMassDistribution() {
    if (this.isLeaf) {
        if (this.body) {
            this.centerOfMass = this.body.position.clone();
            this.totalMass = this.body.mass;
        }
    } else {
        let m = 0;
        let cx = 0, cy = 0, cz = 0;
        for (const child of this.children) {
            child.computeMassDistribution();
            if (child.totalMass > 0) {
                m += child.totalMass;
                cx += child.centerOfMass.x * child.totalMass;
                cy += child.centerOfMass.y * child.totalMass;
                cz += child.centerOfMass.z * child.totalMass;
            }
        }
        this.totalMass = m;
        if (m > 0) {
            this.centerOfMass.set(cx / m, cy / m, cz / m);
        }
    }
  }

  calculateForce(body: Body, G: number, theta: number) {
    if (this.totalMass === 0) return;

    const dx = this.centerOfMass.x - body.position.x;
    const dy = this.centerOfMass.y - body.position.y;
    const dz = this.centerOfMass.z - body.position.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    const dist = Math.sqrt(distSq);

    // Self-interaction check (leaf node that holds the body itself)
    if (distSq < 0.0001) return; 

    // Barnes-Hut condition: size / distance < theta
    if (this.isLeaf || (this.boundary.size / dist < theta)) {
        // Treat as single body
        // F = G * m1 * m2 / r^2
        // F_vec = F * (dir_vec) = (G * m1 * m2 / r^2) * (delta / r) = G * m1 * m2 * delta / r^3
        
        // Softening parameter to prevent infinity
        const epsilon = 1; // Softening
        const distCubed = Math.pow(distSq + epsilon * epsilon, 1.5);
        
        const f = (G * this.totalMass * body.mass) / distCubed;
        
        body.force.x += f * dx;
        body.force.y += f * dy;
        body.force.z += f * dz;
    } else {
        // Too close, recurse into children
        for (const child of this.children) {
            child.calculateForce(body, G, theta);
        }
    }
  }
}
