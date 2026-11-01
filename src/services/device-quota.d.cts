export function createDeviceQuota(storage:{getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>},clock?:()=>number):{reserve:(id:string)=>Promise<string>;complete:(id:string)=>Promise<void>;release:(id:string)=>Promise<void>};
export function indiaDay(now:number):string;
export const LIMIT:number;
