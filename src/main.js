import {PDFDrawer} from '../pdf'
import { Canvas, State } from './canvas'

async function main() {
  const pdfCanvas = document.getElementById('pdfCanvas')
  const drawingCanvas = document.getElementById('drawingCanvas')
  const pdfPagesElem = document.querySelector(".pdf-layers")

  const pdfObj = new PDFDrawer(pdfCanvas, pdfPagesElem)
  await pdfObj.createPDF("http://localhost:3000/test.pdf")

  await pdfObj.loadMainPage(1)
  await pdfObj.loadPagesPreview()

  const pagesState = [
    new State(),
    new State(),
    new State()
  ]

  const canvas = new Canvas(drawingCanvas, pagesState[0])

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
}

main()
