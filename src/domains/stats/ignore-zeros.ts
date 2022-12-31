export default function (dataset: Array<number>): Array<number> {
  let lastKnownValue = 0;
  return dataset.map((value, index) => {
    if (value !== 0) {
      lastKnownValue = value;
    } else if (value === 0 && index > 0) {
      value = lastKnownValue;
    }
    return value;
  });
}
