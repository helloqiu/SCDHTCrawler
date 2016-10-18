const bencode = require('bencode');
const dgram = require('dgram');
const crypto = require('crypto');

const BOOTSTRAP_NODES = [
  { address: 'router.bittorrent.com', port: 6881 },
  { address: 'dht.transmissionbt.com', port: 6881 },
  { address: 'router.utorrent.com', port: 6881 },
];

class SCCrawler {
  constructor(handleGetPeers, handleAnnouncePeers, bootstrapNodes = BOOTSTRAP_NODES) {
    this.bootstrapNodes = bootstrapNodes;
    this.udp = dgram.createSocket('udp4');
    this.nodeID = this.randomNodeID();
    this.handleGetPeers = handleGetPeers;
    this.handleAnnouncePeers = handleAnnouncePeers;
  }
  run(port = 6881) {
    this.udp.on('listening', () => {
      const address = this.udp.address();
      console.log(`ScCrawler listening ${address.address}:${address.port}`);
    });
    this.udp.on('error', (err) => {
      console.log(`Crawler error:\n${err.stack}`);
    });
    this.udp.on('message', this.receiveMessage.bind(this));
    this.udp.bind(port);
    setInterval(this.findNodeFromBootstrap.bind(this), 2000);
  }
  findNodeFromBootstrap() {
    for (const node of BOOTSTRAP_NODES) {
      this.findNode(node);
    }
  }
  fakeNodeID(nodeID) {
    if (nodeID) {
      return nodeID.substring(0, nodeID.length - 1) + this.nodeID[this.nodeID.length];
    } else {
      return this.nodeID;
    }
  }
  randomNodeID() {
    return crypto.createHash('sha1').update(crypto.randomBytes(20)).digest();
  }
  findNode(addr, nodeID, _target) {
    let target = _target;
    if (!target) {
      target = this.randomNodeID();
    }
    this.sendMessage({
      t: 'fn',
      y: 'q',
      q: 'find_node',
      a: {
        id: this.fakeNodeID(nodeID),
        target,
      },
    }, addr);
  }
  decodeNodes(data) {
    const nodes = [];
    for (let i = 0; i + 26 <= data.length; i += 26) {
      nodes.push({
        nid: data.slice(i, i + 20),
        address: `${data[i + 20]}.${data[i + 21]}.${data[i + 22]}.${data[i + 23]}`,
        port: data.readUInt16BE(i + 24),
      });
    }
    return nodes;
  }
  sendMessage(_data, addr) {
    const data = _data;
    if (!('t' in data)) {
      data['t'] = 'tt';
    }
    const message = bencode.encode(data);
    this.udp.send(message, 0, message.length, addr['port'], addr['address']);
  }
  receiveMessage(msg, rinfo) {
    let data = null;
    try {
      data = bencode.decode(msg);
    } catch (err) {
      return;
    }
    // console.log(`Crawler got: ${data.y} from ${rinfo.address}:${rinfo.port}`);
    if (data.y.toString() === 'r' && data.r.nodes) {
      this.handleResponse(data);
      return;
    }
    if (data.y.toString() === 'q') {
      this.handleQuery(data, rinfo);
      return;
    }
  }
  ping(node) {
    this.sendMessage({
      y: 'q',
      t: 'pg',
      q: 'ping',
      a: {
        id: this.fakeNodeID(node.nid.toString()),
      },
    }, {
      address: node.address,
      port: node.port,
    });
  }
  handleResponse(msg) {
    const nodes = this.decodeNodes(msg.r.nodes);
    for (const node of nodes) {
      this.ping(node);
    }
  }
  properInfoHash(infoHash) {
    if (typeof infoHash === 'object') {
      return infoHash.toString().toUpperCase();
    } else {
      return infoHash;
    }
  }
  handleQuery(msg, addr) {
    const args = msg.a;
    const nodeID = args.id.toString();
    const queryType = msg.q.toString();
    switch (queryType) {
      case 'get_peers': {
        const infoHash = args.info_hash.toString('hex').toUpperCase();
        const token = infoHash.substring(0, 2);
        this.sendMessage({
          t: msg.t.toString(),
          y: 'r',
          r: {
            id: this.fakeNodeID(nodeID),
            nodes: '',
            token,
          },
        }, addr);
        this.handleGetPeers(infoHash, addr);
        break;
      }
      case 'announce_peer': {
        const ainfoHash = args.info_hash.toString('hex').toUpperCase();
        const tid = msg.t.toString();
        this.sendMessage({
          t: tid,
          y: 'r',
          r: {
            id: this.fakeNodeID(nodeID),
          },
        }, addr);
        this.handleAnnouncePeers(ainfoHash, addr);
        break;
      }
      case 'find_node': {
        const ftid = msg.t.toString();
        this.sendMessage({
          t: ftid,
          y: 'r',
          r: {
            id: this.fakeNodeID(nodeID),
            nodes: '',
          },
        }, addr);
        break;
      }
      case 'ping': {
        this.sendMessage({
          t: 'tt',
          y: 'r',
          r: {
            id: this.fakeNodeID(nodeID),
          },
        }, addr);
        break;
      }
      default: {
        return;
      }
    }
  }
}

module.exports = SCCrawler;
