// Require refactroing maybe lets move to typescript ??

const TOOLS = {
  MOVE_SHAPE: 'move_shape',
  FREE_DRAW: 'free_draw'
}

let canvasOffsetX
let canvasOffsetY

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

export class Canvas {
  constructor(canvas, state) {
    if (!state) {
      throw new Error("Must provide shapes state")
    }

  	this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    this.width = canvas.width
    this.height = canvas.height
    
    this.shouldRedraw = false
    this.currentTool = TOOLS.FREE_DRAW

    this.state = state
    this.selectedShape = null

    this.dragOffsetX = 0
    this.dragOffsetY = 0
    this.isDragging = false

    canvasOffsetX = this.canvas.getBoundingClientRect().left + window.scrollX;
    canvasOffsetY = this.canvas.getBoundingClientRect().top + window.scrollY;

    setInterval(this.draw.bind(this), 20)
    this.registerEvents()
  }

  setNewState(state) {
    if (!state) {
      throw new Error("Must provide shapes")
    }

    this.state = state
    this.shouldRedraw = true
  }

  registerEvents() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this))
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this))
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this))
    document.querySelector(".editor").addEventListener('scroll', () => {
      canvasOffsetX = this.canvas.getBoundingClientRect().left
      canvasOffsetY = this.canvas.getBoundingClientRect().top
    })
  }
   
  handleMouseDown(event) {
    const mousePosition = this.getPos(event)
    switch (this.currentTool) {
      case TOOLS.FREE_DRAW: {
        const freehandDrawingShape = new FreeHandShape({ 
          strokeStyle: "black", 
          lineWidth: 7, 
          lineCap: 'round'
        })
        freehandDrawingShape.startDrawing(this.canvas, mousePosition)
        this.state.addShape(freehandDrawingShape)
        break;
      }
      case TOOLS.MOVE_SHAPE: {
        for (const shape of this.state.getShapes()) {
          if (shape.contains(mousePosition.x, mousePosition.y)) {
            this.selectedShape = shape 
            this.dragOffsetX = mousePosition.x - shape.x
            this.dragOffsetY = mousePosition.y - shape.y 
            this.isDragging = true
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
    if (!this.isDragging) return

    const mousePosition = this.getPos(event)
    const mx = mousePosition.x
    const my = mousePosition.y
    
    this.selectedShape.x = mx - this.dragOffsetX
    this.selectedShape.y = my - this.dragOffsetY
    this.shouldRedraw = true
  }

  handleMouseUp() {
    this.isDragging = false
    this.isDrawing = false
  }
  
  add(shape) {
    this.state.addShape(shape)
    this.shouldRedraw = true
  }
  
  draw() {
    if (!this.shouldRedraw) {
      return
    }

    this.clear()

  	for (const shape of this.state.getShapes()) {
    	shape.draw(this.ctx)
    }

    this.shouldRedraw = false
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  
  getPos(event) {
  	return {
    	x: event.clientX - canvasOffsetX,
      y: event.clientY - canvasOffsetY    
    }
  }
}

class FreeHandShape {
  constructor(style) {
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

  startDrawing(canvas, startPosition) {
    const ctx = canvas.getContext('2d')

    Object.assign(ctx, this.style)

    this.x = startPosition.x
    this.y = startPosition.y 
    this.points.push({x: startPosition.x,  y: startPosition.y})

    ctx.beginPath()
    ctx.moveTo(startPosition.x, startPosition.y)

    const originalMouseMove = canvas.onmousemove
    const originalMouseUp = canvas.onmouseup
    canvas.onmousemove = (event) => {
    	const mousePosition = {
        x: event.clientX - canvasOffsetX,
        y: event.clientY - canvasOffsetY
      }

      this.points.push({x: mousePosition.x, y: mousePosition.y})

      ctx.lineTo(mousePosition.x, mousePosition.y)
      ctx.stroke()
      this.calculateBoundingBox()
    }

    canvas.onmouseup = () => {
    	// draw the bounding box
      ctx.strokeStyle = "red"
      ctx.lineWidth = 2
      ctx.setLineDash([2, 4])
      ctx.strokeRect(this.minX, this.minY, this.w, this.h)      

      canvas.onmousemove = originalMouseMove
      canvas.onmouseup = originalMouseUp
    }
  }

  draw(ctx) {
    Object.assign(ctx, this.style)

 		const dx = this.x - this.points[0].x;
    const dy = this.y - this.points[0].y;

    for (let i = 0; i < this.points.length; i++) {
    	this.points[i].x += dx
      this.points[i].y += dy
    }
    
    ctx.beginPath()
    ctx.moveTo(this.points[0].x , this.points[0].y)
 
    for (let i = 1; i < this.points.length; i++) {
    	ctx.lineTo(this.points[i].x, this.points[i].y)
    }

    ctx.stroke()
    ctx.closePath()

    this.calculateBoundingBox()
    ctx.strokeStyle = "red"
    ctx.lineWidth = 2
    ctx.setLineDash([2, 4])
    ctx.strokeRect(this.minX, this.minY, this.w, this.h)
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
}
