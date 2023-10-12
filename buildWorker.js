const fs = require('fs')

fs.writeFileSync(
  './pdfjs.worker.min.json',
  JSON.stringify(
    fs.readFileSync(
      './node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js',
      'utf-8'
    )
  )
);
