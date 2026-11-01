import type {OutputFile} from '../types';
export function folderName(output:OutputFile):'Photos'|'Documents';
export function hasSavedFolder(storage:{getItem:(key:string)=>Promise<string|null>}):Promise<boolean>;
export function createFolderSaver(storage:{getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>},chooseRoot:()=>Promise<string|null>,exportFile:(root:string,file:OutputFile,kind:string)=>Promise<string>):(output:OutputFile,chooseNew?:boolean)=>Promise<{saved:boolean;relativePath?:string;folderRemembered?:false}>;
