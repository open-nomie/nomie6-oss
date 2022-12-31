import { md5 } from '../nid/nid'

export const objectHash = (obj: unknown = {}): string => {
  return md5(JSON.stringify(obj))
}
