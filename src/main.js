const dgram = require('dgram');

const BOOTSTRAP_NODES = [
  ['router.bittorrent.com', 6881],
  ['dht.transmissionbt.com', 6881],
  ['router.utorrent.com', 6881],
];

class SCCrawler {
  constructor(bootstrapNodes = BOOTSTRAP_NODES) {
    this.bootstrapNodes = bootstrapNodes;
    this.udp = dgram.createSocket('udp4');
  }
  run(port = 6881) {
    this.udp.on('listening', () => {
      const address = this.udp.address();
      console.log(`ScCrawler listening ${address.address}:${address.port}`);
    });
    this.udp.bind(port);
  }
}

module.exports = SCCrawler;
