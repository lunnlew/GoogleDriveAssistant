function autoRetry (fn, maxTryTimes, errHandler) {
  return async function (...args) {
    let tryTimes = 0;
    async function inner () {
      try {
        tryTimes++;
        return await fn(...args);
      } catch (err) {
        if (errHandler && errHandler(err)) return inner();
        if (tryTimes === maxTryTimes) throw err;
        return inner();
      }
    }
    return inner();
  };
}
exports.default = autoRetry