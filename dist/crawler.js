'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dgram = require('dgram');

var BOOTSTRAP_NODES = [['router.bittorrent.com', 6881], ['dht.transmissionbt.com', 6881], ['router.utorrent.com', 6881]];

var SCCrawler = function () {
  function SCCrawler() {
    var bootstrapNodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : BOOTSTRAP_NODES;

    _classCallCheck(this, SCCrawler);

    this.bootstrapNodes = bootstrapNodes;
    console.log(dgram);
    this.udp = dgram.createSocket('udp4');
  }

  _createClass(SCCrawler, [{
    key: 'run',
    value: function run() {
      var _this = this;

      var port = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 6881;

      this.udp.on('listening', function () {
        var address = _this.udp.address();
        console.log('ScCrawler listening ' + address.address + ':' + address.port);
      });
      this.udp.bind(port);
    }
  }]);

  return SCCrawler;
}();

module.exports = SCCrawler;
