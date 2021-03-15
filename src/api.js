const API_KEY = 'dd53a0d2114d5a9576bfd98fd6ba2c44be4b2a55141dbe5ab091d0cc720037c3'

// '1afdf59eaee26da2dff1f9db5289e04658cdbe35039ff08cf058dc4b5ab7ff08'

export const loadTicker = tickers => 
fetch(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.json(',')}&api_key=${API_KEY}`).then(r => r.json())