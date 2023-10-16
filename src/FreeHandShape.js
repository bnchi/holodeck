import MainEventHandler from './MainEventHandler'

export default class FreeHandShape extends MainEventHandler {
  constructor(canvas, style) {
    super(canvas)

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

    this.w = maxX - minX + 7
    this.h = maxY - minY + 7

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
