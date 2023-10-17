export const CANVAS_EVENT = {
  DRAWING: 'drawing',
  SELECTION: 'selection'
}

export const TOOLS = {
  SELECTION: 'selection',
  FREE_DRAW: 'free_draw',
  SELECT_ALL: 'select_all',
  DESELECT_ALL: 'deselect_all',
  DELETE_SELECTED: 'delete_selected',
  DELETE_ALL: 'delete_all'
}


export default class ToolInvoker {
  constructor(canvas) {
    this.canvas = canvas
  }

  invoke(tool) {
    switch (tool) {
      case TOOLS.SELECTION:
        return this.canvas.setActiveTool(CANVAS_EVENT.SELECTION)
      case TOOLS.FREE_DRAW:
        return this.canvas.setActiveTool(CANVAS_EVENT.DRAWING)
      case TOOLS.SELECT_ALL:
        return this.canvas.selectAll()
      case TOOLS.DESELECT_ALL:
        return this.canvas.deselectAll() 
      case TOOLS.DELETE_SELECTED:
        return this.canvas.deleteSelected()
      case TOOLS.DELETE_ALL:
        return this.canvas.deleteAll()
      default:
        throw new Error('Not there')
    }
  }
}
