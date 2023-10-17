import MainEventHandler from './MainEventHandler'
import FreeHandShape from './FreeHandShape'
import { CANVAS_EVENT } from './Tools'

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
    const isGroupSelection = this.state.getSelectedShapes().length > 1
    this.selectedShape = null
    for (const shape of this.state.getShapes()) {
      if (shape.contains(mousePosition.x, mousePosition.y)) {
        if (!isGroupSelection) {
          this.state.deleteSelectedShapes()
          this.state.addSelectedShapeIfNotExist(shape)
        }

        this.isSelecting = false
        this.isDragging = true
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
