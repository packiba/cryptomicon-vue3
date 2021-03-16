const API_KEY = 'dd53a0d2114d5a9576bfd98fd6ba2c44be4b2a55141dbe5ab091d0cc720037c3'

// '1afdf59eaee26da2dff1f9db5289e04658cdbe35039ff08cf058dc4b5ab7ff08'

const tickersHandlers = new Map()

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return
  }

  fetch(`https://min-api.cryptocompare.com/data/pricemulti
  ?fsym=${[...tickersHandlers.keys()].join(',')}
  &tsyms=USD
  &api_key=${API_KEY}`)
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

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])

}
export const unsubscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(
    ticker,
    subscribers.filter(fn => fn != cb)
  )
}

setInterval(loadTickers, 5000)

window.tickers = tickersHandlers