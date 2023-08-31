import { open } from "@tauri-apps/api/dialog";
import { appDataDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api";


export const folderSelector = async () => {
  const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await appDataDir()
    })
    return selected;
}

export function* folderIterator(func: any, folderlist: string[]) {
  let i = 0;
  while (folderlist.length !== 0) {
    let item = folderlist.pop();
    if (typeof item !== undefined){
      let compound = item.split('/').at(-1);
      yield [item, compound];
      i+=1;
      func(i);
    }
  }
  // return;
}




export const handleCuration = async (sourcePath: string,
			       polarity: string,
			       compoundId: string) => {
  return await invoke('evaluate_directory',
		{'path': sourcePath,
		 'mode': polarity,
		 'compoundId': compoundId})
    .then((_data) =>{ return ['OK', _data] })
		   .catch((error) => {return ['Error',  error]});
}

export const handleCopy = async (sourcePath:string,
				 destPath:string,
				 compoundId:string) => {
  return await invoke('copy_files_command',
		      {'sourcePath':sourcePath,
		       'destPath': destPath,
		       'compoundId':compoundId}).then(
			 (data) => {return ['OK', data]}
		       ).catch((error) => {return ['Error', error]})
}
