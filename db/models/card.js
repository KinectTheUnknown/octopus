module.exports = (sql, types) => {
  const Card = sql.define("Card", {
    pos: {
      type: types.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    deckID: {
      type: types.UUID,
      allowNull: false,
      references: {
        model: "Deck"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    },
    type: {
      type: types.ENUM("black", "white"),
      allowNull: false
    },
    explicit: {
      type: types.BOOLEAN,
      allowNull: false
    },
    text: {
      type: types.STRING,
      allowNull: false
    }
  }, {
    indexes: [{
      fields: ["deckID", "pos", "createdAt"]
    }],
    /*hooks: {
      async beforeBulkCreate(cards, opt) {
        const Deck = sql.model("deck")
        let decks = {}
        for (let card of cards) {
          let deck = decks[card.deckID]
          if (deck)
            deck.unshift(card)
          else
            decks[card.deckID] = [card]
        }
        for (let id in decks) {
          let deck = decks[id]
          let d = await Deck.increment("size", {
            by: deck.length,
            where: {
              name: id
            },
            transaction: opt.transaction
          })
          for (let i = deck.length; i--;)
            deck[i].pos = d.size - i - 1
        }
      },
      async afterBulkDestroy(cards, opt) {
        const Deck = sql.model("deck")
        let decks = {}
        for (let card of cards) {
          if (!decks[card.deckID]--)
            decks[card.deckID] = -1
        }
        for (let id in decks) {
          await Deck.increment("size", {
            by: decks[id],
            where: {
              name: id
            },
            transaction: opt.transaction
          })
        }
      },
      afterDestroy(card, opt) {
        const Deck = sql.model("deck")
        
        return Deck.increment("size", {
          by: -1,
          where: {
            name: card.deckID
          },
          transaction: opt.transaction
        })
      },
      async beforeCreate(card, opt) {
        if (card.pos >= 0)
          return
        
        const Deck = sql.model("deck")
        let deck = await Deck.increment("size", {
          by: 1,
          where: {
            name: card.deckID
          },
          transaction: opt.transaction
        })
        card.pos = deck.size - 1
      }
    }*/
  })
  
  return Card
}