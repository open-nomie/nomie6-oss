/**
 * Is Truthy
 * Checks if it's a true "thing" - INCLUDING 0
 * @param o any
 */
export function isTruthy(o?: any) {
  if (o === false) {
    return false;
  } else if (o === undefined || o === null) {
    return false;
  } else {
    return true;
  }
}
