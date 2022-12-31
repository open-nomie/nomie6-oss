import isObject from 'lodash/isObject'

//@ts-ignore
const base: any = isObject(import.meta.env) ? import.meta.env : { env: {} }

export const Env = {
  apiKey: `${base.VITE_APP_APIKEY}`,
  authDomain: `${base.VITE_APP_AUTHDOMAIN}`,
  projectId: `${base.VITE_APP_PROJECTID}`,
  storageBucket: `${base.VITE_APP_STORAGEBUCKET}`,
  messagingSenderId: `${base.VITE_APP_MESSAGINGSENDERID}`,
  appId: `${base.VITE_APP_APPID}`,
  measurementId: `${base.VITE_APP_MEASUREMENTID}`,
}
