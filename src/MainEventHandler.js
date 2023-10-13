export default class MainEventHandler {
  constructor(canvas) {
    this.canvas = canvas

    this.mouseDown = this.handleMouseDown.bind(this)
    this.mouseMove = this.handleMouseMove.bind(this)
    this.mouseUp = this.handleMouseUp.bind(this)

    this.canvas.addEventListener("mousedown", this.mouseDown)
    this.canvas.addEventListener("mousemove", this.mouseMove)
    this.canvas.addEventListener("mouseup", this.mouseUp)

    this.canvasOffsetX = this.canvas.getBoundingClientRect().left + window.scrollX;
    this.canvasOffsetY = this.canvas.getBoundingClientRect().top + window.scrollY;

    document.querySelector(".editor").addEventListener('scroll', this.handleScroll.bind(this))
  }

  cleanUpEvents() {
    this.canvas.removeEventListener("mousedown", this.mouseDown)
    this.canvas.removeEventListener("mousemove", this.mouseMove)
    this.canvas.removeEventListener("mouseup", this.mouseUp)
  }

  handleMouseDown() {}
  handleMouseMove() {}
  handleMouseUp() {}

  handleScroll() {
    this.canvasOffsetX = this.canvas.getBoundingClientRect().left + window.scrollX
    this.canvasOffsetY = this.canvas.getBoundingClientRect().top + window.scrollY
  }

  getPos(event) {
  	return {
    	x: event.clientX - this.canvasOffsetX,
      y: event.clientY - this.canvasOffsetY    
    }
  }
}
