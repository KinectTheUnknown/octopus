//For testing converter https://convert.zamicol.com/
/**
 * Module for converting numbers to and from any base
 * @module utils/baseConv
 */
/**
 * The characters ordered by numerical value
 * @const {string}
 */
const fullStr = "0123456789"
  + "abcdefghijklmnopqrstuvwxyz"
  + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  + "+-~*_.,!?/\\|#$%^&:;@()[]{}\"'`"
  
/**
 * A string representation of a number in any base
 * @typedef {string} BasedNumber
 */
module.exports = (from, to) => {
  if (Math.max(from, to) > fullStr.length)
    throw new RangeError("Base is too large")
  
  let eFac, dFac
  if (from < to) {
    eFac = convBase(to, `${from}`)
    dFac = `${to}`
  } else if (from > to) {
    eFac = `${from}`
    dFac = convBase(from, `${to}`)
  } else
    throw new Error("Bases can't be the same")
  return {
    /**
     * Encode a number
     * @param {BasedNumber} num - The number to encode
     * @returns {BasedNumber} The encoded number
     */
    encode(num) {
      let res = convBase(to, num[0])
      for (let i = 0; ++i < num.length;) {
        res = add(
          to,
          multiply(to, res, eFac),
          num[i]
        )
      }
      
      return res
    },
    /**
     * Decode a number
     * @param {BasedNumber} num - The number to decode
     * @returns {BasedNumber} The decoded number
     */
    decode(num) {
      let res = convBase(from, num[0])
      for (let i = 0; ++i < num.length;) {
        res = add(
          from,
          multiply(from, res, dFac),
          num[i]
        )
      }
      
      return res
    }
  }
}
/**
 * Add to numbers of the same base
 * @param {string} base - The base to read the numbers as
 * @param {BasedNumber} a - The first factor to multiply
 * @param {BasedNumber} b - The second factor to multiply
 * @returns {BasedNumber} The product of a and b
 */
function multiply(base, a, b) {
  let sums = []
  for (let i = a.length; i--;) {
    let sub = "0".repeat(a.length - i - 1)
    let carry = 0
    for (let j = b.length; j--;) {
      let sum = fullStr.indexOf(a[i])
        * fullStr.indexOf(b[j])
        + carry
      sub = fullStr[sum % base] + sub
      carry = Math.floor(sum / base)
    }
    if (carry)
      sub = convBase(base, `${carry}`) + sub
    
    sums.push(sub)
  }
  
  return add(base, ...sums)
}
/**
 * Add to numbers of the same base
 * @param {string} base - The base to read the numbers as
 * @param {...BasedNumber} args - The numbers to add
 * @returns {BasedNumber} The sum of all numbers
 */
function add(base, ...args) {
  if (args.length < 2)
    return convBase(base, args[0], base)
  
  let res = ""
  let carry = 0
  let maxLen = args.reduce((a, b) => Math.max(b.length, a), 0)
  for (let i = 0; i++ < maxLen;) {
    let sum = carry
    for (let n of args) {
      if (n.length >= i)
        sum += fullStr.indexOf(n[n.length - i])
    }
    res = fullStr[sum % base] + res
    carry = Math.floor(sum / base)
  }
  while (carry) {
    res = fullStr[carry % base] + res
    carry = Math.floor(carry / base)
  }
  
  return res
}
//Only for small numbers
/**
 * Convert a safe number to another base
 * @param {number} tBase - The base of the returned number
 * @param {BasedNumber} num - The number to convert
 * @param {number} [fBase = 10] - The base to read the number as
 * @returns {BasedNumber} The resulting number
 */
function convBase(tBase, num, fBase = 10) {
  let val = fullStr.indexOf(num[0])
  for (let i = 0; ++i < num.length;)
    val = val * fBase + fullStr.indexOf(num[i])
    
  let res = ""
  while (val) {
    res = fullStr[val % tBase] + res
    val = Math.floor(val / tBase)
  }
  
  return res
}