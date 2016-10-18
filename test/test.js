const assert = require('assert');
const SCCrawler = require('../dist/crawler.js');

const handleGetPeers = function(infoHash, addr) {
  console.log(infoHash);
}

const handleAnnouncePeers = function(infoHash, addr) {
  console.log(infoHash);
}

describe('SCCrawler', function() {
  const crawler = new SCCrawler(handleGetPeers, handleAnnouncePeers);
  describe('#Paramters', function() {
    it('should have the functions entered', function() {
      assert.equal(crawler.handleGetPeers, handleGetPeers);
      assert.equal(crawler.handleAnnouncePeers, handleAnnouncePeers);
    });
  });
  describe('#RandomNodeId', function() {
    it('should generate an ID which length is 20', function() {
      assert.equal(crawler.randomNodeID().length, 20);
    });
  });
  describe('#FakeNodeID', function() {
    it('should return crawler\'s nodeID if no paramters', function() {
      assert.equal(crawler.fakeNodeID(), crawler.nodeID);
    });
    it('should return the correct nodeID', function() {
      const nodeID = crawler.randomNodeID().toString();
      assert.equal(crawler.fakeNodeID(nodeID), nodeID.substring(0, nodeID.length - 1) + crawler.nodeID[crawler.nodeID.length]);
    });
  });
})
