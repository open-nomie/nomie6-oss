export const uid = ():string => {
  return `${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2).substring(0,6)}`
}