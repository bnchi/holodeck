import MainEventHandler from './MainEventHandler'
import ShapeFactory from './shapes/Factory'
import { CANVAS_EVENT } from './ToolBox'

export default class Canvas extends MainEventHandler {
  constructor(canvas, state, selectionBox) {
    super(canvas)

    this.activeEvent = CANVAS_EVENT.SELECTION
    this.width = canvas.width
    this.height = canvas.height    

    this.state = state
    this.selectedShape = null

    this.selectionBox = selectionBox

    this.isDragging = false
    this.isDrawing = false
    this.isSelecting = false

    this.shape = null

    this.dragOffsetX = 0
    this.dragOffsetY = 0    
  }

  setNewState(state) {
    this.state = state
    this.draw()
  }

  setShape(shape) {
    this.shape = shape
  }
   
  setActiveEvent(event) {
    this.activeEvent = event 
  }

  handleMouseDown(event) {
    const mousePosition = super.getPos(event)
    switch (this.activeEvent) {
      case CANVAS_EVENT.DRAWING:
        if (!this.shape) throw new Error('Please provide a shape to draw')
        this.isDrawing = true
        this.isSelecting = false
        const shape = new ShapeFactory(this.canvas).createShape(this.shape, this.getStyles())
        shape.startDrawing(mousePosition)
        this.state.addShape(shape)
        break
      case CANVAS_EVENT.SELECTION:
        this.isSelecting = true
        this.isDrawing = false
        this.selectionBox.setPoint(mousePosition.x, mousePosition.y)
        this.pathIntersectsMouse(mousePosition)
        break
      default:
        throw new Error('not implemented')
    }
  }

  pathIntersectsMouse(mousePosition) {
    const isGroupSelection = this.state.getSelectedShapes().length > 1
    this.selectedShape = null
    for (const shape of this.state.getShapes()) {
      if (shape.contains(mousePosition.x, mousePosition.y)) {
        if (!isGroupSelection) {
          this.state.deleteSelectedShapes()
          this.state.addSelectedShapeIfNotExist(shape)
        }
        this.isDragging = true
        this.isSelecting = false
        this.isDrawing = false
        this.selectedShape = shape
        this.dragOffsetX = mousePosition.x - shape.x
        this.dragOffsetY = mousePosition.y - shape.y
        this.draw()
      }     
    }

    if (!this.selectedShape) {
      this.state.deleteSelectedShapes()
    }
  }

  handleMouseMove(event) {
    const mousePosition = super.getPos(event)
    if (this.isDrawing) {
      this.draw()
    } else  if (this.isDragging) {
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
      this.state.deleteSelectedShapes()
      this.selectionBox.draw(mousePosition.x, mousePosition.y)
      for (const shape of this.state.getShapes()) {
        if (this.selectionBox.isOverlapping(shape)) {
          this.state.addSelectedShapeIfNotExist(shape)
        }
      }
    }
  }

  handleMouseUp() {
    if (this.isSelecting || this.isDrawing) this.draw()
    this.isDrawing = false
    this.isDragging = false
    this.isSelecting = false
  }

  getStyles() {
    return {
      strokeStyle: "black",
      lineCap: "round",
      lineWidth: 39
    }
  }

  selectAll() {
    this.state.deleteSelectedShapes()

    for (const shape of this.state.getShapes()) {
      this.state.addSelectedShapeIfNotExist(shape)
    }

    this.draw()
  }

  deselectAll() {
    this.state.deleteSelectedShapes()
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

    this.state.deleteSelectedShapes()
    this.draw()
  }

  deleteAll() {
    this.state.deleteShapes()
    this.draw()
  }

  draw() {
    this.clear()
    
  	for (const shape of this.state.getShapes()) {
    	shape.draw()

      if (this.state.isShapeSelected(shape)) {
        shape.drawBoundingBox()
      }
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }  
}
