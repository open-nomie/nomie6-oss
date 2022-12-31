const tick = (time: number, callback?: Function) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (callback) {
        callback();
      }
      resolve(true);
    }, time);
  });
};

export default tick;
export const wait = tick;