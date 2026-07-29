'use client'

import {
  createDemoTransactionExportReport,
  createTransactionExportReport,
  spreadsheetSafeText,
  transactionExportFileName,
  type TransactionExportFormat,
  type TransactionExportReport,
  type TransactionExportRow,
} from '@/app/manajemen/_domain/transaction-export'
import type { DemoTransaction } from '@/types'
import type { SheetData } from 'write-excel-file/browser'

function formatCurrency(value: number, currencyCode: string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value)
}

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
      { value: 'Mata uang', ...headerStyle },
      { value: 'Akun', ...headerStyle },
      { value: 'Status', ...headerStyle },
      { value: 'Catatan', ...headerStyle },
    ],
    ...report.rows.map((row) => [
      { value: spreadsheetSafeText(row.date) },
      { value: spreadsheetSafeText(row.type) },
      { value: row.amount, format: '#,##0.00' },
      { value: row.costAmount, format: '#,##0.00' },
      { value: row.netResult, format: '#,##0.00' },
      { value: spreadsheetSafeText(row.currencyCode) },
      { value: spreadsheetSafeText(row.accountName) },
      { value: spreadsheetSafeText(row.result) },
      { value: spreadsheetSafeText(row.note) },
    ]),
    [],
    ...report.summaries.flatMap((summary) => [
      [
        { value: `Ringkasan ${spreadsheetSafeText(summary.currencyCode)}`, ...headerStyle },
        { value: `${summary.transactionCount} transaksi` },
      ],
      [{ value: 'Total penjualan' }, { value: summary.totalSales, format: '#,##0.00' }],
      [{ value: 'Total biaya pokok' }, { value: summary.totalCostAmount, format: '#,##0.00' }],
      [{ value: 'Hasil bersih' }, { value: summary.totalNetResult, format: '#,##0.00' }],
      [{ value: 'Margin' }, { value: summary.margin / 100, format: '0%' }],
      [],
    ]),
  ]

  await writeXlsxFile(rows, {
    columns: [
      { width: 16 },
      { width: 16 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 14 },
      { width: 22 },
      { width: 14 },
      { width: 36 },
    ],
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
  document.text(`Dibuat ${new Date(report.generatedAt).toLocaleString('id-ID')}`, 14, y)
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

  report.summaries.forEach((summary) =>
    addLine(
      `${summary.currencyCode}: ${summary.transactionCount} transaksi · Penjualan ${formatCurrency(summary.totalSales, summary.currencyCode)} · Hasil bersih ${formatCurrency(summary.totalNetResult, summary.currencyCode)} · Margin ${summary.margin}%`,
      true,
    ),
  )
  y += 3
  report.rows.forEach((row, index) => {
    addLine(
      `${index + 1}. ${row.date} · ${row.type} · ${formatCurrency(row.amount, row.currencyCode)} · Biaya ${formatCurrency(row.costAmount, row.currencyCode)} · Bersih ${formatCurrency(row.netResult, row.currencyCode)} · ${row.accountName} · ${row.result}${row.note ? ` · ${row.note}` : ''}`,
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
          new Paragraph({ text: `Dibuat ${new Date(report.generatedAt).toLocaleString('id-ID')}` }),
          ...report.summaries.map(
            (summary) =>
              new Paragraph({
                text: `${summary.currencyCode}: ${summary.transactionCount} transaksi · Total penjualan ${formatCurrency(summary.totalSales, summary.currencyCode)} · Biaya pokok ${formatCurrency(summary.totalCostAmount, summary.currencyCode)} · Hasil bersih ${formatCurrency(summary.totalNetResult, summary.currencyCode)} · Margin ${summary.margin}%`,
              }),
          ),
          new Table({
            rows: [
              new TableRow({
                children: [
                  cell('Tanggal', true),
                  cell('Jenis', true),
                  cell('Nominal', true),
                  cell('Biaya pokok', true),
                  cell('Hasil bersih', true),
                  cell('Mata uang', true),
                  cell('Akun', true),
                  cell('Status', true),
                  cell('Catatan', true),
                ],
              }),
              ...report.rows.map(
                (row) =>
                  new TableRow({
                    children: [
                      cell(row.date),
                      cell(row.type),
                      cell(formatCurrency(row.amount, row.currencyCode)),
                      cell(formatCurrency(row.costAmount, row.currencyCode)),
                      cell(formatCurrency(row.netResult, row.currencyCode)),
                      cell(row.currencyCode),
                      cell(row.accountName),
                      cell(row.result),
                      cell(row.note),
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

function downloadReport(report: TransactionExportReport, format: TransactionExportFormat, fileName: string) {
  if (format === 'xlsx') return downloadXlsx(report, fileName)
  if (format === 'pdf') return downloadPdf(report, fileName)
  return downloadDocx(report, fileName)
}

export async function downloadTransactionExport(transactions: DemoTransaction[], format: TransactionExportFormat) {
  if (transactions.length === 0) throw new Error('Tidak ada transaksi untuk diekspor.')

  const generatedAt = new Date()
  return downloadReport(
    createDemoTransactionExportReport(transactions, generatedAt),
    format,
    transactionExportFileName(format, generatedAt),
  )
}

export async function downloadPrivateTransactionExport(
  rows: TransactionExportRow[],
  format: TransactionExportFormat,
  workspaceName: string,
) {
  if (rows.length === 0) throw new Error('Tidak ada transaksi privat untuk diekspor.')

  const generatedAt = new Date()
  return downloadReport(
    createTransactionExportReport(rows, generatedAt, `Laporan Transaksi · ${workspaceName}`),
    format,
    transactionExportFileName(format, generatedAt),
  )
}
