import Canvas from './MainCanvas'
import State from './State'
import SelectionBox from './SelectionBox'
import ToolBox, { TOOL_BOX } from './ToolBox'
import Store from './Store'
import { PDFDrawer } from '../pdf'
import ShapeFactory from './shapes/Factory'

// (TODO) THIS REQUIRE REFACTOR
async function main() {
  const pdfCanvas = document.getElementById('pdfCanvas')
  const drawingCanvas = document.getElementById('drawingCanvas')
  const pdfPagesElem = document.querySelector(".pdf-layers")
  const tools = document.getElementById("tool-box")

  // PDF STUFF STARTS
  const pdfObj = new PDFDrawer(pdfCanvas, pdfPagesElem)
  await pdfObj.createPDF("http://localhost:3000/test.pdf")

  await pdfObj.loadMainPage(1)
  await pdfObj.loadPagesPreview()

  // CANVAS STUFF STARTS
  const pagesState = [ // this should be built from the total number of pages from pdf objects
    new State(),
    new State(),
    new State()
  ]

  const canvas = new Canvas(
    drawingCanvas, 
    pagesState[0], 
    new SelectionBox(drawingCanvas),
    new ShapeFactory(drawingCanvas)
  )

  const toolInvoker = new ToolBox(canvas)
  // CANVAS STUFF ENDS

  // the UI start
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
  // The UI end
  
  // getting the projects ..
  const store = new Store()
  const projectsCursor = await store.getProjects()
  projectsCursor.onerror = (event) => console.error(event.target.error)
  projectsCursor.onsuccess = (event) => {
    const cursor = event.target.result
    if (cursor) {
      console.log(cursor.value)
      cursor.continue()
    } 
  }
  // GETTINGS THE PROJECTS END
}

main()
