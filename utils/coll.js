module.exports = class Coll extends Map {
  filter(fn) {
    return new Coll(
      this.filterAndMap(fn, (val, key) => [key, val])
    )
  }
  filterAndMap(fFn, mFn) {
    let res = []
    for (let [key, val] of this) {
      if (fFn(val, key, this))
        res.push(mFn(val, key, this))
    }

    return res
  }
  find(fn) {
    for (let [key, val] of this) {
      if (fn(val, key, this))
        return val
    }
  }
  findKey(fn) {
    for (let [key, val] of this) {
      if (fn(val, key, this))
        return key
    }
  }
  map(fn) {
    let res = []
    for (let [key, val] of this)
      res.push(fn(val, key, this))
    
    return res
  }
  some(fn) {
    for (let [key, val] of this) {
      if (fn(val, key, this))
        return true
    }
  }
}