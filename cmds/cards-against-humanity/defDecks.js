const fetch = require("node-fetch").default
const {Collection} = require("discord.js")
const fs = require("fs").promises
const defDeckList = require("./defDecks.json")
const jsonCache = require("./defDecksCache.json")
const cache = new Collection(jsonCache)
const path = require("path")
const FormData = require("form-data")
module.exports = async (force = false) => {
  if (cache.size === defDeckList.length && !force)
    return cache.clone()

  //cache.delete
  let body = new FormData()
  body.append("type", "JSON")
  for (let deck of defDeckList)
    body.append("decks[]", deck)

  const res = await fetch("https://crhallberg.com/cah/output.php", {method: "POST", body})
    .then(r => r.json())

  for (let deck of defDeckList) {
    cache.set(deck, {
      name: res[deck].name,
      black: res.blackCards
        .slice(
          res[deck].black[0],
          res[deck].black.pop() + 1
        ),
      white: res.whiteCards
        .slice(
          res[deck].white[0],
          res[deck].white.pop() + 1
        )
    })
  }
  await fs.writeFile(
    path.join(__dirname, "./defDecksCache.json"),
    JSON.stringify([...cache], null, 2)
  )

  return cache.clone()
}