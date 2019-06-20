var Adoption = artifacts.require("Adoption");

contract("Adoption", function(accounts) {
  describe('First group of test', () => {
    let instance;

    before(async () => {
      instance = await Adoption.deployed();
    });

    it('User should adopt a pet', async () => {
      await instance.adopt.sendTransaction(8, {from: accounts[0]}); // test to adopt 8 pets from Adoption contract with first account in our Blockchain
      let adopter = await instance.adopters.call(8); // check if we have the adress of the owner inside our contract 
      assert.equal(adopter, accounts[0], "Inccorect owner address"); // assert that our adopter saved correctly in our contract 
    });

    it('Should get adopter address by pet id in array', async () => {
      let adopters = await instance.getAdopters.call(); // give us the array of adopters
      assert.equal(adopters[8], accounts[0], "Owner of pet id should be recorder in the array");
    });

    it('Should throw if invalid pet id is given', async () => {
      try {
        await instance.adopt.sendTransaction(17,{from: accounts[0]}); 
        assert.fail(true, false, "This function did not throw");
      }catch(error){
        assert.include(String(error), "revert", `Expected "revert but instead got ${error}`); // this will check error obj converted to string that we have the word revert
      }
    });

  });
});
