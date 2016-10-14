const BOOTSTRAP_NODES = [
  ['router.bittorrent.com', 6881],
  ['dht.transmissionbt.com', 6881],
  ['router.utorrent.com', 6881],
];

class SCCrawler {
  constructor(bootstrapNodes = BOOTSTRAP_NODES) {
    this.bootstrapNodes = bootstrapNodes;
  }
}

export default SCCrawler;
