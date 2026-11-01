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
  if(!source.includes('// HindPDF editor intent routing')){
   const start='class MainActivity : ReactActivity() {';
   if(!source.includes(start)||!source.includes('super.onCreate(null)'))throw new Error('Could not install PDF editor intent routing.');
   source=source.replace(start,`${start}
  // HindPDF editor intent routing
  private fun preparePdfIntent(incoming: android.content.Intent?) {
    if (incoming?.component?.className?.endsWith(".PdfEditorActivity") == true && incoming.data != null) {
      val original = incoming.data.toString()
      incoming.data = android.net.Uri.parse("hindpdf://edit-pdf?uri=" + android.net.Uri.encode(original))
      incoming.action = android.content.Intent.ACTION_VIEW
    }
  }

  override fun onNewIntent(intent: android.content.Intent) {
    preparePdfIntent(intent)
    setIntent(intent)
    super.onNewIntent(intent)
  }
`);
   source=source.replace('super.onCreate(null)','preparePdfIntent(intent)\n    super.onCreate(null)');
  }
  mod.modResults.contents=source;return mod;
 });
};
