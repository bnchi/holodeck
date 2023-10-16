import MainEventHandler from './MainEventHandler'
import FreeHandShape from './FreeHandShape'
import { CANVAS_EVENT } from './Tools'

export class State {
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

  emptySelectedShapes() {
    this.selectedShapes = []
  }
}

export default class Canvas extends MainEventHandler {
  constructor(canvas, state, selectionBox) {
    super(canvas)

    this.activeTool = CANVAS_EVENT.SELECTION
    this.width = canvas.width
    this.height = canvas.height    

    this.state = state
    this.selectedShape = null

    this.selectionBox = selectionBox

    this.isDragging = false
    this.isDrawing = false
    this.isSelecting = false

    this.dragOffsetX = 0
    this.dragOffsetY = 0
    
  }

  setNewState(state) {
    this.state = state
    this.draw()
  }

  setActiveTool(tool) {
    this.activeTool = tool
  }
   
  handleMouseDown(event) {
    const mousePosition = super.getPos(event)
    switch (this.activeTool) {
      case CANVAS_EVENT.DRAWING:
        this.isDrawing = true
        const shape = new FreeHandShape(this.canvas, this.getStyles())
        shape.startDrawing(mousePosition)
        this.state.addShape(shape)
        break
      case CANVAS_EVENT.SELECTION:
        this.isSelecting = true
        this.isDrawing = false
        this.isDragging = false
        this.selectionBox.setPoint(mousePosition.x, mousePosition.y)
        this.startSelection(mousePosition)
        break
      default:
        throw new Error('not implemented')
    }
  }

  startSelection(mousePosition) {
    for (const shape of this.state.getShapes()) {
      if (shape.contains(mousePosition.x, mousePosition.y)) {
        this.isSelecting = false
        this.isDragging = true
        this.isDrawing = false

        this.state.addSelectedShapeIfNotExist(shape)

        this.selectedShape = shape
        this.dragOffsetX = mousePosition.x - shape.x
        this.dragOffsetY = mousePosition.y - shape.y

        this.draw()
      } 
    }
  }

  handleMouseMove(event) {
    if (this.isDrawing) return

    const mousePosition = super.getPos(event)
    if (this.isDragging) {
      const mx = mousePosition.x - this.dragOffsetX
      const my = mousePosition.y - this.dragOffsetY
      const dx = mx - this.selectedShape.x
      const dy = my - this.selectedShape.y
      for (const selectedShape of this.state.getSelectedShapes()) {
        selectedShape.x += dx 
        selectedShape.y += dy 
      }
      this.draw()
    } else if (this.isSelecting) {
      this.draw()
      this.selectionBox.draw(mousePosition.x, mousePosition.y)
      for (const shape of this.state.getShapes()) {
        if (this.selectionBox.isOverlapping(shape)) {
          this.state.addSelectedShapeIfNotExist(shape)
        }
      }
    }
  }

  handleMouseUp() {
    if (this.isSelecting) this.draw() // clear out the canvas from selection box
    this.isDrawing = false
    this.isDragging = false
    this.isSelecting = false
  }

  getStyles() {
    return {
      strokeStyle: "black", 
      lineWidth: 7, 
      lineCap: 'round'
    }
  }

  selectAll() {
    this.state.emptySelectedShapes()

    for (const shape of this.state.getShapes()) {
      this.state.addSelectedShapeIfNotExist(shape)
    }

    this.draw()
  }

  deselectAll() {
    this.state.emptySelectedShapes()
    this.draw()
  }

  deleteSelected() {
    const selectedShapes = this.state.getSelectedShapes()

    for (let i = 0; i < selectedShapes.length; i++) {
      for (let j = 0; j < this.state.getShapes().length; j++) {
        const shape = this.state.getShapeAt(j)
        if (this.state.selectedShapes[i] == shape) {
          this.state.deleteShapeAt(j)
          continue
        }
      }
    }

    this.state.emptySelectedShapes()
    this.draw()
  }

  draw() {
    this.clear()
    
  	for (const shape of this.state.getShapes()) {
    	shape.draw(this.ctx)

      if (this.state.isShapeSelected(shape)) {
        shape.drawBoundingBox()
      }
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }  
}
