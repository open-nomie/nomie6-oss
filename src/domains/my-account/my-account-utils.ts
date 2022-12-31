import { centsToDollars } from "../../utils/math/math"

export const cancelMyNomieCloud = () => {}


export const toPrice = (amount:number, interval:string):string=>{
  return `$${centsToDollars(amount).toFixed(2)} per ${interval}`
}