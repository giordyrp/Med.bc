var Platform = artifacts.require("./Platform.sol");

contract("Platform", function(accounts){

    /*it("Register agent", function(){
        return Platform.deployed().then(function(instance){
            platform = instance;
            platform.registerAgent("Giordy");
            return platform.agents(0);
        }).then(function(agent){
            assert.equal(agent[0],"Giordy");
            assert.notEqual(agent[1],0x0);
        })

    });*/

    it("Get index", function(){
        return Platform.deployed().then(function(instance){
            platform = instance;
            return platform.getIndex({from: "0x93504fe2e02141dc65c3e7E9Db924a257B1D4F85"});
            
        }).then(function(index){
            assert.equal(index.toNumber(),0);
        })

    });

    it("Get name", function(){
        return Platform.deployed().then(function(instance){
            platform = instance;
            return platform.getName({from: "0x93504fe2e02141dc65c3e7E9Db924a257B1D4F85"});
        }).then(function(name){
            assert.equal(name,"Giordy");
        })

    });

});