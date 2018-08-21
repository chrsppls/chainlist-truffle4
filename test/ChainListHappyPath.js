var ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "article 1";
  var articleDescription1 = "Description for article 1";
  var articlePrice1 = 10;
  var articleName2 = "article 2";
  var articleDescription2 = "Description for article 2";
  var articlePrice2 = 20;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be initialized with empty values", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "No items for sale");
    }).then(function(){
      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 0, "the array should be 0");
    });
  });

  it("should let us sell a first article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(
      articleName1,
      articleDescription1,
      web3.toWei(articlePrice1,"ether"),
      {from: seller}
      );
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "log length should be 1");
      assert.equal(receipt.logs[0].event, "LogSellArticle", " the log should be the LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "The item Id should be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "The seller should be seller 1" );
      assert.equal(receipt.logs[0].args._name, articleName1, "the article should be " + articleName1);
      assert.equal(receipt.logs[0].args._price, web3.toWei(articlePrice1,"ether"), "the price of the article should be" + web3.toWei(articlePrice1,"ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data, 1, "number of articles should be equal to 1");

      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 1,"the array length should be 1");
      assert.equal(data[0].toNumber(), 1, "the item Id should be 1");

      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "the id should be 1");
      assert.equal(data[1], seller, "seller should be the seller");
      assert.equal(data[2], 0x0, "there should not yet be a buyer");
      assert.equal(data[3], articleName1, "should be article 1 name");
      assert.equal(data[4], articleDescription1, "should be article 1 description");
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1,"ether"), "Price should be equal to " + web3.toWei(articlePrice1,"ether"));
    });
  });

  it("should let us sell a second article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(
      articleName2,
      articleDescription2,
      web3.toWei(articlePrice2,"ether"),
      {from: seller}
      );
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "log length should be 1");
      assert.equal(receipt.logs[0].event, "LogSellArticle", " the log should be the LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "The item Id should be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "The seller should be seller 1" );
      assert.equal(receipt.logs[0].args._name, articleName2, "the article should be " + articleName2);
      assert.equal(receipt.logs[0].args._price, web3.toWei(articlePrice2,"ether"), "the price of the article should be" + web3.toWei(articlePrice2,"ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data, 2, "number of articles should be equal to 2");

      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 2,"the array length should be 1");
      assert.equal(data[1].toNumber(), 2, "the item Id should be 1");

      return chainListInstance.articles(2);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 2, "the id should be 2");
      assert.equal(data[1], seller, "seller should be the seller");
      assert.equal(data[2], 0x0, "there should not yet be a buyer");
      assert.equal(data[3], articleName2, "should be article 2 name");
      assert.equal(data[4], articleDescription2, "should be article 2 description");
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2,"ether"), "Price should be equal to " + web3.toWei(articlePrice2,"ether"));
    });
  });

  it("Should buy an article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      // record balances of seller and buyer before the buyer
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller),"ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer),"ether").toNumber();
      return chainListInstance.buyArticle(1,{
        from: buyer,
        value: web3.toWei(articlePrice1, "ether")
      });
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should be triggered");
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "should log the buy event");
      assert.equal(receipt.logs[0].args._id.toNumber(),1,"Id should be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller should be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer should be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article should be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price should be " + web3.toWei(articlePrice1, "ether"));

      //record balance of buyer and seller after the buyer
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller),"ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer),"ether").toNumber();

      // Check the balances of buyers and sellers accounting for getCoinbase
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " in ether");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have earned " + articlePrice1 + " in ether"); // it is less because buyer pays for gas

      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 1, "the array should again be equal to 1");
      assert.equal(data[0].toNumber(), 2, "article 2 should be the only article left for sale");

      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(), 2,"There should still be two articles");
    });
  });
});
