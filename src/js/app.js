App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    if(typeof web3 !== undefined) {
      App.web3Provider = web3.currentProvider; //if we have and injected web3 already we want to use it
    } else {
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545"); //if we dont have web3 we use ganache server
    }
    web3 = new Web3(App.web3Provider);
    App.web3Provider.enable();
    return App.initContract();
  },

  initContract: function() {
    // will read the compiled file and return as the variable data
    $.getJSON("Adoption.json", function(data){
      var adoptionArtifact = data;

      App.contracts.adoption = TruffleContract(adoptionArtifact) //will save the truffle contract inside the contract obj and keep it async with migration

      App.contracts.adoption.setProvider(App.web3Provider);

      return App.markAdopted(); //in case any pets are already adopted
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    App.contracts.adoption.deplyed().then(function(instance){
      return instance.getAdopters.call(); //give us all the adopters in the smart contract
    }).then(function(adopters){
      for (let i = 0; i < adopters.length; i++) {
        if(!web3.toBigNumber(adopters[i]).isZero()){
          //will loop all the pets and checked all the addresses stored for them and if the address is not 0 it will disabled the button and change the text to Success
          $('.panel-pet').eq(i).find("button").text("Success").attr("disabled", true); 
        }
      }
    }).catch(function(error){
      console.log(error.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    // return the accounts that the user have in metamask for instance
    web3.eth.getAccounts(function(error,accounts){
      if(error){
        console.log(error);
      }

      App.contracts.adoption.deployed().then(function(instance){
        return instance.adopt.sendTransaction(petId, {from: accounts[0]})
      }).then(function(result){
        return App.markAdopted();
      }).catch(function(error){
        console.log(error.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
