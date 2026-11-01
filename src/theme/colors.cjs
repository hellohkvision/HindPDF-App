const bg={
 white:'#171e29','#fff':'#171e29','#ffffff':'#10151d',
 '#fffffff0':'#171e29f2','#ccd7e2':'#526274','#f4f6f8':'#202a38','#f4f8fb':'#202b38','#f6f8fa':'#1d2633','#eaf0f5':'#243040','#eaf3fa':'#223144','#dfedf8':'#304358','#e4eff8':'#283a4f','#e7e9ec':'#161d27','#e5e5e5':'#161d27','#dce9f3':'#26384a','#e3edf5':'#273749',
 '#fff0f2':'#422431','#fff0f1':'#422431','#fff0f4':'#422431','#fff1f4':'#422431','#fff0ed':'#422721','#fff5f0':'#422721','#edf4ff':'#203350','#e9f2ff':'#203350','#e7f6ef':'#1e3c33','#f1eafd':'#312746','#fff0e4':'#422d22','#e5f7f8':'#1c3a3c',
};
const fg={
 '#0b1220':'#edf3fa','#60708a':'#aab9cb','#164f79':'#92c8f2','#506b88':'#aec2d8','#8795a4':'#a6b5c5','#a82c22':'#ffada4','#8d382c':'#ffada4','#14263b':'#edf3fa',
 '#e91d48':'#ff8092','#db3440':'#ff8290','#2868b6':'#91bfff','#168261':'#72d4b0','#7950bc':'#c0a2ef','#c65a1b':'#ffb27f','#087f8c':'#7fd3da','#4285f4':'#91bfff','#0061ff':'#91bfff',
};
const border={'#dfe6ef':'#354252','#e8edf2':'#354252','#edf1f5':'#354252','#e4eef6':'#354252','#c6d0db':'#4b5d70','#cbd5e1':'#4b5d70'};
function themedColor(value,kind,dark){if(!dark||typeof value!=='string')return value;const key=value.toLowerCase();return (kind==='background'?bg:kind==='border'?border:fg)[key]||value;}
function themedStyle(style,dark){if(!dark||!style)return style;const next={...style};for(const key of ['backgroundColor','borderColor','borderTopColor','borderBottomColor','borderLeftColor','borderRightColor','color','textDecorationColor'])if(typeof next[key]==='string')next[key]=themedColor(next[key],key==='backgroundColor'?'background':key.startsWith('border')?'border':'foreground',true);return next;}
module.exports={themedColor,themedStyle};
