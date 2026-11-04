const {PDFDocument, PDFTextField, StandardFonts, PDFName, PDFDict}=require('pdf-lib');

function assertNotXfa(doc){
 const ref=doc.catalog.get(PDFName.of('AcroForm'));
 if(ref){const form=doc.context.lookup(ref);if(form instanceof PDFDict&&form.has(PDFName.of('XFA')))throw Error('Please use another editor for XFA forms.');}
}

// AcroForm text fields are genuine editable PDF objects. Ordinary page text is
// not a field and must not be covered up and represented as edited content.
async function listPdfTextFields(bytes){
 const doc=await PDFDocument.load(bytes);assertNotXfa(doc);const pages=doc.getPages();
 return doc.getForm().getFields().filter(field=>field instanceof PDFTextField).map(field=>({
  name:field.getName(),value:field.isPassword()?'':(field.getText()||''),readOnly:field.isReadOnly(),
  maxLength:field.getMaxLength()??null,password:field.isPassword(),
  pages:[...new Set(field.acroField.getWidgets().map(widget=>{
   const pageRef=widget.P();if(!pageRef)return null;
   const index=pages.findIndex(page=>String(page.ref)===String(pageRef));return index<0?null:index+1;
  }).filter(page=>page!==null))]
 }));
}
async function updatePdfTextField(bytes,name,value){
 const doc=await PDFDocument.load(bytes);assertNotXfa(doc);const form=doc.getForm(),field=form.getTextField(name);
 if(field.isReadOnly())throw Error('Please choose an editable PDF field; this field is read-only.');
 if(field.isPassword())throw Error('Please use another editor for password fields.');
 const max=field.getMaxLength();if(max!==undefined&&value.length>max)throw Error(`Please enter at most ${max} characters for this field.`);
 const font=await doc.embedFont(StandardFonts.Helvetica);
 try{font.encodeText(value.replace(/[\r\n]/g,''));}catch{throw Error('Please use Latin text for this PDF field.');}
 field.setText(value);field.updateAppearances(font);
 return doc.save({updateFieldAppearances:false});
}
module.exports={listPdfTextFields,updatePdfTextField};
