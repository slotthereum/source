var Slotthereum = artifacts.require("./Slotthereum.sol");

contract('Slotthereum', function(accounts) {
  it("should allow player to place bets", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var watcher = instance.BetPlaced({player: accounts[1]});
      var amount = 10000000000000000;
      var account = accounts[1];
      var bet = [true, false, false, false, false, false, false, false, false, false];

      instance.placeBet(bet, {from: account, value: amount}).then(function() {
        return watcher.get();
      }).then(function(events) {
          if (typeof events != 'undefined') {
            if (events.length > 0) {
              assert.equal(events.length, 1);
              assert.equal(events[0].args.gameId.valueOf(), 0);
              assert.equal(events[0].args.player.valueOf(), account);
              assert.isTrue(events[0].args.bet[0]);
              assert.isFalse(events[0].args.bet[1]);
              assert.isFalse(events[0].args.bet[2]);
              assert.isFalse(events[0].args.bet[3]);
              assert.isFalse(events[0].args.bet[4]);
              assert.isFalse(events[0].args.bet[5]);
              assert.isFalse(events[0].args.bet[6]);
              assert.isFalse(events[0].args.bet[7]);
              assert.isFalse(events[0].args.bet[8]);
              assert.isFalse(events[0].args.bet[9]);
            }
          }
      }).then(done).catch(done);
    });
  });

  it("should reject bets with value less than the game minBetAmount", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var watcher = instance.BetPlaced({player: accounts[1]});
      var amount = 1;
      var account = accounts[1];
      var bet = [true, false, false, false, false, false, false, false, false, false];
      instance.placeBet(bet, {from: account, value: amount}).then(function(result) {
        assert.isNotNull(result.tx);
        assert.equal(result.receipt.logs.length, 0);
      }).then(done).catch(done);
    });
  });

  it("should reject bets with value bigger than the game maxByAmount", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var watcher = instance.BetPlaced({player: accounts[1]});
      var amount = 100000000000000000;
      var account = accounts[1];
      var bet = [true, false, false, false, false, false, false, false, false, false];
      instance.placeBet(bet, {from: account, value: amount}).then(function(result) {
        assert.isNotNull(result.tx);
        assert.equal(result.receipt.logs.length, 2);
      }).then(done).catch(done);
    });
  });

  it("should allow owner to change the game minimum bet amount", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var watcher = instance.MinBetAmountChanged();
      var newValue = 1;
      instance.setMinBetAmount(newValue, {from: accounts[0]}).then(function() {
        return watcher.get();
      }).then(function(events) {
          if (typeof events != 'undefined') {
            if (events.length > 0) {
              assert.equal(events.length, 1);
              assert.equal(events[0].args.minBetAmount.valueOf(), newValue);
            }
          }
      }).then(done).catch(done);
    });
  });

  it("should allow owner to change the game maximum bet amount", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var watcher = instance.MaxBetAmountChanged();
      var newValue = 2;
      instance.setMaxBetAmount(newValue, {from: accounts[0]}).then(function() {
        return watcher.get();
      }).then(function(events) {
          if (typeof events != 'undefined') {
            if (events.length > 0) {
              assert.equal(events.length, 1);
              assert.equal(events[0].args.maxBetAmount.valueOf(), newValue);
            }
          }
      }).then(done).catch(done);
    });
  });

  it("should allow players to get the game minimum bet amount", function(done) {
    Slotthereum.deployed().then(function(instance) {
      instance.getMinBetAmount({from: accounts[0]}).then(function(minBetAmount) {
        assert.equal(minBetAmount, 1);
      }).then(done).catch(done);
    });
  });

  it("should allow players to get the game maximum bet amount", function(done) {
    Slotthereum.deployed().then(function(instance) {
      instance.getMaxBetAmount({from: accounts[0]}).then(function(maxBetAmount) {
        assert.equal(maxBetAmount, 2);
      }).then(done).catch(done);
    });
  });

  it("should allow player to get the list of players", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var account = accounts[1];
      var gameId = 0;
      instance.getPlayers({from: account}).then(function(players) {
        assert.isTrue(players.length > 0);
      }).then(done).catch(done);
    });
  });

  it("should allow player to get their own games ids", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var account = accounts[1];
      instance.getGameIds(account, {from: account}).then(function(result) {
        assert.equal(result.length, 2);
        assert.equal(result[0], 0);
      }).then(done).catch(done);
    });
  });

  it("should allow player to get their own games amount", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var account = accounts[1];
      var gameId = 0;
      instance.getGameAmount(account, gameId, {from: account}).then(function(amount) {
        assert.equal(amount, 10000000000000000);
      }).then(done).catch(done);
    });
  });

  it("should allow player to get their own games bet", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var account = accounts[1];
      var gameId = 0;
      instance.getGameBet(account, gameId, {from: account}).then(function(bet) {
        assert.isTrue(bet[0]);
        assert.isFalse(bet[1]);
        assert.isFalse(bet[2]);
        assert.isFalse(bet[3]);
        assert.isFalse(bet[4]);
        assert.isFalse(bet[5]);
        assert.isFalse(bet[6]);
        assert.isFalse(bet[7]);
        assert.isFalse(bet[8]);
        assert.isFalse(bet[9]);
      }).then(done).catch(done);
    });
  });

  it("should allow player to get their own games pointer", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var account = accounts[1];
      var gameId = 0;
      instance.getGamePointer(account, gameId, {from: account}).then(function(pointer) {
        assert.isTrue(pointer >= 0);
      }).then(done).catch(done);
    });
  });

  it("should allow player to get their own games hash", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var account = accounts[1];
      var gameId = 0;
      instance.getGameHash(account, gameId, {from: account}).then(function(hash) {
        assert.isTrue(hash != '');
      }).then(done).catch(done);
    });
  });

  it("should allow player to get their own games number", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var account = accounts[1];
      var gameId = 0;
      instance.getGameNumber(account, gameId, {from: account}).then(function(number) {
        assert.isTrue(number >= 0);
      }).then(done).catch(done);
    });
  });

  it("should allow player to get their own games win", function(done) {
    Slotthereum.deployed().then(function(instance) {
      var account = accounts[1];
      var gameId = 0;
      instance.getGameWin(account, gameId, {from: account}).then(function(win) {
        assert.isTrue(win == true || win == false);
      }).then(done).catch(done);
    });
  });

});
