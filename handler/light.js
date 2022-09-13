const fs = require("fs").promises
const path = require("path")
const nameReg = /([A-Za-z]+)(\/index)?\.js$/
module.exports = (o = Object) => class LightHandler extends o {
  constructor(dir, ...a) {
    super(...a)
    this.dir = dir
  }
  async init() {
    let files = await fs.readdir(this.dir)
    for await (let f of files) {
      let ext = path.extname(f)
      if ((!ext || ext === ".js") && f !== "index.js") {
        console.log("Loading " + f)
        this.load(f)
      }
    }
  }
  load(file) {
    //eslint-disable-next-line global-require
    return require(path.join(this.dir, file))
  }
  reload(file) {
    this.unload(file)

    return this.load(file)
  }
  unload(file) {
    let p = require.resolve(path.join(this.dir, file))
    if (!p)
      throw new Error("Unable to resolve path")

    let req = uncache(require.cache[p])
    
    return req
  }
  static resolveName(file) {
    let m = file.match(nameReg)

    return m ? m[1] : null
  }
}
function uncache(req, excl = new Set) {
  excl.add(req.id)
  for (let child of req.children) {
    if (!excl.has(child.id) && path.extname(child.filename) !== ".node")
      uncache(child, excl)
  }
  for (let key in module.constructor._cachePath) {
    if (key.includes(req.id))
      delete module.constructor._cachePath[key]
  }
  delete require.cache[req.id]
  
  return req
}