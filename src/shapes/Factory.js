import Square from './Square'
import Path from './Path'
import Circle from './Circle'
import { SHAPES } from '../ToolBox'

export default class ShapeFactory {
  constructor(canvas) {
    this.canvas = canvas
  }

  createShape(type, ...args) {
    switch (type) {
      case SHAPES.SQUARE:
        return new Square(...args, this.canvas)
      case SHAPES.PATH:
        return new Path(...args, this.canvas)
      case SHAPES.CIRCLE:
        return new Circle(...args, this.canvas)
      default:
        throw new Error(`Invalid shape type: ${type}`);
    }
  }
}
