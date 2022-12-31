function isNumber(n) {
  return !isNaN(n) && n !== null && n !== undefined;
}

function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}

export default function (calcBuffer) {
  let answer = 0;
  let lastOperator = null;

  let _add = (num) => {
    answer = answer + num;
  };
  let _sub = (num) => {
    answer = answer - num;
  };
  let _multiply = (num) => {
    answer = answer * num;
  };
  let _divide = (num) => {
    answer = answer / num;
  };
  let _decimal = (num) => {
    if (!isFloat(answer)) {
      answer = parseFloat(`${answer}.${num}`);
    }
  };
  let map = {
    "*": _multiply,
    "-": _sub,
    "+": _add,
    "/": _divide,
    ".": _decimal,
  };
  calcBuffer.forEach((bit, index) => {
    if (isNumber(bit)) {
      if (index == 0) {
        answer = bit;
      } else {
        if (lastOperator) {
          lastOperator(bit);
        }
      }
    } else {
      if (map[bit]) {
        lastOperator = map[bit];
      }
    }
  });

  return calcBuffer.length ? answer : 0;
}
