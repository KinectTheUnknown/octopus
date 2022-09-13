const client = require("../client")
const Handler = require("../handler")

class EventsHandler extends Handler {
  constructor() {
    super(__dirname)
  }
  load(file) {
    let req = super.load(file)
    if (typeof req.run !== "function")
      throw new TypeError("Missing run function")
    
    req._run = async (...a) => {
      try {
        await req.run(...a)
      } catch (e) {
        console.error(e)
      }
    }
    client[req.once ? "once" : "on"](
      EventsHandler.resolveName(file),
      req._run
    )

    return req
  }
  unload(file) {
    let req = super.unload(file)
    client.off(EventsHandler.resolveName(file), req._run)

    return req
  }
}
module.exports = new EventsHandler()