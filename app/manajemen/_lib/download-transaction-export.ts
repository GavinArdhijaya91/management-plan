'use client'

import {
  createTransactionExportReport,
  spreadsheetSafeText,
  transactionExportFileName,
  type TransactionExportFormat,
  type TransactionExportReport,
} from '@/app/manajemen/_domain/transaction-export'
import type { DemoTransaction } from '@/types'
import type { SheetData } from 'write-excel-file/browser'

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

async function downloadXlsx(report: TransactionExportReport, fileName: string) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser')
  const headerStyle = { fontWeight: 'bold' as const, backgroundColor: '#E4E4E7' }
  const rows: SheetData = [
    [{ value: report.title, fontWeight: 'bold' as const }],
    [{ value: `Dibuat: ${new Date(report.generatedAt).toLocaleString('id-ID')}` }],
    [],
    [
      { value: 'Tanggal', ...headerStyle },
      { value: 'Jenis', ...headerStyle },
      { value: 'Nominal', ...headerStyle },
      { value: 'Biaya pokok', ...headerStyle },
      { value: 'Hasil bersih', ...headerStyle },
      { value: 'Status', ...headerStyle },
    ],
    ...report.rows.map((row) => [
      { value: spreadsheetSafeText(row.date) },
      { value: spreadsheetSafeText(row.type) },
      { value: row.amount, format: '#,##0' },
      { value: row.costAmount, format: '#,##0' },
      { value: row.netResult, format: '#,##0' },
      { value: spreadsheetSafeText(row.result) },
    ]),
    [],
    [
      { value: 'Total penjualan', ...headerStyle },
      { value: report.summary.totalSales, format: '#,##0' },
    ],
    [
      { value: 'Total biaya pokok', ...headerStyle },
      { value: report.summary.totalCostAmount, format: '#,##0' },
    ],
    [
      { value: 'Hasil bersih', ...headerStyle },
      { value: report.summary.totalNetResult, format: '#,##0' },
    ],
    [
      { value: 'Margin', ...headerStyle },
      { value: report.summary.margin / 100, format: '0%' },
    ],
  ]

  await writeXlsxFile(rows, {
    columns: [{ width: 16 }, { width: 16 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 14 }],
  }).toFile(fileName)
}

async function downloadPdf(report: TransactionExportReport, fileName: string) {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageHeight = document.internal.pageSize.getHeight()
  let y = 18

  document.setFontSize(16)
  document.text(report.title, 14, y)
  y += 8
  document.setFontSize(9)
  document.setTextColor(90)
  document.text(`Dibuat ${new Date(report.generatedAt).toLocaleString('id-ID')} · Mata uang IDR`, 14, y)
  y += 10
  document.setTextColor(20)

  const addLine = (text: string, bold = false) => {
    if (y > pageHeight - 15) {
      document.addPage()
      y = 18
    }
    document.setFont('helvetica', bold ? 'bold' : 'normal')
    document.text(text, 14, y, { maxWidth: 180 })
    y += 6
  }

  addLine(
    `Ringkasan: ${report.summary.transactionCount} transaksi · Penjualan ${rupiah.format(report.summary.totalSales)} · Hasil bersih ${rupiah.format(report.summary.totalNetResult)} · Margin ${report.summary.margin}%`,
    true,
  )
  y += 3
  report.rows.forEach((row, index) => {
    addLine(
      `${index + 1}. ${row.date} · ${row.type} · ${rupiah.format(row.amount)} · Biaya ${rupiah.format(row.costAmount)} · Bersih ${rupiah.format(row.netResult)} · ${row.result}`,
    )
  })

  document.save(fileName)
}

async function downloadDocx(report: TransactionExportReport, fileName: string) {
  const { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun } = await import('docx')
  const cell = (text: string, bold = false) =>
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold })] })] })

  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: report.title, heading: HeadingLevel.TITLE }),
          new Paragraph({
            text: `Dibuat ${new Date(report.generatedAt).toLocaleString('id-ID')} · Mata uang IDR`,
          }),
          new Paragraph({
            text: `Total penjualan ${rupiah.format(report.summary.totalSales)} · Biaya pokok ${rupiah.format(report.summary.totalCostAmount)} · Hasil bersih ${rupiah.format(report.summary.totalNetResult)} · Margin ${report.summary.margin}%`,
          }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  cell('Tanggal', true),
                  cell('Jenis', true),
                  cell('Nominal', true),
                  cell('Biaya pokok', true),
                  cell('Hasil bersih', true),
                  cell('Status', true),
                ],
              }),
              ...report.rows.map(
                (row) =>
                  new TableRow({
                    children: [
                      cell(row.date),
                      cell(row.type),
                      cell(rupiah.format(row.amount)),
                      cell(rupiah.format(row.costAmount)),
                      cell(rupiah.format(row.netResult)),
                      cell(row.result),
                    ],
                  }),
              ),
            ],
          }),
        ],
      },
    ],
  })

  saveBlob(await Packer.toBlob(document), fileName)
}

export async function downloadTransactionExport(transactions: DemoTransaction[], format: TransactionExportFormat) {
  if (transactions.length === 0) throw new Error('Tidak ada transaksi untuk diekspor.')

  const generatedAt = new Date()
  const report = createTransactionExportReport(transactions, generatedAt)
  const fileName = transactionExportFileName(format, generatedAt)

  if (format === 'xlsx') return downloadXlsx(report, fileName)
  if (format === 'pdf') return downloadPdf(report, fileName)
  return downloadDocx(report, fileName)
}
