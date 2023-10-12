import {PDFDrawer} from '../pdf'
import { State } from './canvas'

async function main() {
  const pdfCanvas = document.getElementById('pdfCanvas')
  const drawingCanvas = document.getElementById('drawingCanvas')
  const pdfPagesElem = document.querySelector(".pdf-layers")

  const pdfObj = new PDFDrawer(pdfCanvas, pdfPagesElem)
  await pdfObj.createPDF("http://localhost:3000/test.pdf")

  await pdfObj.loadMainPage(1)
  await pdfObj.loadPagesPreview()

  const currentState = new State(drawingCanvas)

  for (const child of pdfPagesElem.childNodes) {
    child.addEventListener('click', (event) => {
      loadToCanvas(event, pdfObj)
    })
  }

  document.getElementById("save-pdf").addEventListener('click', () => {
    const points = currentState.getAllShapesPoints()
    pdfObj.saveToDevice(points[0].points)
  })
}

async function loadToCanvas(event, pdfObj) {
  const pageId = event.target.id.split("-")[2]
  await pdfObj.loadMainPage(parseInt(pageId))
}

main()
