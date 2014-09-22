
/**
 * Module dependencies.
 */

var Melotic = require('../')
  , should = require('should')
  , accessKey = process.env.accessKey
  , secret = process.env.secret
  , _ = require('lodash')
  , async = require('async');

Melotic.version.should.match(/^\d+\.\d+\.\d+$/);

describe('melotic', function() {
  this.timeout(5 * 1000);

  var testApiKey = 'test key';

  describe('#constructor', function() {
    it('should create an API instance with sufficient params', function() {
      var melotic = new Melotic({accessKey: testApiKey});

      melotic.should.be.ok;
    });
  });

  describe('#getMarkets', function() {
    it('should get markets', function(done) {
      var melotic = new Melotic();

      melotic.getMarkets(function(err, markets) {
        should.not.exist(err);
        _.size(markets).should.be.above(-1);
        done()
      })
    });
  });


  describe('Hit private api live', function() {
    it('should tell you if you didn\'t set an accessKey for live testing', function() {
      if(!accessKey) console.warn('NOTE: No api key provided. Hit api live tests will not be exercised. If you want to test an actual api hit. Do `accessKey=<Your melotic api key> npm test`');
      else console.warn('You are hitting melotic\'s API live!')
    });
  });

  describe('_sign', function() {
    it('should satisfy signatures from the example docs', function(done) {
      var examples = [{
        params: { price: 1, amount: 0.1, nonce: 1234, access_key: 'a83j8cj3uu827kksd' },
        secret: 's0e1c1r097y3j4k4i8jfdlet', 
        signature: '63d0f2111214e36d7debbc49b47289e87d851783e5a3fa2d295daf2c536487ac'
      }, {
        params: { order_id: 1002, access_key: '239jlk929e8323a4', nonce: 1235 },
        secret: 's0e1c1r097y3j4k4i8jfdlet', 
        signature: 'dffbbc3c7c0112383afef1d5fa2980f953c0aa237c6cf57734b3bafdc2716284'
      }];

      async.parallel(examples.map(function(example) {
        var melotic = new Melotic({
          accessKey: example.params.access_key,
          secret: example.secret
        });
        return function(cb) {
          melotic._sign(example.params).should.equal(example.signature);
          cb();
        };
      }), done);
    })
  });
});