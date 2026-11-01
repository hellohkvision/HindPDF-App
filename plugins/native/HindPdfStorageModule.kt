package com.hindpdf.app

import android.net.Uri
import android.content.ClipData
import android.content.ComponentName
import android.content.Intent
import android.os.Build
import android.provider.DocumentsContract
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream

class HindPdfStorageModule(private val appContext: ReactApplicationContext) : ReactContextBaseJavaModule(appContext) {
  override fun getName() = "HindPdfStorage"

  @ReactMethod
  fun openPdfWith(source: String, promise: Promise) {
    try {
      val parsed = Uri.parse(source)
      val uri = if (parsed.scheme == "file") FileProvider.getUriForFile(appContext, appContext.packageName + ".provider", File(requireNotNull(parsed.path))) else parsed
      require(uri.scheme == "content")
      val view = Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/pdf")
        .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      view.clipData = ClipData.newRawUri("PDF", uri)
      val chooser = Intent.createChooser(view, "Open PDF with")
      chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        val pkg = appContext.packageName
        chooser.putExtra(Intent.EXTRA_EXCLUDE_COMPONENTS, arrayOf(ComponentName(pkg, "$pkg.PdfViewerActivity"), ComponentName(pkg, "$pkg.PdfEditorActivity"), ComponentName(pkg, "$pkg.MainActivity")))
      }
      val activity = currentActivity
      if (activity != null) activity.startActivity(chooser) else { chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); appContext.startActivity(chooser) }
      promise.resolve(null)
    } catch (error: Exception) { promise.reject("HINDPDF_OPEN_WITH_FAILED", "Could not open the PDF in another app.", error) }
  }

  private fun documentUri(tree: Uri): Uri = if (DocumentsContract.isDocumentUri(appContext, tree)) tree else
    DocumentsContract.buildDocumentUriUsingTree(tree, DocumentsContract.getTreeDocumentId(tree))

  private fun childDirectory(parent: Uri, name: String): Uri {
    val resolver = appContext.contentResolver
    val children = DocumentsContract.buildChildDocumentsUriUsingTree(parent, DocumentsContract.getDocumentId(parent))
    resolver.query(children, arrayOf(DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME, DocumentsContract.Document.COLUMN_MIME_TYPE), null, null, null)?.use { cursor ->
      while (cursor.moveToNext()) {
        if (cursor.getString(1) == name && cursor.getString(2) == DocumentsContract.Document.MIME_TYPE_DIR) {
          return DocumentsContract.buildDocumentUriUsingTree(parent, cursor.getString(0))
        }
      }
    } ?: throw IllegalStateException("Cannot read selected folder")
    return DocumentsContract.createDocument(resolver, parent, DocumentsContract.Document.MIME_TYPE_DIR, name)
      ?: throw IllegalStateException("Cannot create folder")
  }

  @ReactMethod
  fun exportFile(root: String, source: String, name: String, mime: String, kind: String, promise: Promise) {
    Thread {
      var destination: Uri? = null
      try {
        require(kind == "Photos" || kind == "Documents")
        val resolver = appContext.contentResolver
        val rootDoc = documentUri(Uri.parse(root))
        val rootName = resolver.query(rootDoc, arrayOf(DocumentsContract.Document.COLUMN_DISPLAY_NAME), null, null, null)?.use { if (it.moveToFirst()) it.getString(0) else null }
        val appFolder = if (rootName == "HindPDF") rootDoc else childDirectory(rootDoc, "HindPDF")
        val target = childDirectory(appFolder, kind)
        val safeName = name.replace('/', '_').replace('\u0000', '_').ifBlank { "HindPDF" }
        val created = DocumentsContract.createDocument(resolver, target, mime, safeName) ?: throw IllegalStateException("Cannot create file")
        destination = created
        val sourceUri = Uri.parse(source)
        val input = if (sourceUri.scheme == "file") FileInputStream(File(requireNotNull(sourceUri.path))) else resolver.openInputStream(sourceUri) ?: throw IllegalStateException("Cannot read file")
        input.use { src -> (resolver.openOutputStream(created, "w") ?: throw IllegalStateException("Cannot write file")).use { dst -> src.copyTo(dst) } }
        promise.resolve("HindPDF/$kind")
      } catch (error: Exception) {
        destination?.let { try { DocumentsContract.deleteDocument(appContext.contentResolver, it) } catch (_: Exception) { } }
        promise.reject("HINDPDF_EXPORT_FAILED", "Could not save to this location.", error)
      }
    }.start()
  }
}
