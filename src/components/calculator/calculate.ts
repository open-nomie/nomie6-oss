//Originally from https://github.com/tusnolobov/svelte-calculator/blob/master/src/helpers.js
export function calculate(input: string | Array<any> = []) {
  if (typeof input === 'string') {
    input = input.split("");
  }

  const result = input.reduce((acc, val, idx, arr) => {
    const nextNumber = Number(arr[idx + 1]);

    if (isNaN(nextNumber)) return acc;

    switch (val) {
      case "+":
        return acc + nextNumber;
      case "−":
        return acc - nextNumber;
      case "×":
        return acc * nextNumber;
      case "÷":
        return acc / nextNumber;
    }

    return acc;
  }, Number(input[0]));

  return result;
}

// export function calculatorKey(value: any, input: Array<any>, result: any): Array<any> {
//   const lastIndex = input.length - 1;
//   const lastInputValue = input[lastIndex];
//   const isLastInputNumber = !isNaN(input[lastIndex]);
//   const isValueNumber = !isNaN(value);
//   let finalResult = 0;

//   if (value === "CE") {
//     input = [];
//     finalResult = 0;
//   } else if (value === "C") {
//     input = [...input.slice(0, -2)];
//   } else if (value === "←") {
//     const updatedLastInputValue = lastInputValue.slice(0, -1);
//     input = lastInputValue.length === 1 ? [...input.slice(0, -1)] : [...input.slice(0, -1), updatedLastInputValue];
//   } else if (value === "±") {
//     let updatedLastInputValue;
//     if (!isNaN(lastInputValue) && lastInputValue > 0) {
//       updatedLastInputValue = -lastInputValue;
//       input = [...input.slice(0, -1), updatedLastInputValue];
//     } else if (!isNaN(lastInputValue) && lastInputValue < 0) {
//       updatedLastInputValue = Math.abs(lastInputValue);
//       input = [...input.slice(0, -1), updatedLastInputValue];
//     }
//   } else if (value === ".") {
//     if (isLastInputNumber) {
//       let updatedLastInputValue = `${lastInputValue}.`;
//       input = [...input.slice(0, -1), updatedLastInputValue];
//     }
//   } else if (value === "=") {
//     input = [`${result}`];
//   } else if (isValueNumber && isLastInputNumber) {
//     input = [...input.slice(0, -1), `${lastInputValue}${value}`];
//   } else if (!isValueNumber && !isLastInputNumber) {
//     input = [...input.slice(0, -1), value];
//   } else {
//     input = [...input, value];
//   }
//   return input;
// }
