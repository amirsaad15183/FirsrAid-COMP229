from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle, Flowable)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'deliverables' / 'part1'
LOGO = ROOT / 'assets' / 'branding' / 'lifeready-training-logo.png'
EVIDENCE = ROOT / 'assets' / 'evidence'

NAVY = colors.HexColor('#102A43')
TEAL = colors.HexColor('#047E87')
ORANGE = colors.HexColor('#F59E0B')
LIGHT = colors.HexColor('#F5F8FA')
MID = colors.HexColor('#D9E2EC')
MUTED = colors.HexColor('#52606D')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='DocTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=28, leading=34, textColor=NAVY, spaceAfter=10))
styles.add(ParagraphStyle(name='SubTitle', parent=styles['Normal'], fontName='Helvetica', fontSize=14, leading=20, textColor=MUTED, spaceAfter=14))
styles.add(ParagraphStyle(name='H1Blue', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=18, leading=23, textColor=NAVY, spaceBefore=6, spaceAfter=9))
styles.add(ParagraphStyle(name='H2Teal', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=TEAL, spaceBefore=6, spaceAfter=5))
styles.add(ParagraphStyle(name='BodyClean', parent=styles['BodyText'], fontName='Helvetica', fontSize=10, leading=14, textColor=NAVY, spaceAfter=7))
styles.add(ParagraphStyle(name='Small', parent=styles['BodyText'], fontName='Helvetica', fontSize=8.5, leading=11, textColor=MUTED))
styles.add(ParagraphStyle(name='CenterSmall', parent=styles['BodyText'], fontName='Helvetica', fontSize=9, leading=12, alignment=TA_CENTER, textColor=MUTED))


class Wireframe(Flowable):
    def __init__(self, title, items, width=3.22*inch, height=2.35*inch):
        super().__init__()
        self.title, self.items, self.width, self.height = title, items, width, height

    def wrap(self, aw, ah):
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.setFillColor(colors.white)
        c.setStrokeColor(TEAL)
        c.setLineWidth(1)
        c.roundRect(0, 0, self.width, self.height, 7, fill=1, stroke=1)
        c.setFillColor(NAVY)
        c.roundRect(0, self.height-26, self.width, 26, 7, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(10, self.height-17, self.title)
        y = self.height-42
        for label, kind in self.items:
            if kind == 'hero':
                c.setFillColor(LIGHT); c.roundRect(10, y-46, self.width-20, 42, 4, fill=1, stroke=0)
                c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 8); c.drawString(18, y-24, label)
                y -= 54
            elif kind == 'button':
                c.setFillColor(ORANGE); c.roundRect(10, y-20, 92, 18, 4, fill=1, stroke=0)
                c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 7); c.drawString(18, y-14, label)
                y -= 28
            elif kind == 'card':
                c.setFillColor(LIGHT); c.setStrokeColor(MID); c.roundRect(10, y-30, self.width-20, 27, 3, fill=1, stroke=1)
                c.setFillColor(NAVY); c.setFont('Helvetica', 7); c.drawString(17, y-14, label)
                y -= 36
            else:
                c.setFillColor(NAVY); c.setFont('Helvetica', 7); c.drawString(13, y-10, label)
                c.setStrokeColor(MID); c.line(10, y-16, self.width-10, y-16)
                y -= 24


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(MID)
    canvas.line(0.7*inch, 0.55*inch, 7.8*inch, 0.55*inch)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.7*inch, 0.37*inch, 'LifeReady Training - COMP229 Project Part 1')
    canvas.drawRightString(7.8*inch, 0.37*inch, f'Page {doc.page}')
    canvas.restoreState()


def P(text, style='BodyClean'):
    return Paragraph(text, styles[style])


def evidence_capture(filename, caption):
    image = Image(str(EVIDENCE / filename), width=3.25*inch, height=1.90*inch)
    return [image, Spacer(1, 0.04*inch), P(caption, 'CenterSmall')]


