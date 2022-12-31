/**
 * From Jon New's Article
 * https://blog.jonnew.com/posts/poo-dot-length-equals-two
 * Yes he said we shouldn't use it. But honestly, it's the best
 * for what we need. Just to identify  if we have multiple emojis
 * in the avatar, so the other Regex solutions are WAY overkill.
 * @param str
 */
export default function emojiCount(str: string): number {
  const joiner = "\u{200D}";
  const split = str.replace(/[a-zA-Z0-9]+/g, "").split(joiner);
  let count = 0;

  for (const s of split) {
    const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join("")).length;
    count += num;
  }

  return count / split.length;
}
