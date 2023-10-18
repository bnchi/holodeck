import MainEventHandler from './MainEventHandler'

export default class Shape extends MainEventHandler {
  constructor(type, canvas) {
    super(canvas)
    this.type = type
  }
}
