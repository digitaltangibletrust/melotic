var debug = require('debug')('melotic')
  , request = require('request')
  , crypto = require('crypto')
  , _ = require('lodash');


// Options:
// - url {String}: (optional) melotic api url
// - apiKey {String}: API Key hooked up with melotic
// - shortCircuitMelotic {Function}: (optional) For testing to mock out api responses from melotic
function Client(config) {
  config = config || {};
  this.apiKey = config.apiKey;
  this.url = config.url || 'https://www.melotic.com';

  if(config.shortCircuitMelotic) this._callMelotic = config.shortCircuitMelotic; // if you want to replace the live api calls with a mock fcn for testing
}

Client.version = require('../package').version;

// Public
Client.prototype.getMarkets = function(cb) {
  this._callMelotic({
    uri: '/api/markets',
    method: 'GET'
  }, cb);
};

// Public
Client.prototype.getMarket = function(id, cb) {
  this._callMelotic({
    uri: '/api/markets/' + id,
    method: 'GET'
  }, cb);
};

// Public
Client.prototype.getMarketPrice = function(id, cb) {
  this._callMelotic({
    uri: '/api/markets/' + id + '/ticker',
    method: 'GET'
  }, cb);
};

// Public
// - params {JSON Object}: (optional) Format:
//    - count {Integer}: (optional) limit the response to count orders. Default is 50, maximum is 100.
Client.prototype.getMarketBuyDepth = function(id, params, cb) {
  cb = cb || params;
  if(cb === params) params = {};

  this._callMelotic({
    uri: '/api/markets/' + id + '/buy_depth',
    method: 'GET',
    qs: params
  }, cb);
};

// Public
// - params {JSON Object}: (optional) Format:
//    - count {Integer}: (optional) limit the response to count orders. Default is 50, maximum is 100.
Client.prototype.getMarketSellDepth = function(id, params, cb) {
  cb = cb || params;
  if(cb === params) params = {};
  
  this._callMelotic({
    uri: '/api/markets/' + id + '/sell_depth',
    method: 'GET',
    qs: params
  }, cb);
};

// Public
//  Get recently completed market orders
// - params {JSON Object}: (optional) Format:
//    - order {String}: (optional) specify desc or asc based on time of order. Default is desc.
//    - count {Integer}: (optional) limit the response to count orders. Default is 50, maximum is 100.
//    - count {Integer}: (optional) ignore the most recent start number of orders.
Client.prototype.getCompletedOrders = function(id, params, cb) {
  cb = cb || params;
  if(cb === params) params = {};
  
  this._callMelotic({
    uri: '/api/markets/' + id + '/deal_orders',
    method: 'GET',
    qs: params
  }, cb);
};

// Private
// - method {String}: HTTP method to use
// - uri {Array[String]}: API Endpoint
// - body {Array|Object}: JSON request body (optional)
// - qs {Array|Object}: JSON request query string object (optional)
Client.prototype._callMelotic = function(params, cb) {
  debug(uri, method, body);

  var uri = params.uri
    , method = params.method
    , body = params.body
    , qs = params.qs;

  var options = {
    url: this.url + uri,
    method: method,
    strictSSL: true,
    json: true,
    body: body,
    qs: qs
  };

  if(this.apiKey) options.auth = {
    user: this.apiKey
  };

  request(options, function(err, response, body) {
    if (err) return cb(err)

    var code = response.statusCode;

    body = body || {message: 'No Body'};
    // assign error message if 400
    if (!err && code >= 400) {
      err = new Error(body.message)
    }

    cb(err, body);
  });
};

module.exports = Client;