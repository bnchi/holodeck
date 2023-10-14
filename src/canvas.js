import MainEventHandler from './MainEventHandler'

export const TOOLS = {
  MOVE_SHAPE: 'move_shape',
  FREE_DRAW: 'free_draw'
}

export class Shape {
	constructor(x, y, w, h, fill) {
  	this.x = x || 0
    this.y = y || 0
    this.w = w || 0
    this.h = h || 0
    this.fill = fill || '#AAAAAA'
  }

  draw(ctx) {
  	ctx.fillStyle = this.fill
  	ctx.fillRect(this.x, this.y, this.w, this.h)
  }
  
  contains(mx, my) {
  	return (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my)
  }
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

export class SelectionBox {
  constructor(canvas) { 
    this.ctx = canvas.getContext('2d')
    this.startX = 0
    this.startY = 0
  }

  setStartX(x) {
    this.startX = x
  }

  setStartY(y) {
    this.startY = y
  } 

  draw(x, y) {
    this.width = x - this.startX
    this.height = y - this.startY

    this.ctx.beginPath()
    this.ctx.rect(this.startX, this.startY, this.width, this.height)
    this.ctx.setLineDash([2, 4])
    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 2
    this.ctx.stroke()
  }

  isOverlapping(shape) {
    return (
      this.rangeIntersect(this.startX, this.startX + this.width,shape.x, shape.x + shape.w) 
      && this.rangeIntersect(this.startY, this.startY + this.height, shape.y, shape.y + shape.h)
    );
  }

  rangeIntersect(min0, max0, min1, max1) {
    return Math.max(min0, max0) >= Math.min(min1, max1) &&
           Math.min(min0, max0) <= Math.max(min1, max1)
  }
}

export class Canvas extends MainEventHandler {
  constructor(canvas, state, selectionBox) {
    super(canvas)

    if (!state) {
      throw new Error("Must provide shapes state")
    }

    this.ctx = canvas.getContext('2d')

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

    switch (this.currentTool) {
      case TOOLS.FREE_DRAW: {
        const freehandDrawingShape = new FreeHandShape(this.canvas, { 
          strokeStyle: "black", 
          lineWidth: 7, 
          lineCap: 'round'
        })
        freehandDrawingShape.startDrawing(mousePosition)
        this.state.addShape(freehandDrawingShape)
        this.isDrawing = true
        break;
      }
      case TOOLS.MOVE_SHAPE: {
        this.isSelecting = true
        this.selectionBox.setStartX(mousePosition.x)
        this.selectionBox.setStartY(mousePosition.y)
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
        break;
      }
      default: {
        throw new Error("Not implemented")
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
    if (this.isSelecting) this.draw()
    this.isDrawing = false
    this.isDragging = false
    this.isSelecting = false
  }
  
  add(shape) {
    this.state.addShape(shape)
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

class FreeHandShape extends MainEventHandler {
  constructor(canvas, style) {
    super(canvas)

    this.ctx = canvas.getContext('2d')
    this.x = 0
    this.y = 0

    this.w = this.maxX - this.minX
    this.h = this.maxY - this.minY
    this.points = []

    this.minX = this.x
    this.minY = this.y
    this.maxX = this.x
    this.maxY = this.y
  
    this.style = style
  }

  startDrawing(startPosition) {
    Object.assign(this.ctx, this.style)

    this.x = startPosition.x
    this.y = startPosition.y 

    this.points.push({x: startPosition.x,  y: startPosition.y})

    this.ctx.beginPath()
    this.ctx.moveTo(startPosition.x, startPosition.y)
  }

  handleMouseMove(event) {
    const mousePosition = super.getPos(event)
    this.points.push({x: mousePosition.x, y: mousePosition.y})
    this.ctx.lineTo(mousePosition.x, mousePosition.y)
    this.ctx.stroke()
  }

  handleMouseUp() {
    this.ctx.closePath()
    this.calculateBoundingBox()
    super.cleanUpEvents()
  } 

  draw() {
    Object.assign(this.ctx, this.style)

 		const dx = this.x - this.points[0].x;
    const dy = this.y - this.points[0].y;

    for (let i = 0; i < this.points.length; i++) {
    	this.points[i].x += dx
      this.points[i].y += dy
    }
    
    this.ctx.beginPath()
    this.ctx.moveTo(this.points[0].x , this.points[0].y)
 
    for (let i = 1; i < this.points.length; i++) {
    	this.ctx.lineTo(this.points[i].x, this.points[i].y)
    }

    this.ctx.stroke()
    this.ctx.closePath()

    this.calculateBoundingBox()
  }

  contains(mx, my) {
    return (mx >= this.minX) && (mx <= this.maxX) 
      && (my >= this.minY) && (my <= this.maxY);
  }
   
  calculateBoundingBox() {
    let minX = this.points[0].x
    let minY = this.points[0].y
    let maxX = this.points[0].x
    let maxY = this.points[0].y

    for (let i = 1; i < this.points.length; i++) {
      const {x, y} = this.points[i]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }

    this.w = maxX - minX
    this.h = maxY - minY

    this.minX = minX
    this.maxX = maxX
    this.minY = minY
    this.maxY = maxY
  }

  drawBoundingBox() {
    this.ctx.strokeStyle = "red"
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([2, 4])
    this.ctx.strokeRect(this.minX, this.minY, this.w, this.h)
  }
}
