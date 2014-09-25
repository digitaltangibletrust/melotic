
/**
 * Module dependencies.
 */

var Melotic = require('../')
  , should = require('should')
  , accessKey = process.env.accessKey
  , secret = process.env.secret
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
        done();
      })
    });
  });


  describe('Hit private api live', function() {
    it('should tell you if you didn\'t set an accessKey and secret for live testing', function() {
      if(!accessKey) console.warn('NOTE: No api key provided. Hit api live tests will not be exercised. If you want to test an actual api hit. Do `accessKey=<Your melotic api key> secret=<Your melotic api secret> npm test`');
      else if(!secret) console.warn('NOTE: No api secret provided. Hit api live tests will not be exercised. If you want to test an actual api hit. Do `accessKey=<Your melotic api key> secret=<Your melotic api secret> npm test`');
      else console.warn('You are hitting melotic\'s API live!')
    });

    var describeOrSkip = secret && accessKey ? describe : describe.skip;

    describeOrSkip('#getAccountBalances', function() {
      it('should get account balances', function(done) {
        var melotic = new Melotic({
          accessKey: accessKey,
          secret: secret
        });

        melotic.getAccountBalances(function(err, data) {
          should.not.exist(err);
          data.balances.should.be.ok;
          data.frozen_balances.should.be.ok;
          done();
        })
      });
    });

    // you'll have to unskip this one to try it
    describe.skip('#createAccount', function() {
      var email = Math.floor(Math.random() * 100000000) + '@decryptocoin.com'
        , pass = Math.floor(Math.random() * 100000000);

      it('should create an account', function(done) {
        var melotic = new Melotic({
          accessKey: accessKey,
          secret: secret
        });

        melotic.createAccount(email, pass, function(err, res) {
          should.not.exist(err);
          res.should.be.ok;
          console.log('You just created account: ' + email + '/' + pass + ' at melotic.');
          console.log(err, res);
          done();
        })
      });

      it('should not create a duped account', function(done) {
        var melotic = new Melotic({
          accessKey: accessKey,
          secret: secret
        });

        melotic.createAccount(email, pass, function(err, res) {
          should.exist(err);
          console.log(err, res);
          done();
        })
      });

      it('should not create an account with a < 8 char pass', function(done) {
        var melotic = new Melotic({
          accessKey: accessKey,
          secret: secret
        });

        var email = Math.floor(Math.random() * 100000000) + '@decryptocoin.com'

        melotic.createAccount(email, '22short', function(err, res) {
          should.exist(err);
          console.log(err, res);
          done();
        })
      });
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

      var melotic = new Melotic();
      
      async.parallel(examples.map(function(example) {
        return function(cb) {
          melotic._sign(example.params, example.secret).should.equal(example.signature);
          cb();
        };
      }), done);
    })
  });

  describe('_callMeloticSigned', function() {
    it('should not allow a call without an accessKey', function(done) {
      var melotic = new Melotic({
        secret: 's0e1c1r097y3j4k4i8jfdlet'
      });

      melotic._callMeloticSigned({}, function(err) {
        should.exist(err);
        done();
      })
    });

    it('should not allow a call without a secret', function(done) {
      var melotic = new Melotic({
        accessKey: '239jlk929e8323a4'
      });

      melotic._callMeloticSigned({}, function(err) {
        should.exist(err);
        done();
      })
    });

    it('should allow a call with both an accessKey and secret and correctly fill in the nonce, access_key, and signature fields', function(done) {
      var melotic = new Melotic({
        secret: 's0e1c1r097y3j4k4i8jfdlet',
        accessKey: '239jlk929e8323a4',
        shortCircuitMelotic: function(params) {
          params.body.nonce.should.be.ok;
          params.body.access_key.should.be.ok;
          params.body.signature.should.be.ok;
          done();
        }
      });

      melotic._callMeloticSigned({body:{}});
    });
  });
});