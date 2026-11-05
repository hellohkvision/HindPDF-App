const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'../node_modules/expo-camera');if(!fs.existsSync(root))process.exit(0);
const version=require(path.join(root,'package.json')).version;if(!version.startsWith('17.0.'))throw Error('Review live edge integration for expo-camera '+version);
const dir=path.join(root,'android/src/main/java/expo/modules/camera'),modulePath=path.join(dir,'CameraViewModule.kt'),viewPath=path.join(dir,'ExpoCameraView.kt');
let moduleText=fs.readFileSync(modulePath,'utf8'),view=fs.readFileSync(viewPath,'utf8');
function patch(text,oldValue,newValue,label){if(text.includes(newValue))return text;if(!text.includes(oldValue))throw Error('Live edge patch failed: '+label);return text.replace(oldValue,newValue);}
moduleText=patch(moduleText,'  "onCameraReady",','  "onCameraReady",\n  "onDocumentEdges",','event');
moduleText=patch(moduleText,'      Prop("barcodeScannerEnabled") { view, enabled: Boolean? ->','      Prop("liveEdgeDetection") { view, enabled: Boolean? ->\n        view.setLiveEdgeDetection(enabled == true)\n      }\n\n      Prop("barcodeScannerEnabled") { view, enabled: Boolean? ->','prop');
view=patch(view,'  private val onCameraReady by EventDispatcher<Unit>()','  private val onDocumentEdges by EventDispatcher<Map<String, Any>>()\n  @Volatile private var liveEdgeDetection = false\n  companion object { private val edgeExecutor = java.util.concurrent.Executors.newSingleThreadExecutor() }\n  private var lastEdgeFrame = 0L\n  private val onCameraReady by EventDispatcher<Unit>()','state');
view=patch(view,'  fun setShouldScanBarcodes(shouldScanBarcodes: Boolean) {','  fun setLiveEdgeDetection(enabled: Boolean) {\n    if (liveEdgeDetection != enabled) { liveEdgeDetection = enabled; shouldCreateCamera = true }\n  }\n\n  fun setShouldScanBarcodes(shouldScanBarcodes: Boolean) {','setter');
view=patch(view,`  private fun createImageAnalyzer(): ImageAnalysis =
    ImageAnalysis.Builder()
      .setResolutionSelector(
        ResolutionSelector.Builder()
          .setResolutionStrategy(ResolutionStrategy.HIGHEST_AVAILABLE_STRATEGY)`,`  private fun createImageAnalyzer(): ImageAnalysis =
    ImageAnalysis.Builder()
      .setResolutionSelector(
        ResolutionSelector.Builder()
          .setResolutionStrategy(if (liveEdgeDetection) ResolutionStrategy(Size(1280, 720), ResolutionStrategy.FALLBACK_RULE_CLOSEST_LOWER_THEN_HIGHER) else ResolutionStrategy.HIGHEST_AVAILABLE_STRATEGY)`,'analysis resolution');
const needle='        if (shouldScanBarcodes && CameraUtils.isMLKitBarcodeScannerAvailable()) {';
const replacement=`        if (liveEdgeDetection) {
          analyzer.setAnalyzer(edgeExecutor) { frame ->
            try {
              val now = android.os.SystemClock.elapsedRealtime()
              if (now - lastEdgeFrame >= 220) {
                lastEdgeFrame = now
                val plane = frame.planes.firstOrNull()
                val bounds = if (plane == null) null else com.hindpdf.liveedges.LiveEdgeDetector.detect(plane.buffer.slice(), frame.width, frame.height, plane.rowStride, plane.pixelStride, frame.imageInfo.rotationDegrees)
                val rotation = frame.imageInfo.rotationDegrees
                val rw = if (rotation == 90 || rotation == 270) frame.height else frame.width
                val rh = if (rotation == 90 || rotation == 270) frame.width else frame.height
                post {
                  if (liveEdgeDetection && isAttachedToWindow) {
                    val data = if (bounds == null) mapOf<String, Any>("found" to false) else mapOf<String, Any>("found" to true, "left" to bounds[0].toDouble(), "top" to bounds[1].toDouble(), "right" to bounds[2].toDouble(), "bottom" to bounds[3].toDouble(), "frameWidth" to rw, "frameHeight" to rh, "mirrored" to (lensFacing == CameraType.FRONT))
                    onDocumentEdges(data)
                  }
                }
              }
            } catch (e: Exception) { Log.w(CameraViewModule.TAG, "Document edge detection failed", e); post { if (liveEdgeDetection && isAttachedToWindow) onDocumentEdges(mapOf<String, Any>("found" to false)) } } finally { frame.close() }
          }
        } else if (shouldScanBarcodes && CameraUtils.isMLKitBarcodeScannerAvailable()) {`;
view=patch(view,needle,replacement,'analyzer');
fs.writeFileSync(modulePath,moduleText);fs.writeFileSync(viewPath,view);
const target=path.join(root,'android/src/main/java/com/hindpdf/liveedges');fs.mkdirSync(target,{recursive:true});fs.copyFileSync(path.join(__dirname,'../plugins/native/liveedges/LiveEdgeDetector.java'),path.join(target,'LiveEdgeDetector.java'));
console.log('Android live edge camera integration installed');
