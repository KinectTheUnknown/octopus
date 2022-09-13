const LHandler = require("../handler/light.js")
const Coll = require("../utils/coll.js")
module.exports = class Handler extends LHandler(Coll) {
  load(file) {
    //eslint-disable-next-line global-require
    const res = super.load(file)
    
    super.set(Handler.resolveName(file), res)

    return res
  }
  unload(file) {
    let req = super.unload(file)
    super.delete(Handler.resolveName(file))
    
    return req
  }
}