def make_edd():
    file = OUT / 'EDD-v1-LifeReady-Training.pdf'
    doc = SimpleDocTemplate(str(file), pagesize=letter, leftMargin=0.7*inch, rightMargin=0.7*inch, topMargin=0.65*inch, bottomMargin=0.72*inch)
    story = []
    logo = Image(str(LOGO), width=1.75*inch, height=1.75*inch)
    cover = Table([[logo, [P('External Design Document', 'DocTitle'), P('Version 1 - First Release', 'SubTitle'), P('<b>Project:</b> LifeReady Training (working name)<br/><b>Course:</b> COMP229 - Web Application Development<br/><b>Developer:</b> Amir Saad<br/><b>Student ID:</b> 301473849<br/><b>Release focus:</b> Database, backend connection, API testing', 'BodyClean')]]], colWidths=[2.05*inch, 5.0*inch])
    cover.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'), ('LEFTPADDING',(0,0),(-1,-1),0), ('RIGHTPADDING',(0,0),(-1,-1),8), ('TOPPADDING',(0,0),(-1,-1),6), ('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    story += [Spacer(1, 0.7*inch), cover, Spacer(1, 0.36*inch), P('Purpose', 'H1Blue'), P('LifeReady Training is an original MERN application for managing First Aid, CPR/AED, and Basic Life Support (BLS) training classes. This first release establishes the data model, secure Express API, CRUD operations, authentication, authorization, and repeatable API testing.', 'BodyClean'), Spacer(1, 0.12*inch), P('Brand note: the logo was created with OpenAI image generation for this student project. The working name and domain may change before the final release.', 'Small'), PageBreak()]

    story += [P('Table of Contents', 'H1Blue')]
    toc = [['1', 'Project overview and scope'], ['2', 'Architecture and data design'], ['3', 'Wireframes for top-level features'], ['4', 'API test plan and initial evidence'], ['5', 'Part 1 release plan'], ['Appendix', 'API and database screenshot evidence']]
    t = Table(toc, colWidths=[0.45*inch, 6.55*inch])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),LIGHT),('TEXTCOLOR',(0,0),(-1,-1),NAVY),('FONTNAME',(0,0),(-1,-1),'Helvetica'),('FONTSIZE',(0,0),(-1,-1),10),('LINEBELOW',(0,0),(-1,-1),0.4,MID),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
    story += [t, Spacer(1, 0.22*inch), P('1. Project Overview and Scope', 'H1Blue'), P('The public-facing site will later provide first-aid information and class discovery. The Part 1 release intentionally prioritizes functional backend components rather than visual polish.', 'BodyClean'), P('Primary user roles', 'H2Teal'), P('<b>Student:</b> creates an account, signs in, and manages their own profile. <b>Administrator:</b> manages training classes and can view user records. This separation demonstrates authorization in addition to authentication.', 'BodyClean'), P('First-release goals', 'H2Teal'), P('- Create a MongoDB Atlas database and two collections: Users and TrainingClasses.<br/>- Build Node.js/Express MVC APIs.<br/>- Test Create, Read, Update, and Delete operations for both user and training-class data.<br/>- Restrict class management to administrators using JWT authentication.', 'BodyClean'), PageBreak()]

    story += [P('2. Architecture and Data Design', 'H1Blue'), P('The solution uses a MERN architecture. MongoDB Atlas stores data; Mongoose defines schemas; Express controllers implement MVC behavior; JSON Web Tokens protect authenticated routes. React integration is deliberately reserved for Project Part 2.', 'BodyClean')]
    architecture = [['Layer', 'Implementation', 'Responsibility'], ['Database', 'MongoDB Atlas', 'Stores User and TrainingClass documents.'], ['Model', 'Mongoose schemas', 'Validation, timestamps, password hashing, class fields.'], ['Controller', 'Express MVC controllers', 'Implements CRUD logic and error responses.'], ['Routes', 'Express route modules', 'Maps REST endpoints to controller actions.'], ['Security', 'JWT + role checks', 'Authenticates users and restricts class management to admins.'], ['Testing', 'Thunder Client + repeatable API script', 'Confirms health, auth, authorization, and CRUD responses.']]
    a = Table(architecture, colWidths=[1.12*inch, 1.62*inch, 4.3*inch], repeatRows=1)
    a.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTNAME',(0,1),(-1,-1),'Helvetica'),('FONTSIZE',(0,0),(-1,-1),8.4),('TEXTCOLOR',(0,1),(-1,-1),NAVY),('BACKGROUND',(0,1),(-1,-1),colors.white),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('GRID',(0,0),(-1,-1),0.35,MID),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    story += [a, Spacer(1, 0.18*inch), P('Collections', 'H2Teal'), P('<b>User:</b> name, email, password hash, salt, role, timestamps.<br/><b>TrainingClass:</b> title, category, format, description, class date, duration, location, capacity, price, instructor, status, creator, timestamps.', 'BodyClean'), PageBreak()]

    story += [P('3. Wireframes - Top-Level Features', 'H1Blue'), P('These low-fidelity wireframes guide the Part 2 React implementation. They are original planning artifacts, not copied from the reference website.', 'BodyClean')]
    wires = [[Wireframe('Home / Landing Page', [('LifeReady Training', 'hero'), ('Find a course near you', 'normal'), ('View classes', 'button')],), Wireframe('Training Class List', [('Search and category filter', 'normal'), ('BLS - Toronto - Feb 15', 'card'), ('CPR/AED - Toronto - Feb 22', 'card'), ('View class details', 'button')],)], [Wireframe('Sign Up / Sign In', [('Name, email, password', 'normal'), ('Create account', 'button'), ('Sign in', 'button')],), Wireframe('Admin Class Management', [('Add training class', 'button'), ('Class record - edit / delete', 'card'), ('Capacity, date, price fields', 'normal')],)]]
    wt = Table(wires, colWidths=[3.45*inch, 3.45*inch], rowHeights=[2.55*inch, 2.55*inch])
    wt.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
    story += [wt, PageBreak()]

    story += [P('4. API Test Plan and Initial Evidence', 'H1Blue'), P('The backend was connected to MongoDB Atlas and verified with both Thunder Client manual requests and a repeatable integration test. The following checks passed in the first release.', 'BodyClean')]
    tests = [['Test', 'Expected result', 'Observed result'], ['API health check', '200 OK', 'PASS'], ['User create', '201 Created', 'PASS'], ['Student authentication', '200 OK + JWT', 'PASS'], ['Authorization rule', 'Student blocked from admin class create (403)', 'PASS'], ['User read / update / delete', '200 OK', 'PASS'], ['Administrator authentication', '200 OK + JWT', 'PASS'], ['TrainingClass create / list / update / delete', '201 then 200 responses', 'PASS']]
    tt = Table(tests, colWidths=[2.45*inch, 3.15*inch, 1.35*inch], repeatRows=1)
    tt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),TEAL),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTNAME',(0,1),(-1,-1),'Helvetica'),('FONTSIZE',(0,0),(-1,-1),8.4),('TEXTCOLOR',(0,1),(-1,-1),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('GRID',(0,0),(-1,-1),0.35,MID),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    story += [tt, Spacer(1, 0.22*inch), P('Initial screenshot evidence', 'H2Teal'), P('The following appendix includes saved captures from Thunder Client and MongoDB Atlas. Passwords, JWT values, salts, hashes, and the connection string are not shown.', 'BodyClean'), P('5. Part 1 Release Plan', 'H1Blue'), P('The first release delivers a functional API foundation. The next project phase will integrate React pages, navigation, frontend CRUD forms, class browsing, and polished visual design. The final release will add deployment, unit/E2E testing evidence, performance improvements, and CI/CD documentation.', 'BodyClean'), PageBreak()]

    evidence_sections = [
        ('Appendix A - Server Startup and Health Evidence', 'These captures show the local API running and responding successfully.', [
            ('vscode-server-running.png', 'Figure A1. VS Code server connected to MongoDB.'),
            ('browser-health-check.png', 'Figure A2. Browser API health response.'),
            ('health-check.png', 'Figure A3. Thunder Client health endpoint: 200 OK.'),
            ('student-create-redacted.png', 'Figure A4. Student account create: 201 Created.'),
        ]),
        ('Authentication and User Data Evidence', 'Sensitive passwords, JWT values, salts, and password hashes are redacted in these captures.', [
            ('student-signin-redacted.png', 'Figure A5. Student sign-in response: 200 OK.'),
            ('admin-signin-redacted.png', 'Figure A6. Administrator sign-in response: 200 OK.'),
            ('atlas-users-redacted.png', 'Figure A7. MongoDB Atlas Users collection with sensitive fields redacted.'),
            ('atlas-empty-trainingclasses.png', 'Figure A8. TrainingClasses collection before a class is created.'),
        ]),
        ('Appendix C - TrainingClass CRUD Evidence', 'The project-specific TrainingClass object is created, read, updated, and deleted through protected API routes.', [
            ('class-create.png', 'Figure A9. TrainingClass create: 201 Created.'),
            ('class-read-list.png', 'Figure A10. TrainingClass list/read: 200 OK.'),
            ('class-update.png', 'Figure A11. TrainingClass update: 200 OK.'),
            ('class-delete.png', 'Figure A12. TrainingClass delete: 200 OK.'),
        ]),
        ('Appendix D - MongoDB Atlas TrainingClass Evidence', 'MongoDB Atlas confirms the TrainingClass document persisted after the create and update operations.', [
            ('atlas-trainingclass.png', 'Figure A13. MongoDB Atlas TrainingClasses collection.'),
            ('atlas-updated-class.png', 'Figure A14. Updated TrainingClass document in Atlas.'),
        ]),
    ]
    for index, (title, description, captures) in enumerate(evidence_sections):
        story += [P(title, 'H1Blue'), P(description, 'BodyClean')]
        rows = []
        for offset in range(0, len(captures), 2):
            rows.append([evidence_capture(*captures[offset]), evidence_capture(*captures[offset + 1])])
        grid = Table(rows, colWidths=[3.45*inch, 3.45*inch], rowHeights=[2.30*inch] * len(rows))
        grid.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2)]))
        story += [grid]
        if index < len(evidence_sections) - 1:
            story += [PageBreak()]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return file


