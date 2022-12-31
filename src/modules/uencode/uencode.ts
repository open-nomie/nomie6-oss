

export const toBlob = (obj:any):Blob => {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  const blob = new Blob([bytes], {
      type: "application/json;charset=utf-8"
  });
  return blob;
}

export const fromBlob = async (blob:Blob):Promise<any> => {
  const content = await blob.text();
  return JSON.parse(content);
}