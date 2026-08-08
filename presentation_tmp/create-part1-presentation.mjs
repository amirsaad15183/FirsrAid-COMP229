import fs from 'node:fs/promises'
import path from 'node:path'
import { FileBlob, Presentation, PresentationFile } from '@oai/artifact-tool'

const NAVY = '#102A43'
const TEAL = '#047E87'
const ORANGE = '#F59E0B'
const INK = '#172B4D'
const MUTED = '#52606D'
const BACKGROUND = '#F7FAFC'

async function writeBlob(filePath, blob) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()))
}

function addText(slide, { name, text, left, top, width, height, fontSize, color = INK, bold = false, align = 'left' }) {
  const shape = slide.shapes.add({
    geometry: 'textbox',
    name,
    position: { left, top, width, height },
    fill: 'none',
    line: { style: 'solid', fill: 'none', width: 0 },
  })
  shape.text = text
  shape.text.style = { fontSize, color, bold, alignment: align, fontFace: 'Aptos' }
  return shape
}

function addRect(slide, { name, left, top, width, height, fill, line = 'none', radius = undefined }) {
  return slide.shapes.add({
    geometry: radius ? 'roundRect' : 'rect',
    name,
    position: { left, top, width, height },
    fill,
    line: { style: 'solid', fill: line, width: line === 'none' ? 0 : 1 },
    ...(radius ? { borderRadius: radius } : {}),
  })
}

async function main() {
  const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } })
  const logoPath = path.resolve('assets/branding/lifeready-training-logo.png')
  const logoBytes = await fs.readFile(logoPath)
  const logoBlob = logoBytes.buffer.slice(logoBytes.byteOffset, logoBytes.byteOffset + logoBytes.byteLength)
  const photoPath = path.resolve('assets/presenter/amir-saad-photo.jpg')
  const photoBytes = await fs.readFile(photoPath)
  const photoBlob = photoBytes.buffer.slice(photoBytes.byteOffset, photoBytes.byteOffset + photoBytes.byteLength)

  const cover = deck.slides.add()
  cover.background.fill = BACKGROUND
  addRect(cover, { name: 'accent-bar', left: 72, top: 80, width: 10, height: 146, fill: ORANGE })
  addText(cover, {
    name: 'course-label', text: 'COMP229 — WEB APPLICATION DEVELOPMENT', left: 104, top: 82, width: 575, height: 28,
    fontSize: 18, color: TEAL, bold: true,
  })
  addText(cover, {
    name: 'project-title', text: 'LifeReady Training', left: 102, top: 125, width: 610, height: 82,
    fontSize: 54, color: NAVY, bold: true,
  })
  addText(cover, {
    name: 'release-title', text: 'Project Part 1 — Database, Backend & API Testing', left: 104, top: 225, width: 600, height: 66,
    fontSize: 28, color: MUTED,
  })
  addText(cover, {
    name: 'project-description', text: 'An original MERN application for managing First Aid, CPR/AED, and BLS training classes.', left: 104, top: 314, width: 560, height: 72,
    fontSize: 23, color: INK,
  })
  addText(cover, {
    name: 'presenter-details', text: 'Presented by: Amir Saad\nStudent ID: 301473849\nRole: Full-Stack Developer (Independent Project)', left: 104, top: 457, width: 590, height: 100,
    fontSize: 21, color: NAVY,
  })
  cover.images.add({
    blob: logoBlob,
    contentType: 'image/png',
    alt: 'AI-generated LifeReady Training shield and heart-pulse logo',
    fit: 'contain',
    position: { left: 760, top: 82, width: 400, height: 400 },
  })
  addText(cover, {
    name: 'cover-footer', text: 'Working project name and original logo — branding will be finalized later.', left: 104, top: 646, width: 900, height: 24,
    fontSize: 15, color: MUTED,
  })
  cover.speakerNotes.textFrame.setText('[Sources]\n- Logo: created with OpenAI image generation for this project; original asset stored in assets/branding/lifeready-training-logo.png.\n[/Sources]')
  cover.speakerNotes.setVisible(true)

  const profile = deck.slides.add()
  profile.background.fill = BACKGROUND
  addRect(profile, { name: 'top-rule', left: 72, top: 64, width: 92, height: 8, fill: ORANGE })
  addText(profile, {
    name: 'profile-heading', text: 'Developer Profile', left: 72, top: 94, width: 700, height: 60,
    fontSize: 42, color: NAVY, bold: true,
  })
  addText(profile, {
    name: 'profile-intro', text: 'The project is being completed independently with professor approval.', left: 72, top: 164, width: 880, height: 40,
    fontSize: 24, color: MUTED,
  })
  addRect(profile, { name: 'photo-frame', left: 148, top: 250, width: 270, height: 270, fill: '#D9E2EC', line: TEAL, radius: 'rounded-xl' })
  profile.images.add({
    blob: photoBlob,
    contentType: 'image/jpeg',
    alt: 'Photograph of Amir Saad',
    fit: 'cover',
    position: { left: 154, top: 256, width: 258, height: 258 },
    geometry: 'roundRect',
    borderRadius: 'rounded-xl',
  })
  addText(profile, {
    name: 'full-name', text: 'Amir Saad', left: 118, top: 536, width: 330, height: 30,
    fontSize: 23, color: NAVY, bold: true, align: 'center',
  })
  addRect(profile, { name: 'role-rule', left: 212, top: 572, width: 142, height: 4, fill: TEAL })
  addText(profile, {
    name: 'role', text: 'Full-Stack Developer', left: 118, top: 586, width: 330, height: 26,
    fontSize: 18, color: TEAL, bold: true, align: 'center',
  })
  addText(profile, {
    name: 'responsibilities', text: 'Part 1 Responsibilities\n• Data modelling and MongoDB collections\n• Express MVC API and authentication\n• CRUD testing and project documentation', left: 548, top: 292, width: 560, height: 180,
    fontSize: 22, color: INK,
  })
  addText(profile, {
    name: 'profile-footer', text: 'LifeReady Training - Project Part 1 presentation', left: 72, top: 646, width: 960, height: 24,
    fontSize: 15, color: MUTED,
  })
  profile.speakerNotes.textFrame.setText('[Sources]\n- Photograph: supplied by Amir Saad for this presentation; stored in assets/presenter/amir-saad-photo.jpg.\n[/Sources]')
  profile.speakerNotes.setVisible(true)

  const output = path.resolve('deliverables/part1/LifeReady-Training-Part1-Presentation.pptx')
  await fs.mkdir(path.dirname(output), { recursive: true })

  for (const [index, slide] of deck.slides.items.entries()) {
    await writeBlob(path.resolve(`presentation_tmp/rendered/slide-${index + 1}.png`), await deck.export({ slide, format: 'png', scale: 1 }))
  }
  await writeBlob(path.resolve('presentation_tmp/rendered/montage.webp'), await deck.export({ format: 'webp', montage: true, scale: 1 }))
  const pptx = await PresentationFile.exportPptx(deck)
  await pptx.save(output)

  const reopenedDeck = await PresentationFile.importPptx(await FileBlob.load(output))
  for (const [index, slide] of reopenedDeck.slides.items.entries()) {
    await writeBlob(path.resolve(`presentation_tmp/verified-final/slide-${index + 1}.png`), await reopenedDeck.export({ slide, format: 'png', scale: 1 }))
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
