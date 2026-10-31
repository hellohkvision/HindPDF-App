// Keep AndroidPdfViewer's current document loaded during zoom/page prop updates.
// Pinned to react-native-pdf 7.0.5; fail installation if upstream sources change.
const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'../node_modules/react-native-pdf');
if(!fs.existsSync(root)){console.log('react-native-pdf not installed; skipping Android patch');process.exit(0);}
const pkg=require(path.join(root,'package.json'));if(pkg.version!=='7.0.5')throw Error('Review Android PDF patch for react-native-pdf '+pkg.version);
const viewPath=path.join(root,'android/src/main/java/org/wonday/pdf/PdfView.java');
const managerPath=path.join(root,'android/src/main/java/org/wonday/pdf/PdfManager.java');
let view=fs.readFileSync(viewPath,'utf8'),manager=fs.readFileSync(managerPath,'utf8');
function replace(source,oldText,newText,name){if(source.includes(newText))return source;if(!source.includes(oldText))throw Error('Cannot apply PDF patch: '+name);return source.replace(oldText,newText);}
view=replace(view,'import android.graphics.Canvas;','import android.graphics.Canvas;\nimport android.graphics.PointF;','PointF');
view=replace(view,'    private float lastPageHeight = 0;',`    private float lastPageHeight = 0;
    private String lastDocumentConfig = null;
    private boolean requestedPageChange = false;
    private boolean requestedScaleChange = false;
    private float lastReportedZoom = 1f;`,'state');
view=replace(view,'    public void drawPdf() {',`    // The upstream manager reloads the whole document for every native prop update.
    // Only configuration changes need a reload; page and zoom use the live PDFView.
    public void applyPendingUpdates() {
        if (this.path == null) return;
        String config = String.valueOf(path) + "|" + String.valueOf(password) + "|" + horizontal + "|" + spacing + "|" + enableAntialiasing + "|" + enableAnnotationRendering + "|" + enableDoubleTapZoom + "|" + enablePaging + "|" + fitPolicy + "|" + singlePage + "|" + scrollEnabled + "|" + enableRTL + "|" + minScale + "|" + maxScale;
        if (!config.equals(lastDocumentConfig) || isRecycled() || (singlePage && requestedPageChange)) {
            lastDocumentConfig = config;
            requestedPageChange = false;
            requestedScaleChange = false;
            drawPdf();
            return;
        }
        if (requestedPageChange) {
            requestedPageChange = false;
            jumpTo(Math.max(0, page - 1), false);
        }
        if (requestedScaleChange) {
            requestedScaleChange = false;
            zoomCenteredTo(Math.max(minScale, Math.min(maxScale, scale)), new PointF(getWidth() / 2f, getHeight() / 2f));
            loadPages();
        }
    }

    public void drawPdf() {`,'update method');
view=replace(view,'        this.page = Math.max(page, 1);\n        this.handlePage(this.page - 1);',`        int nextPage = Math.max(page, 1);
        if (this.page != nextPage) requestedPageChange = true;
        this.page = nextPage;`,'page setter');
view=replace(view,'        this.scale = scale;',`        if (Float.compare(this.scale, scale) != 0) requestedScaleChange = true;
        this.scale = scale;`,'scale setter');
view=replace(view,'        if (t.getMessage().contains("Password required or incorrect password")) {',`        String errorMessage = t.getMessage();
        if (errorMessage != null && errorMessage.contains("Password required or incorrect password")) {`,'null error');
view=replace(view,'            event.putString("message", "error|"+t.getMessage());','            event.putString("message", "error|"+(errorMessage != null ? errorMessage : "Unable to open PDF."));','error fallback');
view=replace(view,'if (lastPageWidth>0 && lastPageHeight>0 && (pageWidth!=lastPageWidth || pageHeight!=lastPageHeight)) {', 'if (Math.abs(getZoom() - lastReportedZoom) >= 0.01f) {', 'zoom event threshold');
view=replace(view,'event.putString("message", "scaleChanged|"+(pageWidth/originalWidth));', 'lastReportedZoom = getZoom();\n            event.putString("message", "scaleChanged|"+lastReportedZoom);', 'actual zoom');
manager=replace(manager,'        view.setPage(page);\n    }\n\n    @Override\n    public void receiveCommand', '        view.setPage(page);\n        view.applyPendingUpdates();\n    }\n\n    @Override\n    public void receiveCommand','Fabric page command');
const oldPost='pdfView.post(pdfView::drawPdf);',newPost='pdfView.post(pdfView::applyPendingUpdates);';
manager=manager.split(oldPost).join(newPost);
if((manager.match(/pdfView\.post\(pdfView::applyPendingUpdates\)/g)||[]).length!==2)throw Error('Cannot apply PDF patch: Fabric updates');
fs.writeFileSync(viewPath,view);fs.writeFileSync(managerPath,manager);console.log('Applied Android PDF viewer update patch');
