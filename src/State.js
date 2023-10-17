export default class State {
  constructor() {
    this.shapes = []
    this.selectedShapes = []
  }

  addShape(shape) {
    this.shapes.push(shape)
  }

  getShapes() {
    return this.shapes
  }

  getShapeAt(i) {
    return this.shapes[i]
  }

  deleteShapeAt(i) {
    this.shapes.splice(i, 1)
  }

  deleteShapes() {
    this.shapes = []
    this.selectedShapes = []
  }

  addSelectedShapeIfNotExist(shape) {
    if (!this.isShapeSelected(shape)) {
      this.selectedShapes.push(shape) 
    }
  }

  getSelectedShapes() {
    return this.selectedShapes 
  }

  isShapeSelected(shape) {
    return this.selectedShapes.includes(shape)
  }

  deleteSelectedShapes() {
    this.selectedShapes = []
  }
}

