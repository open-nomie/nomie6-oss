const regex = {
  escape(str) {
    return str.replace(/[@.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  },
}

export const encodeRegex = regex.escape
export default regex
