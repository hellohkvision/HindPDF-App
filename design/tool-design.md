# HindPDF mobile tool design

This document captures the approved visual direction and tool-by-tool designs. It is a design specification, not a claim that each feature is implemented or verified. Keep the existing availability and plan rules authoritative; do not present unimplemented features as working.

## Shared visual language

- Use the approved soft slate-blue and off-white surfaces with dark charcoal type and red primary actions. Keep the HindPDF wordmark compact at the top left and a search icon at the top right; no subtitle or search bar in the header. Search opens on icon tap.
- Keep text comfortably sized and restrained: body around 14–16 logical pixels, section labels 16–18 and screen title around 20–22, adapting to the device's accessibility font settings. Minimum touch target 44–48 logical pixels. Keep contrast legible.
- Keep the bottom navigation consistent: Home, Tools, Scan (center camera), Files, Account. Indicate the active section visually and accessibly.
- Each tool has a back button, compact title, one short instruction, a file or input section, only relevant settings and a clear action. Scrolling must not hide essential controls behind navigation or the keyboard. Show supported input types before selection.
- Display selected file name and size, allow removal, and for multiple inputs allow reordering. Never silently discard a user's selection. Show page count only when actually known.
- Show validation next to the relevant field after an action or relevant edit. Use a readable icon and message, not color alone. Never display raw API bodies, status codes, stack traces or exception strings. Keep detailed diagnostics out of the user interface.
- Processing state: show descriptive progress if known and a clear working state if not; prevent duplicate submissions, allow cancellation only when truly supported, and retain inputs on recoverable failure. If a process can continue remotely, do not imply it was cancelled.
- Result state: show actual output name, size and format, then Open, Save / Share and use-another-tool where supported. Do not announce success before the output is saved and backend usage or payment confirmation has succeeded.
- If a feature is unavailable in the running app, show a clear unavailable state and disable its action. Do not imply secure redaction or preservation of selectable text where it is not provided.

## General errors

| Situation | User-facing inline message / action |
| --- | --- |
| No file | Choose a file to continue. |
| Wrong format | Choose a supported file. |
| Multiple PDFs required | Please add at least 2 PDF files to merge. |
| Invalid page selection | Enter valid page numbers, such as 1, 3–5. |
| Incorrect password | This password didn't open the PDF. Please try again. |
| Required input empty | Enter [field name] to continue. |
| File cannot be read | We couldn't open this file. Try another copy. |
| No connection | Check your internet connection and try again. |
| Service temporarily unavailable | This tool is temporarily unavailable. Please try again later. |
| Daily limit | You've reached today's free limit. View available plans or try again later. |
| Sign-in required | Sign in to continue with this tool. |
| Storage failure | We couldn't save the file. Check your device storage and try again. |
| Output below/above an unachievable size | We couldn't reach that size with these settings. Try different dimensions or a larger size limit. |

Backend error codes may drive message selection, but unknown errors always map to a generic helpful message. Never claim the document was deleted, an action cancelled, payment confirmed, or target size reached unless verified.

## Tool workbenches

All file actions and options below are design requirements. Existing code must be checked before enabling a control.

