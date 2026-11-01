function useRenderedFonts(content,fontFaces){
 if(!content||!content.styles||!fontFaces)return content;
 const available=new Set();try{for(const face of fontFaces)if(face&&face.status==='loaded'&&typeof face.family==='string')available.add(face.family.replace(/^['"]|['"]$/g,''));}catch{return content;}
 const styles={};for(const [name,style] of Object.entries(content.styles))styles[name]=available.has(name)&&/^[a-zA-Z0-9_-]+$/.test(name)?{...style,fontFamily:`"${name}", ${style.fontFamily||'sans-serif'}`} :style;
 return {...content,styles};
}
module.exports={useRenderedFonts};
