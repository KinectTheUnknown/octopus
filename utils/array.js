const ArrUtil = {
  dualColumn(arr, spacing, concat = true, separator = " ") {
    if (!Array.isArray(arr))
      throw new TypeError("Array must be an array")

    if (spacing < 1)
      throw new RangeError("Spacing must be greater than 1")

    if (!spacing)
      throw new TypeError("Spacing must be a valid type")

    concat && (arr = arr.concat())
    let res = []
    while (arr[0]) {
      let [a, b = ""] = arr.splice(0, 2)
      res.push(a.padEnd(spacing, separator) + b)
    }

    return res
  },
  fill(arr, fn, start = 0, end = arr.length - 1) {
    if (!Array.isArray(arr))
      throw new TypeError("Array must be an array")

    if (typeof fn !== "function")
      throw new TypeError("fn must be a functiom")

    if (typeof start !== "number" || isNaN(start))
      throw new TypeError("Start value must be a valid number")

    if (typeof end !== "number" || isNaN(end))
      throw new TypeError("End value must be a valid number")

    if (start < 0)
      throw new RangeError("Start value must be greater than or equal to 0")

    if (start >= arr.length)
      throw new RangeError("Start value must be less than the array's length")

    if (start > end)
      throw new RangeError("End value must be greater than the start value")

    if (end < 1)
      throw new RangeError("End value must be greater than or equal to 1")

    end = Math.min(end, arr.length - 1)
    while (end >= start) {
      arr[end--] = fn(end, arr)
    }

    return arr
  },
  filter(arr, fn, concat = false) {
    if (!Array.isArray(arr))
      throw new TypeError("Array must be an array")

    if (typeof fn !== "function")
      throw new TypeError("Map parameter must be a function")

    concat && (arr = arr.concat())
    for (let i = arr.length; i--;) {
      !fn(arr[i], i, arr) && arr.splice(i, 1)
    }

    return arr
  },
  filterAndMap(arr, fFn, mFn) {
    if (!Array.isArray(arr))
      throw new TypeError("Array parameter must be an array")

    if (typeof fFn !== "function")
      throw new TypeError("Filter parameter must be a function")

    if (typeof mFn !== "function")
      throw new TypeError("Map parameter must be a function")
    
    for (let i = arr.length; i--;) {
      fFn(arr[i], i, arr) ?
        arr[i] = mFn(arr[i], i, arr)
        :
        arr.splice(i, 1)
      
    }

    return arr
  },
  filterAndShuffle(arr, fFn, concat = false) {
    if (!Array.isArray(arr))
      throw new TypeError("Array must be an array")

    concat && (arr = arr.concat())
    for (let i = arr.length; i--;) {
      if (!fFn(arr[i], i, arr)) {
        arr.splice(i, 1)
        continue
      }
      ArrUtil.swap(arr, i, ~~(Math.random() * (i + 1)))
      fFn(arr[i], i, arr) || arr.splice(i, 1)
    }

    return arr
  },
  randItems(array, num = 1) {
    if (!Array.isArray(array))
      throw new TypeError("Array must be an array")

    if (num < 0)
      throw new RangeError("Values ust be greater than 0")

    if (!num)
      return []

    let arr = array.concat()
    for (let i = arr.length; i > num + 1;)
      ArrUtil.swap(arr, i, ~~(Math.random() * i--))
    
    return arr.slice(-num)
  },
  rotate(arr, rev = false, concat = false) {
    if (!Array.isArray(arr))
      throw new TypeError("Array must be an array")

    if (concat === true)
      arr = arr.concat()

    if (rev === false)
      arr.unshift(arr.pop())
    else
      arr.push(arr.shift())

    return arr
  },
  map(arr, fn, concat = false) {
    if (!Array.isArray(arr))
      throw new TypeError("Array must be an array")

    if (typeof fn !== "function")
      throw new TypeError("Map parameter must be a function")

    concat && (arr = arr.concat())
    for (let i = arr.length; i--;)
      arr[i] = fn(arr[i], i, arr)
    
    return arr
  },
  shuffle(arr) {
    if (!Array.isArray(arr))
      throw new TypeError("Array must be an array")

    for (let i = arr.length; i > 0;/*i decrements in loop*/) {
      let r = ~~(Math.random() * i--)
      ArrUtil.swap(arr, i, r)
    }

    return arr
  },
  swap(arr, a, b) {
    [arr[a], arr[b]] = [arr[b], arr[a]]

    return arr
  }
}
module.exports = ArrUtil