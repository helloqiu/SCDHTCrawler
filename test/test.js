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
})
