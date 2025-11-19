import { Vector3 } from '../math/Vector3';

export class Body {
  public position: Vector3;
  public velocity: Vector3;
  public force: Vector3;
  public mass: number;
  public radius: number;
  public id: number;
  public color: number;
  public isBlackHole: boolean = false;
  public name: string; // New: Proper Name

  private static nextId = 0;

  constructor(x: number, y: number, z: number, mass: number, radius: number = 1, color: number = 0xffffff, name?: string) {
    this.position = new Vector3(x, y, z);
    this.velocity = new Vector3(0, 0, 0);
    this.force = new Vector3(0, 0, 0);
    this.mass = mass;
    this.radius = radius;
    this.color = color;
    this.id = Body.nextId++;
    this.name = name || `Star-${this.id}`;
  }

  resetForce() {
    this.force.set(0, 0, 0);
  }
}
