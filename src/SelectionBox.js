export default class SelectionBox {
  constructor(canvas) { 
    this.ctx = canvas.getContext('2d')
    this.startX = 0
    this.startY = 0
  }

  setPoint(x, y) {
    this.startX = x
    this.startY = y
  }

  draw(x, y) {
    this.width = x - this.startX
    this.height = y - this.startY

    this.ctx.setLineDash([2, 4])
    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(this.startX, this.startY, this.width, this.height)
  }

  isOverlapping(shape) {
    return (
      this.rangeIntersect(this.startX, this.startX + this.width, shape.minX, shape.maxX) 
      && this.rangeIntersect(this.startY, this.startY + this.height, shape.minY, shape.maxY)
    );
  }

  rangeIntersect(min0, max0, min1, max1) {
    return Math.max(min0, max0) >= Math.min(min1, max1) &&
           Math.min(min0, max0) <= Math.max(min1, max1)
  }
}
