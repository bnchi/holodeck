import Shape from '../Shape'
import { SHAPES } from '../ToolBox'

export default class Ellipse extends Shape {
  constructor(style, canvas) { 
    super(SHAPES.CIRCLE, canvas) 
    this.x = 0
    this.y = 0

    this.w = 0
    this.h = 0

    this.minX = this.x
    this.minY = this.y 

    this.maxX = 0
    this.maxX = 0

    this.style = style 
  }

  startDrawing(startPosition) {
    Object.assign(this.ctx, this.style)
    this.x = startPosition.x
    this.y = startPosition.y
  }

  handleMouseMove(event) {
    const mousePosition = super.getPos(event)
    this.w = mousePosition.x - this.x
    this.h = mousePosition.y - this.y
  }

  handleMouseUp() {
    super.cleanUpEvents()
    this.calculateBoundingBox()
  } 

  move(dx, dy) {
    this.x += dx
    this.y += dy
  }

  contains(mx, my) {
    return (mx >= this.minX) && (mx <= this.maxX) 
      && (my >= this.minY) && (my <= this.maxY);
  }
  
  draw() {
    Object.assign(this.ctx, this.style)
    this.ctx.setLineDash([0,0]) 
    this.ctx.beginPath()
    this.ctx.ellipse(this.x, this.y, this.w, this.h, 0, 0, Math.PI * 2)
    this.ctx.stroke()
    this.ctx.closePath()
    this.calculateBoundingBox()
  }

  calculateBoundingBox() {
    this.minX = this.x - this.w
    this.minY = this.y - this.h

    this.maxX = this.w + this.x
    this.maxY = this.h + this.y
  }

  drawBoundingBox() {
    this.ctx.strokeStyle = "red"
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([2, 4])
    this.ctx.strokeRect(this.minX, this.minY, this.w * 2, this.h * 2)
  }
}
