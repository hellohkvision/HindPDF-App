export type CropSettings={zoom:number;x:number;y:number};
export function imageCrop(iw:number,ih:number,ow:number,oh:number,settings?:CropSettings):{x:number;y:number;width:number;height:number};
export function outputSize(iw:number,ih:number,width:number|'',height:number|''):{width:number;height:number};
