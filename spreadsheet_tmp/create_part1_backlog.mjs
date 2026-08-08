import fs from 'node:fs/promises'
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool'

const outputDir = 'deliverables/part1'
await fs.mkdir(outputDir, { recursive: true })

const workbook = Workbook.create()
const backlog = workbook.worksheets.add('Product Backlog')
const board = workbook.worksheets.add('Task Board')
const evidence = workbook.worksheets.add('API Test Evidence')

const navy = '#102A43'
const teal = '#047E87'
const orange = '#F59E0B'
const light = '#F5F8FA'
const line = '#D9E2EC'

backlog.showGridLines = false
backlog.getRange('A1:D1').merge()
backlog.getRange('A1').values = [['LifeReady Training - COMP229 Product Backlog']]
backlog.getRange('A1:D1').format = { fill: navy, font: { bold: true, color: '#FFFFFF', size: 16 }, horizontalAlignment: 'center', verticalAlignment: 'center' }
backlog.getRange('A1:D1').format.rowHeight = 28
backlog.getRange('A2:D2').merge()
backlog.getRange('A2').values = [['Part 1 | Amir Saad | Student ID: 301473849']]
backlog.getRange('A2:D2').format = { fill: light, font: { italic: true, color: navy }, horizontalAlignment: 'center' }
const backlogRows = [
  ['ID', 'User story / task', 'Priority', 'Status'],
  ['P1-01', 'Create MongoDB Atlas project, database user, and network access rule.', 'High', 'Done'],
  ['P1-02', 'Create User model with secure password hashing and role field.', 'High', 'Done'],
  ['P1-03', 'Create TrainingClass model with validation rules.', 'High', 'Done'],
  ['P1-04', 'Build User CRUD REST API routes using MVC.', 'High', 'Done'],
  ['P1-05', 'Build TrainingClass CRUD REST API routes using MVC.', 'High', 'Done'],
  ['P1-06', 'Add JWT sign-in and protected routes.', 'High', 'Done'],
  ['P1-07', 'Add administrator authorization for class management.', 'High', 'Done'],
  ['P1-08', 'Run Thunder Client API tests and capture evidence.', 'High', 'In Progress'],
  ['P1-09', 'Create EDD v1, logo, wireframes, and presentation.', 'High', 'In Progress'],
  ['P1-10', 'Create GitHub repository and push organized source.', 'High', 'To Do'],
  ['P1-11', 'Record and upload 5-10 minute Part 1 demo video.', 'High', 'To Do'],
]
backlog.getRange('A4:D15').values = backlogRows
backlog.getRange('A4:D4').format = { fill: teal, font: { bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center' }
backlog.getRange('A4:D15').format.borders = { preset: 'all', style: 'thin', color: line }
backlog.getRange('A5:D15').format.wrapText = true
backlog.getRange('A4:D15').format.verticalAlignment = 'center'
backlog.getRange('A4:A15').format.columnWidth = 12
backlog.getRange('B4:B15').format.columnWidth = 64
backlog.getRange('C4:C15').format.columnWidth = 14
backlog.getRange('D4:D15').format.columnWidth = 18
backlog.getRange('A5:D15').format.rowHeight = 30
backlog.getRange('D5:D15').dataValidation = { rule: { type: 'list', values: ['To Do', 'In Progress', 'Done'] } }
backlog.freezePanes.freezeRows(4)

board.showGridLines = false
board.getRange('A1:C1').merge()
board.getRange('A1').values = [['LifeReady Training - Part 1 Task Board']]
board.getRange('A1:C1').format = { fill: navy, font: { bold: true, color: '#FFFFFF', size: 16 }, horizontalAlignment: 'center' }
board.getRange('A1:C1').format.rowHeight = 28
board.getRange('A3:C3').values = [['Done', 'In Progress', 'To Do']]
board.getRange('A3').format = { fill: teal, font: { bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center' }
board.getRange('B3').format = { fill: orange, font: { bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center' }
board.getRange('C3').format = { fill: '#52606D', font: { bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center' }
board.getRange('A4:C4').values = [[
  'Atlas database connection\nUser and TrainingClass models\nUser CRUD API\nTrainingClass CRUD API\nJWT authentication\nAdministrator authorization',
  'Thunder Client screenshots\nEDD v1 review\nBacklog PDF export',
  'GitHub remote and commits\nDemo video recording\nVideo upload and submission links',
]]
board.getRange('A4:C4').format = { fill: light, font: { color: navy, size: 12 }, wrapText: true, verticalAlignment: 'top' }
board.getRange('A3:C4').format.borders = { preset: 'all', style: 'thin', color: line }
board.getRange('A4:C4').format.rowHeight = 220
board.getRange('A:C').format.columnWidth = 34

evidence.showGridLines = false
evidence.getRange('A1:C1').merge()
evidence.getRange('A1').values = [['Part 1 API Test Evidence Log']]
evidence.getRange('A1:C1').format = { fill: navy, font: { bold: true, color: '#FFFFFF', size: 16 }, horizontalAlignment: 'center' }
evidence.getRange('A1:C1').format.rowHeight = 28
const evidenceRows = [
  ['Test', 'Expected status / condition', 'Result'],
  ['Health check', '200 OK', 'PASS'],
  ['User create', '201 Created', 'PASS'],
  ['Student sign in', '200 OK and JWT', 'PASS'],
  ['Authorization', 'Student is blocked from class create (403)', 'PASS'],
  ['User Read / Update / Delete', '200 OK', 'PASS'],
  ['Admin sign in', '200 OK and JWT', 'PASS'],
  ['TrainingClass Create / Read / Update / Delete', '201 then 200', 'PASS'],
]
evidence.getRange('A3:C10').values = evidenceRows
evidence.getRange('A3:C3').format = { fill: teal, font: { bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center' }
evidence.getRange('A3:C10').format = { wrapText: true, verticalAlignment: 'center' }
evidence.getRange('A3:C10').format.borders = { preset: 'all', style: 'thin', color: line }
evidence.getRange('A4:C10').format.rowHeight = 28
evidence.getRange('A:A').format.columnWidth = 40
evidence.getRange('B:B').format.columnWidth = 52
evidence.getRange('C:C').format.columnWidth = 16

const preview = await workbook.render({ sheetName: 'Product Backlog', range: 'A1:D15', scale: 1.5, format: 'png' })
await fs.writeFile('spreadsheet_tmp/backlog-preview.png', new Uint8Array(await preview.arrayBuffer()))

const xlsx = await SpreadsheetFile.exportXlsx(workbook)
await xlsx.save(`${outputDir}/LifeReady-Training-Part1-Backlog-and-Task-Board.xlsx`)

const check = await workbook.inspect({ kind: 'table', range: 'Product Backlog!A1:D15', include: 'values,formulas', tableMaxRows: 15, tableMaxCols: 4 })
console.log(check.ndjson)
