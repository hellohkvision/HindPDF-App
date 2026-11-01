const {withAndroidManifest,withMainActivity,AndroidConfig}=require('@expo/config-plugins');

// Give Android's document chooser a descriptive activity name while keeping
// the launcher and application name as HindPDF.
module.exports=function withPdfViewerAlias(config){
 config=withAndroidManifest(config,mod=>{
  const app=AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
  const main=AndroidConfig.Manifest.getMainActivityOrThrow(mod.modResults);
  const name='.PdfViewerActivity';
  app['activity-alias']=(app['activity-alias']||[]).filter(item=>![name,'.PdfEditorActivity'].includes(item.$['android:name']));
  for(const entry of [{name,label:'HindPDF PDF Viewer',actions:['VIEW']},{name:'.PdfEditorActivity',label:'HindPDF PDF Editor',actions:['VIEW','EDIT']}])app['activity-alias'].push({
   $:{'android:name':entry.name,'android:targetActivity':main.$['android:name'],'android:exported':'true','android:label':entry.label},
   'intent-filter':[{action:entry.actions.map(action=>({$:{'android:name':`android.intent.action.${action}`}})),category:[{$:{'android:name':'android.intent.category.DEFAULT'}},{$:{'android:name':'android.intent.category.BROWSABLE'}}],data:[{$:{'android:scheme':'content','android:mimeType':'application/pdf'}},{$:{'android:scheme':'file','android:mimeType':'application/pdf'}}]}]
  });
  return mod;
 });
 return withMainActivity(config,mod=>{
  if(mod.modResults.language!=='kt')throw new Error('PDF editor intent routing requires Kotlin MainActivity.');
  let source=mod.modResults.contents;
  const start='class MainActivity : ReactActivity() {';
  const routing=`  // HindPDF editor intent routing
  private fun preparePdfIntent(incoming: android.content.Intent?) {
    val component = incoming?.component?.className ?: return
    val mode = when {
      component.endsWith(".PdfEditorActivity") -> "editor"
      component.endsWith(".PdfViewerActivity") -> "viewer"
      else -> return
    }
    val original = incoming.data ?: return
    if (original.scheme != "content" && original.scheme != "file") return
    var displayName: String? = null
    try {
      if (original.scheme == "content") contentResolver.query(original, arrayOf(android.provider.OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
        if (cursor.moveToFirst()) displayName = cursor.getString(0)
      }
      if (displayName.isNullOrBlank()) displayName = original.lastPathSegment
    } catch (_: Exception) { }
    incoming.data = android.net.Uri.Builder().scheme("hindpdf").authority("external-pdf")
      .appendQueryParameter("uri", original.toString()).appendQueryParameter("mode", mode)
      .appendQueryParameter("name", displayName ?: "Document.pdf").build()
    incoming.action = android.content.Intent.ACTION_VIEW
  }

  override fun onNewIntent(intent: android.content.Intent) {
    preparePdfIntent(intent)
    setIntent(intent)
    super.onNewIntent(intent)
  }
`;
  const pattern=/  \/\/ HindPDF editor intent routing[\s\S]*?(?=  override fun onCreate\()/;
  if(pattern.test(source))source=source.replace(pattern,routing+'\n');
  else {if(!source.includes(start)||!source.includes('super.onCreate(null)'))throw new Error('Could not install PDF editor intent routing.');source=source.replace(start,start+'\n'+routing);}
  if(!source.includes('preparePdfIntent(intent)\n    super.onCreate(null)'))source=source.replace('super.onCreate(null)','preparePdfIntent(intent)\n    super.onCreate(null)');
  mod.modResults.contents=source;return mod;
 });
};
