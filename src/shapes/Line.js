import Shape from '../Shape'
import { SHAPES } from '../ToolBox'

export default class Line extends Shape {
  constructor(style, canvas) { 
    super(SHAPES.LINE, canvas) 

    this.x = 0
    this.y = 0

    this.x2 = 0
    this.y2 = 0

    this.w = 0
    this.h = 0

    this.minX = this.x
    this.minY = this.y

    this.maxX = this.x2
    this.maxX = this.y2

    this.style = style 
  }

  startDrawing(startPosition) {
    Object.assign(this.ctx, this.style)
    this.x = startPosition.x
    this.y = startPosition.y 
  }

  handleMouseMove(event) {
    const mousePosition = super.getPos(event)
    this.x2 = mousePosition.x
    this.y2 = mousePosition.y
  }

  handleMouseUp(event) {
    const mousePosition = super.getPos(event)
    this.x2 = mousePosition.x
    this.y2 = mousePosition.y
    super.cleanUpEvents()
    this.calculateBoundingBox()
  } 

  contains(mx, my) {
    return (mx >= this.minX) && (mx <= this.maxX) 
      && (my >= this.minY) && (my <= this.maxY);
  }
  
  draw() {
    if (!this.x || !this.y || !this.x2 || !this.y2) return
    Object.assign(this.ctx, this.style)
    this.ctx.setLineDash([0,0])
    this.ctx.beginPath()
    this.ctx.moveTo(this.x, this.y)
    this.ctx.lineTo(this.x2, this.y2)
    this.ctx.stroke()
    this.ctx.closePath()
    this.calculateBoundingBox()
  }

  calculateBoundingBox() {
    const strokeWidth = this.style.lineWidth / 2
    this.maxX = Math.max(this.x + strokeWidth, this.x2 + strokeWidth)
    this.minX = Math.min(this.x - strokeWidth, this.x2 - strokeWidth)

    this.maxY = Math.max(this.y + strokeWidth, this.y2 + strokeWidth)
    this.minY = Math.min(this.y - strokeWidth, this.y2 - strokeWidth)

    this.w = this.maxX - this.minX
    this.h = this.maxY - this.minY
  }

  drawBoundingBox() {
    this.ctx.strokeStyle = "red"
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([2, 4])
    this.ctx.strokeRect(this.minX, this.minY, this.w, this.h)
  }
}
