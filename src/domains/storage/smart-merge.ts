

import mergeDeep from "deepmerge";
export const smartMerge = (v1:any, v2:any) => {
  if(v1 instanceof Array) {
    return mergeArray(v1, v2);
  } else {
    return mergeDeep(v1, v2)
  }
}

export const mergeArray = (v1:Array<any>,v2:Array<any>) => {
  const KEYS = ['_id','key','id'];
  let id = "id";
  if(v1.length || v2.length) {
  
    let baseItem = v1[0] || v2[0];
    KEYS.forEach((idType)=>{
      if(baseItem.hasOwnProperty(idType)) {
        id = idType;
      }
    })

    let map = {};
    let joined = [...v1, ...v2];
    joined.forEach((item, index)=>{
      let key = item[id];
      map[key] = map[key] || []
      map[key].push({item, index});
    })

    let sameMerged = Object.keys(map).map((id)=>{
      let objects:Array<any> = map[id];
      if(objects.length > 1) {
        let newItem = mergeDeep(objects[0].item,objects[1].item);
        return {
          item: newItem,
          index: objects[0].index
        }
      } else {
        return objects[0];
      }
    }).sort((a,b)=>{
      return a.index > b.index ? 1 : -1
    }).map((m)=>{
      return m.item;
    })

    return sameMerged;
  } else {
    return [];
  }
}