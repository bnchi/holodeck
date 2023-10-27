const ACTIONS = {
  NEW_SHAPE: 'new_shape',
  DELETE_ALL: 'delete_all'
}

export default class State {
  constructor() {
    this.shapes = []
    this.actions = []
    this.history = []
  }

  undo() {
    if (this.isActionsEmpty()) return
    const lastState = this.actions.pop()
    switch (lastState.type) {
      case ACTIONS.NEW_SHAPE:
        this.history.push(lastState)
        this.shapes.pop()
        break;
      case ACTIONS.DELETE_ALL:
        this.history.push(lastState)
        for (const shape of lastState.shapes) {
          this.shapes.push(shape)
        }
        break;
      default:
        throw new Error("not a state")
    }
  }

  redo() {
    if (this.isHistoryEmpty()) return
    const lastState = this.history.pop()
    switch (lastState.type) {
      case ACTIONS.NEW_SHAPE:
        this.addShape(lastState.shapes[0])
        break
      case ACTIONS.DELETE_ALL:
        this.deleteShapes()
        break
      default:
        console.log("not implemented")
    }
  }

  addShape(shape) {
    this.shapes.push(shape)
    this.actions.push({ type: ACTIONS.NEW_SHAPE, shapes: [shape] })
  }

  getShapes() {
    return this.shapes
  }

  getShapeAt(i) {
    return this.shapes[i]
  }

  deleteShapes() {
    this.actions.push({ type: ACTIONS.DELETE_ALL, shapes: [...this.shapes] })
    this.shapes = []
  }

  select(shape) {
    shape.isSelected = true
  }

  getSelected() {
    return this.shapes.filter((shape) => shape.isSelected)
  }

  selectAll() {
    this.shapes.map((shape) => shape.isSelected = true)
  }

  removeSelections() {
    this.shapes.map((shape) => shape.isSelected = false)
  }

  deleteSelected() {
    this.shapes = this.shapes.filter(shape => !shape.isSelected)
  }

  isShapesEmpty() {
    return this.shapes.length == 0
  }

  isActionsEmpty() {
    return this.actions.length == 0
  }

  isHistoryEmpty() {
    return this.history.length == 0
  }
}
