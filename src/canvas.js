export class State {
  constructor() {
    this.shapes = []
  }

  addShape(shape) {
    this.shapes.push(shape)
  }

  getShapes() {
    return this.shapes
  }
}

