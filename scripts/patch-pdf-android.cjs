// Keep AndroidPdfViewer's current document loaded during zoom/page prop updates.
// Pinned to react-native-pdf 7.0.5; fail installation if upstream sources change.
const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'../node_modules/react-native-pdf');
if(!fs.existsSync(root)){console.log('react-native-pdf not installed; skipping Android patch');process.exit(0);}
const pkg=require(path.join(root,'package.json'));if(pkg.version!=='7.0.5')throw Error('Review Android PDF patch for react-native-pdf '+pkg.version);
const viewPath=path.join(root,'android/src/main/java/org/wonday/pdf/PdfView.java');
const managerPath=path.join(root,'android/src/main/java/org/wonday/pdf/PdfManager.java');
const fabricPath=path.join(root,'fabric/RNPDFPdfNativeComponent.js'), indexPath=path.join(root,'index.js'), iosPath=path.join(root,'ios/RNPDFPdf/RNPDFPdfView.mm');
let view=fs.readFileSync(viewPath,'utf8'),manager=fs.readFileSync(managerPath,'utf8'),fabric=fs.readFileSync(fabricPath,'utf8'),index=fs.readFileSync(indexPath,'utf8'),ios=fs.readFileSync(iosPath,'utf8');
function replace(source,oldText,newText,name){if(source.includes(newText))return source;if(!source.includes(oldText))throw Error('Cannot apply PDF patch: '+name);return source.replace(oldText,newText);}
view=replace(view,'import android.graphics.Canvas;','import android.graphics.Canvas;\nimport android.graphics.PointF;','PointF');
view=replace(view,'    private float lastPageHeight = 0;',`    private float lastPageHeight = 0;
    private String lastDocumentConfig = null;
    private boolean requestedPageChange = false;
    private boolean requestedScaleChange = false;
    private float lastReportedZoom = 1f;`,'state');
view=replace(view,'import android.view.MotionEvent;','import android.view.MotionEvent;\nimport android.view.GestureDetector;','selection gesture import');
view=replace(view,'    private float lastReportedZoom = 1f;',`    private float lastReportedZoom = 1f;
    private GestureDetector hindPdfSelectionGesture;`,'selection gesture state');
view=replace(view,'        super(context, set);',`        super(context, set);
        hindPdfSelectionGesture = new GestureDetector(context, new GestureDetector.SimpleOnGestureListener() {
            @Override public boolean onDown(MotionEvent event) { return true; }
            @Override public void onLongPress(MotionEvent event) {
                WritableMap selectionEvent = Arguments.createMap();
                selectionEvent.putString("message", "pageLongPress|" + page);
                ThemedReactContext reactContext = (ThemedReactContext) getContext();
                EventDispatcher dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, getId());
                if (dispatcher != null) dispatcher.dispatchEvent(new TopChangeEvent(UIManagerHelper.getSurfaceId(PdfView.this), getId(), selectionEvent));
            }
        });`,'selection gesture setup');
view=replace(view,'    public void onPageChanged(int page, int numberOfPages) {',`    public boolean dispatchTouchEvent(MotionEvent event) {
        if (hindPdfSelectionGesture != null) hindPdfSelectionGesture.onTouchEvent(event);
        return super.dispatchTouchEvent(event);
    }

    @Override
    public void onPageChanged(int page, int numberOfPages) {`,'selection gesture dispatch');
index=replace(index,"            } else if (message[0] === 'pageSingleTap') {",`            } else if (message[0] === 'pageLongPress') {
                this.props.onPageLongPress && this.props.onPageLongPress(Number(message[1]));
            } else if (message[0] === 'pageSingleTap') {`,'selection gesture bridge');
