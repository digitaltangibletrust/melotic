// var httpProxy = require('http-proxy');

// function create(port) {
//   var proxy = httpProxy.createProxyServer({target:'https://www.melotic.com'}).listen(port);
//   return proxy;
// }

var express = require('express')
  , proxy = require('json-proxy')
  , cors = require('cors');

function create(port) {
  var app = express();
  app.use(express.favicon(false));
  app.use(express.logger('dev'));
  app.use(cors());
  app.use(proxy.initialize({
    proxy: {
      'forward': {
        '/': 'https://www.melotic.com'
      }
    }
  }));
  app.use(express.static(__dirname));

  var server = app.listen(port);
  console.log('Melotic proxy listening on http://localhost:' + port);

  return server;
}

module.exports = create;
