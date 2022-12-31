/**
 * PromiseStep
 * Like promise.all, but one at a time.
 *
 * PromiseStep([1,2,3], (row)=>{
 *     return Promise.resolve(row)
 * }, (status)=>{
 *     alert("Status", status)
 * }).then((finished)=>{
 *    alert("All Done", finished);
 * })
 *
 */

export default async (rows: Array<any>, promiseFunction: Function, onChange?: Function): Promise<Array<any>> => {
  onChange = onChange || function () {}; // a status callback
  let final = [];
  for (const row of rows) {
    try {
      let res = await promiseFunction(row);
      onChange({ row, res });
      final.push(res);
    } catch (e) {
      final.push({ error: e.message });
    }
  }
  return final;
};
