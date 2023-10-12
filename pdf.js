import pdfjs from "@bundled-es-modules/pdfjs-dist/build/pdf";
import workerContent from './pdfjs.worker.min.json'
import { PDFDocument, rgb, LineCapStyle } from 'pdf-lib'
import save from 'file-saver'

const workerBlob = new Blob([workerContent], { type: 'text/javascript' })
const workerBlobURL = URL.createObjectURL(workerBlob)
pdfjs.GlobalWorkerOptions.workerSrc = workerBlobURL

export class PDFDrawer {
  constructor(canvas, pdfPagesElem) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.pdfPagesElem = pdfPagesElem

    this.pdfDoc
    this.doc
  }

  async createPDF(filePath) {
    const response = await fetch(filePath)
    const arrayBuffer = await response.arrayBuffer()

    const pdfDoc = await PDFDocument.create()
    const doc = await PDFDocument.load(arrayBuffer)
    const pages = await pdfDoc.copyPages(doc, doc.getPageIndices())
    pages.forEach((page) => pdfDoc.addPage(page))

    this.pdfDoc = pdfDoc
    await this.setPdfDocument()
  }

  async setPdfDocument() {
    const bytesArray = await this.pdfDoc.save()
    const doc = await pdfjs.getDocument(bytesArray).promise
    this.doc = doc
  }

  async loadMainPage(pageNumber) {
    const page = await this.doc.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.5 })

    this.canvas.width = viewport.width
    this.canvas.height = viewport.height

    page.render({
      canvasContext: this.ctx,
      viewport
    })
  }

  async loadPagesPreview() {
    const pageCount = this.pdfDoc.getPageCount()
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const canvas = document.createElement('canvas')
      canvas.setAttribute("id", `canvas-page-${pageNumber}`)
      this.pdfPagesElem.appendChild(canvas)

      const page = await this.doc.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 0.35 })

      canvas.width = viewport.width
      canvas.height = viewport.height

      page.render({
        canvasContext: canvas.getContext('2d'),
        viewport
      })
    }
  }

  async saveToDevice(pagesState) {
    let pageNumber = 0
    for (const pageState of pagesState) {
      const canvasShapes = pageState.getShapes()

      // go through every shape and invoke the correct drawing method
      for (const canvasShape of canvasShapes) {
        // now all the shapes are paths so we're just gonna treat it like that until we add more shapes
        const canvasPoints = canvasShape.points
        let svgPath = `M ${canvasPoints[0].x / 1.5} ${canvasPoints[0].y / 1.5} `;

        for (let i = 1; i < canvasPoints.length; i++) {
          svgPath += `L ${canvasPoints[i].x / 1.5} ${canvasPoints[i].y / 1.5} `;
        }

        const currentPage = this.pdfDoc.getPage(pageNumber)

        currentPage.moveTo(0, currentPage.getHeight())
        currentPage.drawSvgPath(svgPath, {
          borderLineCap: LineCapStyle.Round,
          borderWidth: 7,
          borderColor: rgb(1, 0, 0)
        })
      }

      pageNumber += 1
    }

    const pdfBytes = await this.pdfDoc.save()
    save.saveAs(new Blob([pdfBytes], { type: 'application/pdf' }))
  }
}
