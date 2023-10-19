export const SHAPES = {
  SQUARE: 'Square',
  PATH: 'Path',
  CIRCLE: 'Circle'
}

export const CANVAS_EVENT = {
  DRAWING: 'drawing',
  SELECTION: 'selection'
}

export const TOOL_BOX = {
  SELECTION: 'selection',
  DRAW_SQUARE: 'draw_square',
  DRAW_CIRCLE: 'draw_circle',
  FREE_DRAW: 'free_draw',
  SELECT_ALL: 'select_all',
  DESELECT_ALL: 'deselect_all',
  DELETE_SELECTED: 'delete_selected',
  DELETE_ALL: 'delete_all'
}

export default class ToolBox {
  constructor(canvas) {
    this.canvas = canvas
  }

  invoke(tool) {
    switch (tool) {
      case TOOL_BOX.SELECTION:
        return this.canvas.setActiveEvent(CANVAS_EVENT.SELECTION)
      case TOOL_BOX.DRAW_CIRCLE:
        this.canvas.setShape(SHAPES.CIRCLE)
        return this.canvas.setActiveEvent(CANVAS_EVENT.DRAWING)
      case TOOL_BOX.DRAW_SQUARE:
        this.canvas.setShape(SHAPES.SQUARE)
        return this.canvas.setActiveEvent(CANVAS_EVENT.DRAWING)
      case TOOL_BOX.FREE_DRAW:
        this.canvas.setShape(SHAPES.PATH)
        return this.canvas.setActiveEvent(CANVAS_EVENT.DRAWING)
      case TOOL_BOX.SELECT_ALL:
        return this.canvas.selectAll()
      case TOOL_BOX.DESELECT_ALL:
        return this.canvas.deselectAll() 
      case TOOL_BOX.DELETE_SELECTED:
        return this.canvas.deleteSelected()
      case TOOL_BOX.DELETE_ALL:
        return this.canvas.deleteAll()
      default:
        throw new Error('Not there')
    }
  }
}
