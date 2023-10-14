import MainEventHandler from './MainEventHandler'
import FreeHandShape from './FreeHandShape'

export const TOOLS = {
  SELECTION: 'selection',
  FREE_DRAW: 'free_draw'
}

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

export default class Canvas extends MainEventHandler {
  constructor(canvas, state, selectionBox) {
    super(canvas)

    this.width = canvas.width
    this.height = canvas.height    

    this.currentTool = TOOLS.FREE_DRAW
    this.state = state
    this.selectedShape = null
    this.selectedShapes = []

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

  setCurrentTool(tool) {
    this.currentTool = tool
  }
   
  handleMouseDown(event) {
    const mousePosition = super.getPos(event)
    const commonStyles = { 
      strokeStyle: "black", 
      lineWidth: 7, 
      lineCap: 'round'
    }
    this.isDrawing = true
    switch (this.currentTool) {
      case TOOLS.FREE_DRAW:
        const shape = new FreeHandShape(this.canvas, commonStyles)
        shape.startDrawing(mousePosition)
        this.state.addShape(shape)
        break
      default:
        this.isDrawing = false
        this.isSelecting = true
        this.startSelection(mousePosition)
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
      for (const selectedShape of this.selectedShapes) {
        selectedShape.x += dx 
        selectedShape.y += dy 
      }
      this.draw()
    } else if (this.isSelecting) {
      this.draw()
      this.selectionBox.draw(mousePosition.x, mousePosition.y)
    }
  }

  handleMouseUp() {
    if (this.isSelecting) this.draw() // clear out the canvas from selection box
    this.isDrawing = false
    this.isDragging = false
    this.isSelecting = false
  }
  
  startSelection(mousePosition) {
    this.selectionBox.setPoint(mousePosition.x, mousePosition.y)
    for (const shape of this.state.getShapes()) {
      if (shape.contains(mousePosition.x, mousePosition.y)) {
        if (!this.selectedShapes.includes(shape)) this.selectedShapes.push(shape) 
        this.selectedShape = shape
        this.selectedShape.drawBoundingBox()
        this.dragOffsetX = mousePosition.x - shape.x
        this.dragOffsetY = mousePosition.y - shape.y
        this.isDragging = true
        this.isSelecting = false
      }
    }
  }
  
  draw() {
    this.clear()
    
  	for (const shape of this.state.getShapes()) {
    	shape.draw(this.ctx)

      const isShapeSelected = this.selectedShapes.includes(shape)
      if (isShapeSelected) {
        shape.drawBoundingBox()
      }

      if (this.selectionBox.isOverlapping(shape) && !isShapeSelected) {
        this.selectedShapes.push(shape)
      }
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }  
}