| Tool | Inputs and settings | Primary action and contextual feedback |
| --- | --- | --- |
| Merge PDF | Two or more PDFs, reorder and remove. | Merge PDFs. Inline minimum-two-files message. |
| Split PDF | PDF; choose pages/ranges or separate selected pages. | Split PDF; reject invalid page ranges beside the page field. |
| Compress PDF | PDF; Recommended, Maximum, High quality; optional target KB and 100/200/500 shortcuts. | Compress PDF; report actual output size and whether target was met. |
| PDF to JPG | PDF; optional page selection. | Convert to JPG; output image or ZIP as produced. |
| JPG to PDF | Multiple JPG/PNG images; reorder. | Create PDF; validate supported images. |
| PDF to PNG | PDF; optional page selection. | Convert to PNG; report output format. |
| PNG to PDF | Multiple PNG/JPG images; reorder. | Create PDF; validate supported images. |
| Image to PDF | Multiple JPG/PNG images; reorder. | Create PDF; validate supported images. |
| Photo Resizer | Image; editable width and height; optional minimum/maximum KB. | Prepare photo; explain if settings cannot reach the requested size. |
| Compress Photo | Image; optional dimensions and maximum KB. | Compress photo; show actual output size. |
| Signature Resizer | Signature image; editable dimensions and size limits. | Prepare signature; show output dimensions and size. |
| Thumb Impression Resizer | Thumb image; dimensions and size limits. | Prepare thumb impression; explain unsupported image or impossible target. |
| Declaration Optimizer | Declaration image; dimensions and size limits. | Prepare declaration; show output dimensions and size. |
| Photo + Signature Prep | Two separately labeled inputs: photo and signature; independently editable dimensions and sizes. | Prepare both; identify missing input next to its field; output ZIP when supported. |
| PDF to Image | PDF; JPG/PNG choice and optional pages. | Convert images; report actual format and ZIP output. |
| Word to PDF | DOC/DOCX file. | Convert to PDF; describe unsupported file or conversion failure plainly. |
| PDF to Word | PDF file. | Convert to Word; explain that scanned pages may require OCR where applicable. |
| Excel to PDF | XLS/XLSX file; available layout choices. | Convert to PDF; display service messages in plain language. |
| PDF to Excel | PDF file; table extraction mode when available. | Convert to Excel; report no table or unsupported content plainly. |
| PowerPoint to PDF | PPT/PPTX file, subject to service availability. | Convert to PDF; disable if service unavailable. |
| PDF to PowerPoint | Show tool description and current unavailability. | Unavailable; no misleading conversion action. |
| Rotate PDF | PDF; optional page range and 90/180/270 degree rotation. | Rotate PDF; show chosen pages and direction. |
| Delete PDF Pages | PDF; page selection. | Delete pages; reject empty selection and deleting every page. |
| Extract PDF Pages | PDF; page selection. | Extract pages; reject invalid ranges. |
| Reorder PDF Pages | PDF; ordered page list or visual reorder when supported. | Save page order; reject duplicates and invalid pages. |
| Add Page Numbers | PDF; page range, position and size supported by actual implementation. | Add page numbers; show a simple position preview if available. |
| Crop PDF | PDF; crop margins or visual crop when supported. | Crop PDF; warn if crop area is invalid. |
| Edit PDF | PDF; available text/annotation controls and page selection. | Save changes; label clearly which editing actions are supported. |
| Add Text to PDF | PDF; text, page selection, position and text size. | Add text; validate missing text and page position. |
| Watermark PDF | PDF; watermark text, page selection and size. | Add watermark; show available preview. |
| Protect PDF | PDF; password and confirmation, plus allowed permissions if available. | Protect PDF; unavailable until the mobile protection is implemented and verified. |
| Unlock PDF | PDF; current password and selected pages. | Unlock PDF; explain incorrect password and that rasterized output can lose selectable text. |
| Sign PDF | PDF; draw, type or choose a signature image; page and placement. | Sign PDF; validate signature and ensure placement is inside page. |
| Redact PDF | Explain current availability without suggesting a visual overlay is secure redaction. | Unavailable; no action until secure redaction is supported. |
| Scan to PDF | Camera permission state; flash/gallery, capture pages, review/reorder/remove. | Create PDF; show permission guidance and avoid claiming automatic crop unless implemented. |
| OCR PDF | PDF; supported OCR language. | Create searchable PDF; server availability and access determine enabled state. |
| PDF Viewer | Select PDF; view pages, zoom and navigate as supported. | Open PDF; explain unsupported or locked files. |
| Repair PDF | PDF. | Unavailable until mobile repair is implemented and verified. |
| HTML to PDF | HTML input or file. | Unavailable until safe mobile rendering is implemented and verified. |

## Other screens and states

- Home: approved compact brand and search icon; scan/choose-file entry, popular tools, application-preparation shortcuts and recent files.
- Tools: category chips and searchable catalog; search icon opens search rather than displaying a persistent search bar. Avoid inaccurate claims such as lossless compression.
- Scanner: camera preview, accessible shutter, flash/gallery controls and page review; permission denied and empty states have clear actions.
- Files: filters and sorting for files actually saved on the device; no invented fixed quota, cloud storage or syncing. Actions include open, save/share and delete where supported.
- Account: profile, plan, payment history, refund requests, settings/help and sign-out; signed-out state offers sign-in and registration. Sensitive actions require identity verification and confirmation. Payment and social-login controls depend on available platform configuration.
- Every screen also needs loading, empty, offline and error states. Preserve accessibility font scaling and screen-reader labels. Do not rely solely on color.
