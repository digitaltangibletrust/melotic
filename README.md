melotic
=========

The melotic api wrapped for NodeJS/JavaScript.

Why we created it?
=========
We created this API wrapper so you could access the equivalent REST API through simple asynchronous functions with all the power provided by Molotic's direct API. This API uses simple method calls without all of the hassle of writing API request URLs, body and query strings.

Pull requests are welcomed!


## API documentation

### Instantiating a Client

```js
var Melotic = require('melotic');
var melotic = new Melotic(options);
```

This generates a new API client. It accepts options arguments.

##### options:

-`accessKey` **string** Optional. Your Melotic api access key for write operations, like submitting a bid.
-`secret` **string** Optional. Your Melotic secret corresponding to your access key for signing write operations.

### Melotic client

- [melotic.getMarkets(callback)](#getMarkets)
- [melotic.getMarket(id, callback)](#getMarket)
- [melotic.getMarketPrice(id, callback)](#getMarketPrice)
- [melotic.getMarketBuyDepth(id, params, callback)](#getMarketBuyDepth)
- [melotic.getMarketSellDepth(id, params, callback)](#getMarketSellDepth)
- [melotic.getCompletedOrders(id, params, callback)](#getCompletedOrders)

<a name="getMarkets"></a>
#### getMarkets  

```js
melotic.getMarkets(function(err, markets) {
  // ... utilize markets
});
```
