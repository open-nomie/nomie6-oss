// import Cryptr from "cryptr";
import * as CryptoJS from "crypto-js";

export const encrypt = (str:string, key:string)=>{
  const encryptedStr = CryptoJS.AES.encrypt(str, key).toString();
  return encodeURIComponent(encryptedStr);
}

export const decrypt = (str:string, key:string)=>{
  const bytes = CryptoJS.AES.decrypt(decodeURIComponent(str), key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export const encryptObject = (obj, key: string):string=>{
  const str = JSON.stringify(obj);
  return encrypt(str, key);
}

export const decryptObject = (str, key:string):any => {
  
  const raw = decrypt(str, key);
  
  return JSON.parse(raw);
}