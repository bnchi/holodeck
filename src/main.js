import { PDFDrawer } from '../pdf'

import Canvas, { State, TOOLS } from './MainCanvas'
import SelectionBox from './SelectionBox'

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

  const keys = Object.keys(TOOLS)

  const fragment = new DocumentFragment()

  for (const toolKey of keys) {
    const button = document.createElement("button")
    button.textContent = toolKey
    button.addEventListener('click', () => canvas.setCurrentTool(TOOLS[toolKey])) 
    button.setAttribute(toolKey, TOOLS[toolKey])
    fragment.append(button)
  }

  tools.append(fragment)
}

main()
