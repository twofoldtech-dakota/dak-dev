# Resume PDF Generation Instructions

## Current Status: Manual Generation Required (MVP)

For the MVP, a static PDF file needs to be manually created and placed at:
`/public/dakota-smith-resume.pdf`

## Content Source
The resume content is defined in `/public/RESUME_CONTENT.md`

## Manual Generation Steps

### Option 1: Using Google Docs (Recommended for MVP)
1. Open `/public/RESUME_CONTENT.md` in a markdown viewer
2. Copy the content to Google Docs
3. Format professionally:
   - Use consistent font (Arial or Calibri, 10-11pt)
   - Bold section headers (14pt)
   - Proper spacing between sections
   - Professional margins (0.5-1 inch)
4. Export as PDF
5. Save as `/public/dakota-smith-resume.pdf`

### Option 2: Using Markdown to PDF Converters
```bash
# Using pandoc (if installed)
pandoc public/RESUME_CONTENT.md -o public/dakota-smith-resume.pdf \
  --pdf-engine=xelatex \
  --variable mainfont="Arial" \
  --variable fontsize=11pt \
  --variable geometry:margin=1in

# Using markdown-pdf (if installed)
markdown-pdf public/RESUME_CONTENT.md -o public/dakota-smith-resume.pdf
```

### Option 3: Using Online Converters
1. Upload `/public/RESUME_CONTENT.md` to https://www.markdowntopdf.com/
2. Download generated PDF
3. Save as `/public/dakota-smith-resume.pdf`

## Requirements Checklist
- [ ] PDF includes all content from About page
- [ ] Professional formatting with consistent typography
- [ ] File size < 500KB
- [ ] PDF metadata includes author: "Dakota Smith" and title: "Dakota Smith - Resume"
- [ ] Filename: `dakota-smith-resume.pdf`

## Future Enhancement: Automated Generation
For automated PDF generation, consider:
- Puppeteer (render HTML to PDF)
- PDFKit (programmatic PDF generation)
- @react-pdf/renderer (React-based PDF generation)
- Vercel OG Image API (for simple single-page resumes)

Example implementation location: `/scripts/generate-resume-pdf.ts`
