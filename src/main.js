import { PDFDrawer } from '../pdf'
import Canvas from './MainCanvas'
import State from './State'
import SelectionBox from './SelectionBox'
import ToolBox, { TOOL_BOX } from './ToolBox'

async function main() {
  const pdfCanvas = document.getElementById('pdfCanvas')
  const drawingCanvas = document.getElementById('drawingCanvas')
  const pdfPagesElem = document.querySelector(".pdf-layers")
  const tools = document.getElementById("tool-box")

  const pdfObj = new PDFDrawer(pdfCanvas, pdfPagesElem)
  await pdfObj.createPDF("http://localhost:3000/test.pdf")

  await pdfObj.loadMainPage(1)
  await pdfObj.loadPagesPreview()

  const pagesState = [
    new State(),
    new State(),
    new State()
  ]

  const canvas = new Canvas(drawingCanvas, pagesState[0], new SelectionBox(drawingCanvas))
  const toolInvoker = new ToolBox(canvas)

  for (const child of pdfPagesElem.childNodes) {
    child.addEventListener('click', async (event) => {
      const pageId = parseInt(event.target.id.split("-")[2])
      await pdfObj.loadMainPage(pageId)
      canvas.setNewState(pagesState[pageId - 1])
    })
  }

  document.getElementById("save-pdf").addEventListener('click', () => {
    // take all of states and draw them into the pdf
    pdfObj.saveToDevice(pagesState)
  })

  const fragment = new DocumentFragment()
  for (const toolKey of Object.keys(TOOL_BOX)) {
    const button = document.createElement("button")
    button.textContent = toolKey
    button.addEventListener('click', () => toolInvoker.invoke(TOOL_BOX[toolKey])) 
    button.setAttribute(toolKey, TOOL_BOX[toolKey])
    fragment.append(button)
  }
  tools.append(fragment)
}

main()
