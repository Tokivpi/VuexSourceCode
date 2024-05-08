export function forEachValue(obj, cb) {
  Object.keys(obj).forEach((key) => {
    // 提供数据
    cb(key, obj[key]);
  });
}