if(!view.includes('public void applyPendingUpdates()'))view=replace(view,'    public void drawPdf() {',`    // The upstream manager reloads the whole document for every native prop update.
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
view=replace(view,'    public void drawPdf() {',`    public void focusSearchResult(int pageNumber, float x, float y) {
        int pageIndex = Math.max(0, Math.min(getPageCount() - 1, pageNumber - 1));
        if (getPageCount() <= 0) return;
        jumpTo(pageIndex, false);
        SizeF size = getPageSize(pageIndex);
        float nx = Math.max(0f, Math.min(1f, x));
        float ny = Math.max(0f, Math.min(1f, y));
        float dx = getWidth() / 2f - (getCurrentXOffset() + nx * size.getWidth() * getZoom());
        float dy = getHeight() * .35f - ny * size.getHeight() * getZoom();
        moveRelativeTo(dx, dy);
        loadPages();
    }

    public void drawPdf() {`,'focus search result');
fabric=replace(fabric,"  +setNativePage: (",`  +setNativeSearchPosition: (
    viewRef: React.ElementRef<ComponentType>,
    page: Int32,
    x: Float,
    y: Float,
    pdfX: Float,
    pdfY: Float,
  ) => void;
  +setNativePage: (`,'search command definition');
fabric=replace(fabric,"supportedCommands: ['setNativePage']", "supportedCommands: ['setNativePage', 'setNativeSearchPosition']",'search command registration');
index=replace(index,'    _onChange = (event) => {',`    setSearchPosition(page, x, y, pdfX, pdfY) {
        if (this._root && global?.nativeFabricUIManager) {
            PdfViewCommands.setNativeSearchPosition(this._root, page, x, y, pdfX, pdfY);
        } else {
            this.setPage(page);
        }
    }

    _onChange = (event) => {`,'search command bridge');
manager=replace(manager,'    @Override\n    public void receiveCommand(@NonNull PdfView root, String commandId, @androidx.annotation.Nullable ReadableArray args) {',`    @Override
    public void setNativeSearchPosition(PdfView view, int page, float x, float y, float pdfX, float pdfY) {
        view.focusSearchResult(page, x, y);
    }

    @Override
    public void receiveCommand(@NonNull PdfView root, String commandId, @androidx.annotation.Nullable ReadableArray args) {`,'Android command method');
manager=replace(manager,'        if ("setNativePage".equals(commandId)) {',`        if ("setNativeSearchPosition".equals(commandId)) {
            Assertions.assertNotNull(args);
            setNativeSearchPosition(root, args.getInt(0), (float) args.getDouble(1), (float) args.getDouble(2), (float) args.getDouble(3), (float) args.getDouble(4));
            return;
        }
        if ("setNativePage".equals(commandId)) {`,'Android command dispatch');
ios=replace(ios,'- (void)setNativePage:(NSInteger)page\n{',`- (void)setNativeSearchPosition:(NSInteger)page x:(float)x y:(float)y pdfX:(float)pdfX pdfY:(float)pdfY
{
    if (page < 1 || page > _pdfView.document.pageCount) return;
    PDFPage *target = [_pdfView.document pageAtIndex:page - 1];
    PDFDestination *destination = [[PDFDestination alloc] initWithPage:target atPoint:CGPointMake(pdfX, pdfY)];
    [_pdfView goToDestination:destination];
}

- (void)setNativePage:(NSInteger)page
{`,'iOS search command');
manager=replace(manager,'    public void setNativePage(PdfView view, int page) {\n        view.setPage(page);\n    }', '    public void setNativePage(PdfView view, int page) {\n        view.setPage(page);\n        view.applyPendingUpdates();\n    }','Fabric page command');
const oldPost='pdfView.post(pdfView::drawPdf);',newPost='pdfView.post(pdfView::applyPendingUpdates);';
manager=manager.split(oldPost).join(newPost);
if((manager.match(/pdfView\.post\(pdfView::applyPendingUpdates\)/g)||[]).length!==2)throw Error('Cannot apply PDF patch: Fabric updates');
fs.writeFileSync(viewPath,view);fs.writeFileSync(managerPath,manager);fs.writeFileSync(fabricPath,fabric);fs.writeFileSync(indexPath,index);fs.writeFileSync(iosPath,ios);console.log('Applied Android PDF viewer update patch');
