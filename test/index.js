
/**
 * Module dependencies.
 */

var Melotic = require('../')
  , should = require('should')
  , apiKey = process.env.apiKey
  , _ = require('lodash');

Melotic.version.should.match(/^\d+\.\d+\.\d+$/);

describe('melotic', function() {
  this.timeout(5 * 1000);

  var testApiKey = 'test key';

  describe('#constructor', function() {
    it('should create an API instance with sufficient params', function() {
      var melotic = new Melotic({apiKey: testApiKey});

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
    it('should tell you if you didn\'t set an apiKey for live testing', function() {
      if(!apiKey) console.warn('NOTE: No api key provided. Hit api live tests will not be exercised. If you want to test an actual api hit. Do `apiKey=<Your melotic api key> npm test`');
      else console.warn('You are hitting melotic\'s API live!')
    });
  });
});