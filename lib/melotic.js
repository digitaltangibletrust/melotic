var debug = require('debug')('melotic')
  , request = require('request')
  , crypto = require('crypto')
  , _ = require('lodash')
  , FormUrlencoded = require('form-urlencoded')
  , async = require('async');


// vvvvvvvvvv Begin methods accessable without an access key + secret combo vvvvvvvvvv

// Options:
// - url {String}: (optional) melotic api url
// - accessKey {String}: API Key hooked up with melotic
// - shortCircuitMelotic {Function}: (optional) For testing to mock out api responses from melotic
function Client(config) {
  config = config || {};
  this.accessKey = config.accessKey;
  this.secret = config.secret;
  this.url = config.url || 'https://www.melotic.com';
  this.lastNonce = 0;

  if(config.shortCircuitMelotic) this._callMelotic = config.shortCircuitMelotic; // if you want to replace the live api calls with a mock fcn for testing

  // metering monkey patch to force a delay between every signed call yet not drop any
  var _callMeloticSigned = this._callMeloticSigned
    , self = this
    , meter = _.isNumber(config.meter) ? config.meter : 200
    , calls = async.cargo(function(tasks, cb) {
        var fns = tasks.map(function(args) {
          return function(cb) {
            _callMeloticSigned.apply(self, args)
            setTimeout(cb, meter);
          }
        });
        async.series(fns, cb);
      }, 1);

  this._callMeloticSigned = function() {
    calls.push(arguments);
  };
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
// - id {String}: Market ID string
Client.prototype.getMarket = function(id, cb) {
  this._callMelotic({
    uri: '/api/markets/' + id,
    method: 'GET'
  }, cb);
};

// Public
// - id {String}: Market ID string
Client.prototype.getMarketPrice = function(id, cb) {
  this._callMelotic({
    uri: '/api/markets/' + id + '/ticker',
    method: 'GET'
  }, cb);
};

// Public
// - id {String}: Market ID string
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
// - id {String}: Market ID string
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
// - id {String}: Market ID string
// - params {JSON Object}: (optional) Format:
//    - order {String}: (optional) specify desc or asc based on time of order. Default is desc.
//    - count {Integer}: (optional) limit the response to count orders. Default is 50, maximum is 100.
//    - count {Integer}: (optional) ignore the most recent start number of orders.
Client.prototype.getCompletedMarketOrders = function(id, params, cb) {
  cb = cb || params;
  if(cb === params) params = {};
  
  this._callMelotic({
    uri: '/api/markets/' + id + '/deal_orders',
    method: 'GET',
    qs: params
  }, cb);
};


// vvvvvvvvvv Begin methods requiring an access key + secret combo vvvvvvvvvv

// Public
//  Get account balances. Requires api access key and secret
Client.prototype.getAccountBalances = function(cb) {
  this._callMeloticSigned({
    uri: '/api/account/balances',
    method: 'GET',
    qs: {}
  }, cb);
};

// Public
//  Get completed orders. Requires api access key and secret
// - params {JSON Object}: (optional) Format:
//    - market_id (optional): get completed orders from a specific market, such as ltc-btc.
//    - order (optional): specify desc or asc based on time of order. Default is desc.
//    - count (optional): limit responses to count number of orders. Default is 50, maximum is 100.
//    - start (optional): ignore the most recent start number of orders.
Client.prototype.getCompletedOrders = function(params, cb) {
  cb = cb || params;
  if(cb === params) params = {};

  this._callMeloticSigned({
    uri: '/api/account/deal_orders',
    method: 'GET',
    qs: params
  }, cb);
};

// Public
//  Get pending orders. Requires api access key and secret
// - params {JSON Object}: (optional) Format:
//    - market_id (optional): get completed orders from a specific market, such as ltc-btc.
//    - order(optional): specify desc or asc based on time of order. Default is desc.
//    - count (optional): limit responses to count number of orders. Default is 50, maximum is 100.
//    - start (optional): ignore the most recent start number of orders.
Client.prototype.getPendingOrders = function(params, cb) {
  cb = cb || params;
  if(cb === params) params = {};

  this._callMeloticSigned({
    uri: '/api/account/pending_orders',
    method: 'GET',
    qs: params
  }, cb);
};

// Public
//  Get deposit addresses. Requires api access key and secret
Client.prototype.getDepositAddresses = function(cb) {
  this._callMeloticSigned({
    uri: '/api/account/deposit_addresses',
    method: 'GET',
    qs: {}
  }, cb);
};

// Public
//  Get deposit history. Requires api access key and secret
// - params {JSON Object}: (optional) Format:
//    - coin_type(optional): return deposit history for a particular coin, such as btc.
//    - state (optional): specify the state of deposits to return. Choices are: pending, confirming, and confirmed.
//    - order(optional): specify desc or asc based on time of deposit. Default is desc.
//    - count (optional): limit responses to count number of deposits. Default is 50, maximum is 100.
//    - start (optional): ignore the most recent start number of deposits.
Client.prototype.getDepositHistory = function(params, cb) {
  cb = cb || params;
  if(cb === params) params = {};

  this._callMeloticSigned({
    uri: '/api/account/deposits',
    method: 'GET',
    qs: {}
  }, cb);
};

// Public
//  Get withdrawal history. Requires api access key and secret
// - params {JSON Object}: (optional) Format:
//    - coin_type(optional): return withdrawal history for a particular coin, such as btc.
//    - state: specify the state of withdrawals to return. Choices are: locked, pending, confirming, confirmed, and canceled.
//    - order(optional): specify desc or asc based on time of withdrawal. Default is desc.
//    - count (optional): limit responses to count number of deposits. Default is 50, maximum is 100.
//    - start (optional): ignore the most recent start number of withdrawals.
Client.prototype.getWithdrawalHistory = function(params, cb) {
  cb = cb || params;
  if(cb === params) params = {};

  this._callMeloticSigned({
    uri: '/api/account/withdrawals',
    method: 'GET',
    qs: params
  }, cb);
};

// Public
//  Create sell order. Requires api access key and secret
// - marketId {String}: Market ID string
// - amount (required): Order amount
// - price (required): Limit price
Client.prototype.createSellOrder = function(marketId, amount, price, cb) {
  var params = {
    amount: amount,
    price: price
  };

  this._callMeloticSigned({
    uri: '/api/markets/' + marketId + '/sell_orders',
    method: 'POST',
    body: params
  }, cb);
};

// Public
//  Create buy order. Requires api access key and secret
// - marketId {String}: Market ID string
// - amount (required): Order amount
// - price (required): Limit price
Client.prototype.createBuyOrder = function(marketId, amount, price, cb) {
  var params = {
    amount: amount,
    price: price
  };

  this._callMeloticSigned({
    uri: '/api/markets/' + marketId + '/buy_orders',
    method: 'POST',
    body: params
  }, cb);
};

// Public
//  Cancel order. Requires api access key and secret
// - id {String}: Order ID string
Client.prototype.cancelOrder = function(id, cb) {
  this._callMeloticSigned({
    uri: '/api/account/pending_orders/' + id,
    method: 'DELETE',
    body: {}
  }, cb);
};

// Public
//  Create account. Requires special privileges api access key and secret
// - email {String}: User's email address
// - email {String}: User's password (at least 8 characters)
Client.prototype.createAccount = function(email, password, cb) {
  this._callMeloticSigned({
    uri: '/api/partner/accounts',
    method: 'POST',
    body: {
      email: email,
      password: password
    }
  }, cb);
};

// Public
//  Check if fund password is required for withdrawals. Requires api access key and secret
//  Sample response:
//    {'enabled_fund_password': true, 'id': 8, 'enabled_tfa': true}
Client.prototype.usingFundPassword = function(cb) {
  this._callMeloticSigned({
    uri: '/api/account',
    method: 'GET',
    qs: {}
  }, cb);
};

// Public
//  Withdraw. Requires special privileges api access key and secret
// - params {JSON Object}: (required) Format:
//    - amount (required): the withdrawal amount
//    - address_target (required): the target address 
//    - coin_type(required): make a withdrawal for a particular coin, such as btc.
//    - fund_password(optional): needed if the enabled_fund_password is true returned from /api/account {== this.usingFundPassword()}
Client.prototype.withdraw = function(params, cb) {
  this._callMeloticSigned({
    uri: '/api/partner/withdrawals',
    method: 'POST',
    body: params
  }, cb);
};


// vvvvvvvvvv Begin helpers vvvvvvvvvv

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

  if(this.accessKey) options.auth = {
    user: this.accessKey
  };

  request(options, function(err, response, body) {
    if (err) return cb(err)

    var code = response.statusCode;

    body = body || {message: 'No Body'};
    // assign error message if 400
    if (!err && code >= 400) {
      body.code = code;
      err = body;
    }

    cb(err, body);
  });
};

// Private
// - method {String}: HTTP method to use
// - uri {Array[String]}: API Endpoint
// - body {Array|Object}: JSON request body (optional)
// - qs {Array|Object}: JSON request query string object (optional)
Client.prototype._callMeloticSigned = function(params, cb) {
  if(!this.accessKey) return cb(new Error('API access key required'));
  if(!this.secret) return cb(new Error('API secret required'));

  var body = params.body || params.qs;

  var nonce = Date.now();
  nonce = nonce <= this.lastNonce ? this.lastNonce + 1 : nonce;
  body.nonce = this.lastNonce = nonce;
  body.access_key = this.accessKey;
  body.signature = this._sign(body, this.secret);

  this._callMelotic(params, cb);
};

function sortObject(obj) {
  return _.pick(obj, _.keys(obj).sort());
}

// Private
// - params {Array|Object}: JSON request params to sign (optional)
Client.prototype._sign = function(params, secret, cb) {
  params = sortObject(params);
  
  var text = FormUrlencoded.encode(params);

  var sign = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  return sign;
};

module.exports = Client;