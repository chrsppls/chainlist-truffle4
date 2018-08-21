// contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

// test suite
contract("ChainList", function(accounts){
  var chainListInstance;
  var seller = accounts[0];
  var buyer = accounts[1];
  var articleName = "article 1";
  var articleDescription = "this is the description of the article";
  var articlePrice = 10;


  // no article for sale yet
  it("should throw an exception if you try to buy an article when there is no article for sale", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1,{
        from: buyer,
        value: web3.fromWei(articlePrice,"ether")
      });

    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(),0,"number of articles must be zero");
    });
  });

  // Try to buy an article which  does not exists
  it("Should throw an exception if you try to buy an article which does not exist", function(){
    ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice,"ether"), {from: seller});
    }).then(function(receipt){
      return chainListInstance.buyArticle(2, {from: seller, value: web3.toWei(articlePrice,"ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function(){
      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(),1 ,"Article 1 should still exist");
      assert.equal(data[1], seller, "seller should be the seller");
      assert.equal(data[2], 0x0, "there should not yet be a buyer");
      assert.equal(data[3], articleName, "should be article 1 name");
      assert.equal(data[4], articleDescription, "should be article 1 description");
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice,"ether"), "Price should be equal to " + web3.toWei(articlePrice,"ether"));
    });
  });

  // buying an article which you own
  it("should throw an exception if you try to buy your own article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1,{from: seller, value: web3.toWei(articlePrice,"ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function(){
      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(),1 ,"Article 1 should still exist");
      assert.equal(data[1], seller, "seller should be the seller");
      assert.equal(data[2], 0x0, "there should not yet be a buyer");
      assert.equal(data[3], articleName, "should be article 1 name");
      assert.equal(data[4], articleDescription, "should be article 1 description");
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice,"ether"), "Price should be equal to " + web3.toWei(articlePrice,"ether"));
    });
  });

  // buy an item with a price which is too allow
  it("Should throw an exception if the price is to low", function(){
    return ChainList.deployed().then(function(instance){
        chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice + 1,"ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function(){
      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(),1 ,"Article 1 should still exist");
      assert.equal(data[1], seller, "seller should be the seller");
      assert.equal(data[2], 0x0, "there should not yet be a buyer");
      assert.equal(data[3], articleName, "should be article 1 name");
      assert.equal(data[4], articleDescription, "should be article 1 description");
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice,"ether"), "Price should be equal to " + web3.toWei(articlePrice,"ether"));
    });
  });

  // Test if you buy an article which has already been Sold
  it("What if an article has already been sold", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice,"ether")});
    }).then(function(){
      chainListInstance.buyArticle(1, {from: web3.eth.accounts[0], value: web3.toWei(articlePrice,"ether")})
      .catch(function(error){
          assert(true);
      });
    }).then(function(){
      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(),1 ,"Article 1 should still exist");
      assert.equal(data[1], seller, "seller should be the seller");
      assert.equal(data[2], buyer, "there is a buyer");
      assert.equal(data[3], articleName, "should be article 1 name");
      assert.equal(data[4], articleDescription, "should be article 1 description");
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice,"ether"), "Price should be equal to " + web3.toWei(articlePrice,"ether"));
    });
  });
});