def make_backlog_pdf():
    file = OUT / 'Product-Backlog-and-Task-Board.pdf'
    doc = SimpleDocTemplate(str(file), pagesize=letter, leftMargin=0.55*inch, rightMargin=0.55*inch, topMargin=0.6*inch, bottomMargin=0.7*inch)
    story = [P('LifeReady Training - Product Backlog and Task Board', 'DocTitle'), P('COMP229 Project Part 1 | Amir Saad | 301473849', 'SubTitle')]
    story += [P('Product Backlog', 'H1Blue')]
    rows = [['ID','User story / task','Priority','Status'], ['P1-01','Create MongoDB Atlas project, cluster, database user, and access rule.','High','Done'], ['P1-02','Create User model with password hashing and role field.','High','Done'], ['P1-03','Create TrainingClass model and validation rules.','High','Done'], ['P1-04','Build User CRUD REST API routes using MVC.','High','Done'], ['P1-05','Build TrainingClass CRUD REST API routes using MVC.','High','Done'], ['P1-06','Add JWT sign-in and protected routes.','High','Done'], ['P1-07','Add administrator authorization for class management.','High','Done'], ['P1-08','Run Thunder Client API tests and capture evidence.','High','In Progress'], ['P1-09','Create EDD v1 and wireframes.','High','In Progress'], ['P1-10','Create GitHub repository and push organized source.','High','To Do'], ['P1-11','Record Part 1 demonstration video and upload it.','High','To Do']]
    b = Table(rows, colWidths=[0.52*inch, 4.62*inch, 0.75*inch, 0.86*inch], repeatRows=1)
    b.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTNAME',(0,1),(-1,-1),'Helvetica'),('FONTSIZE',(0,0),(-1,-1),8),('TEXTCOLOR',(0,1),(-1,-1),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('GRID',(0,0),(-1,-1),0.3,MID),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story += [b, Spacer(1, 0.22*inch), P('Task Board Snapshot', 'H1Blue')]
    board = [['Done','In Progress','To Do'], ['Atlas database connection\nUser / TrainingClass models\nUser CRUD API\nTrainingClass CRUD API\nJWT authentication\nAdmin authorization', 'Thunder Client screenshots\nEDD v1 review\nBacklog PDF export', 'GitHub remote and commits\nDemo video recording\nVideo upload / submission links']]
    tb = Table(board, colWidths=[2.35*inch, 2.35*inch, 2.35*inch], rowHeights=[0.34*inch, 2.45*inch])
    tb.setStyle(TableStyle([('BACKGROUND',(0,0),(0,0),TEAL),('BACKGROUND',(1,0),(1,0),ORANGE),('BACKGROUND',(2,0),(2,0),MUTED),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTNAME',(0,1),(-1,-1),'Helvetica'),('FONTSIZE',(0,1),(-1,-1),9),('TEXTCOLOR',(0,1),(-1,-1),NAVY),('BACKGROUND',(0,1),(-1,-1),LIGHT),('GRID',(0,0),(-1,-1),0.5,MID),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,1),(-1,-1),8),('BOTTOMPADDING',(0,1),(-1,-1),8),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8)]))
    story += [tb, Spacer(1, 0.15*inch), P('This document can be used as the requested current Product Backlog snapshot. Update the task statuses after GitHub and the demo video are complete.', 'Small')]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return file


def make_logo_pdf():
    file = OUT / 'LifeReady-Training-Logo.pdf'
    doc = SimpleDocTemplate(str(file), pagesize=letter, leftMargin=1.2*inch, rightMargin=1.2*inch, topMargin=1.0*inch, bottomMargin=1.0*inch)
    story = [Spacer(1, 0.45*inch), Image(str(LOGO), width=4.6*inch, height=4.6*inch), Spacer(1, 0.25*inch), P('LifeReady Training', 'DocTitle'), P('Original project logo - AI-generated for this COMP229 student project.', 'CenterSmall')]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return file


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for result in (make_edd(), make_backlog_pdf(), make_logo_pdf()):
        print(result)
