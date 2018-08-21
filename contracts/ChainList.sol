pragma solidity ^0.4.18;

import "./Ownable.sol";

contract ChainList is Ownable {
  // custom types
  struct Article {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  // state variables

  mapping (uint => Article) public articles;
  uint articleCounter;


  // events
  event LogSellArticle(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
    );

  event LogBuyArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
    );

  // deactivate the contracts
  function kill() public onlyOwner {
      selfdestruct(owner);
  }

  // sell an article
  function sellArticle(string _name, string _description, uint256 _price) public {
    // increment the article counter
    articleCounter++;

    // store this article
    articles[articleCounter] = Article(
        articleCounter,
        msg.sender,
        0x0,
        _name,
        _description,
        _price
      );

    emit LogSellArticle(articleCounter, msg.sender, _name, _price);
  }

  // fetch the number of articles in a contracts
  function getNumberOfArticles() public view returns(uint) {
    return articleCounter;
  }

  // fetch and return all articles still for sellArticle
  function getArticlesForSale() public view returns (uint[]) {
    //prepare output array
    uint[] memory articleIds = new uint[](articleCounter);

    uint numberOfArticlesForSale = 0;

    for(uint i = 1; i <= articleCounter; i++) {
      // keep the ID if the article is still for sale
      if(articles[i].buyer == 0x0){
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    // copy the artileIds array into a smaller forSale array
    uint[] memory forSale = new uint[] (numberOfArticlesForSale);
    for(uint j = 0; j < numberOfArticlesForSale; j++) {
      forSale[j] = articleIds[j];
    }
    return forSale;
  }

  // buy an article
  function buyArticle(uint _id) payable public {
    // Require that there is an article for sellArticle
    require(articleCounter > 0);

    // check that an article exists
    require(_id > 0 && _id <= articleCounter);

    // retrieve the article from the mapping
    Article storage article = articles[_id];

    // Check that the article has not been sold yet
    require(article.buyer == 0x0);

    // don't allow seller to buy own items
    require(msg.sender != article.seller);

    // Check that the value sent is at least that of the Price
    require(msg.value == article.price);

    // keep the buyers information
    article.buyer = msg.sender;

    // the buyer can pay the _seller
    article.seller.transfer(msg.value);

    // log the event
    emit LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
  }
}
