'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var bencode = require('bencode');
var dgram = require('dgram');
var crypto = require('crypto');

var BOOTSTRAP_NODES = [{ address: 'router.bittorrent.com', port: 6881 }, { address: 'dht.transmissionbt.com', port: 6881 }, { address: 'router.utorrent.com', port: 6881 }];

var SCCrawler = function () {
  function SCCrawler(handleGetPeers, handleAnnouncePeers) {
    var bootstrapNodes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : BOOTSTRAP_NODES;

    _classCallCheck(this, SCCrawler);

    this.bootstrapNodes = bootstrapNodes;
    this.udp = dgram.createSocket('udp4');
    this.nodeID = this.randomNodeId();
    this.handleGetPeers = handleGetPeers;
    this.handleAnnouncePeers = handleAnnouncePeers;
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
      this.udp.on('error', function (err) {
        console.log('Crawler error:\n' + err.stack);
      });
      this.udp.on('message', this.receiveMessage.bind(this));
      this.udp.bind(port);
      setInterval(this.findNodeFromBootstrap.bind(this), 2000);
    }
  }, {
    key: 'findNodeFromBootstrap',
    value: function findNodeFromBootstrap() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = BOOTSTRAP_NODES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          this.findNode(node);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'fakeNodeID',
    value: function fakeNodeID(nodeID) {
      if (nodeID) {
        return nodeID.substring(0, nodeID.length - 1) + this.nodeID[this.nodeID.length];
      } else {
        return this.nodeID;
      }
    }
  }, {
    key: 'randomNodeId',
    value: function randomNodeId() {
      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;

      return crypto.createHash('sha1').update(crypto.randomBytes(size)).digest();
    }
  }, {
    key: 'findNode',
    value: function findNode(addr, nodeID, _target) {
      var target = _target;
      if (!target) {
        target = this.randomNodeId();
      }
      this.sendMessage({
        t: 'fn',
        y: 'q',
        q: 'find_node',
        a: {
          id: this.fakeNodeID(nodeID),
          target: target
        }
      }, addr);
    }
  }, {
    key: 'decodeNodes',
    value: function decodeNodes(data) {
      var nodes = [];
      for (var i = 0; i + 26 <= data.length; i += 26) {
        nodes.push({
          nid: data.slice(i, i + 20),
          address: data[i + 20] + '.' + data[i + 21] + '.' + data[i + 22] + '.' + data[i + 23],
          port: data.readUInt16BE(i + 24)
        });
      }
      return nodes;
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(_data, addr) {
      var data = _data;
      if (!('t' in data)) {
        data['t'] = 'tt';
      }
      var message = bencode.encode(data);
      this.udp.send(message, 0, message.length, addr['port'], addr['address']);
    }
  }, {
    key: 'receiveMessage',
    value: function receiveMessage(msg, rinfo) {
      var data = null;
      try {
        data = bencode.decode(msg);
      } catch (err) {
        return;
      }
      // console.log(`Crawler got: ${data.y} from ${rinfo.address}:${rinfo.port}`);
      if (data.y == 'r' && data.r.nodes) {
        this.handleResponse(data);
        return;
      }
      if (data.y == 'q') {
        this.handleQuery(data, rinfo);
        return;
      }
    }
  }, {
    key: 'ping',
    value: function ping(node) {
      this.sendMessage({
        y: 'q',
        t: 'pg',
        q: 'ping',
        a: {
          id: this.fakeNodeID(node.nid.toString())
        }
      }, {
        address: node.address,
        port: node.port
      });
    }
  }, {
    key: 'handleResponse',
    value: function handleResponse(msg) {
      var nodes = this.decodeNodes(msg.r.nodes);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var node = _step2.value;

          this.ping(node);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'properInfoHash',
    value: function properInfoHash(infoHash) {
      if ((typeof infoHash === 'undefined' ? 'undefined' : _typeof(infoHash)) === 'object') {
        return infoHash.toString().toUpperCase();
      } else {
        return infoHash;
      }
    }
  }, {
    key: 'handleQuery',
    value: function handleQuery(msg, addr) {
      var args = msg.a;
      var nodeID = args.id.toString();
      var queryType = msg.q.toString();
      switch (queryType) {
        case 'get_peers':
          {
            var infoHash = args.info_hash.toString('hex').toUpperCase();
            var token = infoHash.substring(0, 2);
            this.sendMessage({
              t: msg.t.toString(),
              y: 'r',
              r: {
                id: this.fakeNodeID(nodeID),
                nodes: '',
                token: token
              }
            }, addr);
            this.handleGetPeers(infoHash, addr);
            break;
          }
        case 'announce_peer':
          {
            var ainfoHash = args.info_hash.toString('hex').toUpperCase();
            var tid = msg.t.toString();
            this.sendMessage({
              t: tid,
              y: 'r',
              r: {
                id: this.fakeNodeID(nodeID)
              }
            }, addr);
            this.handleAnnouncePeers(ainfoHash, addr);
            break;
          }
        case 'find_node':
          {
            var ftid = msg.t.toString();
            this.sendMessage({
              t: ftid,
              y: 'r',
              r: {
                id: this.fakeNodeID(nodeID),
                nodes: ''
              }
            }, addr);
            break;
          }
        case 'ping':
          {
            this.sendMessage({
              t: 'tt',
              y: 'r',
              r: {
                id: this.fakeNodeID(nodeID)
              }
            }, addr);
            break;
          }
        default:
          {
            return;
          }
      }
    }
  }]);

  return SCCrawler;
}();

module.exports = SCCrawler;
