const API_KEY = '1afdf59eaee26da2dff1f9db5289e04658cdbe35039ff08cf058dc4b5ab7ff08'

// '1afdf59eaee26da2dff1f9db5289e04658cdbe35039ff08cf058dc4b5ab7ff08'
// dd53a0d2114d5a9576bfd98fd6ba2c44be4b2a55141dbe5ab091d0cc720037c3
const tickersHandlers = new Map()

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)

const AGGREGATE_INDEX = '5'

socket.addEventListener('message', e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data)
  if (type !== AGGREGATE_INDEX || newPrice === undefined) return
  

  const handlers = tickersHandlers.get(currency) ?? []
      handlers.forEach(fn => fn(newPrice))
})

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return
  }

  fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`)
.then(r => r.json())
.then(rawData => {
  const updatedPrices = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, value.USD])
    )

    Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
      const handlers = tickersHandlers.get(currency) ?? []
      handlers.forEach(fn => fn(newPrice))
    })
  }
  )
}

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message)
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }

  socket.addEventListener('open', () => {
    socket.send(stringifiedMessage)
  }, {once: true})  
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    "action": "SubAdd",
    "subs": [`5~CCCAGG~${ticker}~USD`]
  })
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    "action": "SubRemove",
    "subs": [`5~CCCAGG~${ticker}~USD`]
  })
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])
  subscribeToTickerOnWs(ticker)
}

export const unsubscribeToTicker = ticker => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWs(ticker)
}

setInterval(loadTickers, 5000)

window.tickers = tickersHandlers