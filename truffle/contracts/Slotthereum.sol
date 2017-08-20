pragma solidity ^0.4.11;

import "./SafeMath.sol";
import "./Mortal.sol";


contract Slotthereum is Mortal, SafeMath {

    mapping (uint => address) private players;      // players
    mapping (address => Game[]) private games;      // games per address
    mapping (address => uint) private balances;     // balances per address

    uint private minBetAmount = 10000000000000000;  // minimum amount per bet
    uint private maxBetAmount = 5000000000000000000;  // maximum amount per bet
    uint private pointer = 0;                       // block pointer
    uint private numberOfPlayers = 0;               // number of players

    struct Game {
        uint id;
        address player;
        uint amount;
        bool[11] bet;
        uint pointer;
        bytes32 hash;
        uint8 number;
        bool win;
        uint prize;
    }

    event BetPlaced(
        address indexed player,
        uint indexed gameId,
        uint amount,
        bool[11] bet
    );
    event MinBetAmountChanged(
        uint minBetAmount
    );
    event MaxBetAmountChanged(
        uint maxBetAmount
    );
    event GameWin(
        address indexed player,
        uint indexed gameId,
        bool[11] bet,
        uint prize
    );
    event GameLoose(
        address indexed player,
        uint indexed gameId,
        bool[11] bet,
        uint8 number,
        uint loss,
        uint prize
    );

    function payout(address player, uint gameId, bool[11] bet, uint prize) internal {
        balances[player] = add(balances[player], prize);
        GameWin(
            player,
            gameId,
            bet,
            prize
        );
    }

    function getBlockHash(uint i) constant returns (bytes32 blockHash) {
        if (i > 255) {
            i = 255;
        }
        blockHash = block.blockhash(block.number - i);
    }

    function getNumber(bytes32 _a) constant returns (uint8) {
        uint8 _b = 1;
        uint8 mint = 0;
        bool decimals = false;
        for (uint i = _a.length - 1; i >= 0; i--) {
            if ((_a[i] >= 48) && (_a[i] <= 57)) {
                if (decimals) {
                    if (_b == 0) {
                        break;
                    } else {
                        _b--;
                    }
                }
                mint *= 10;
                mint += uint8(_a[i]) - 48;
                return mint;
            } else if (_a[i] == 46) {
                decimals = true;
            }
        }
        return mint;
    }

    function placeBet(bool[11] bet) public payable returns (bool) {
        if (msg.value < minBetAmount) {
            return false;
        }

        if (msg.value > maxBetAmount) {
            return false;
        }

        uint8 counter = 0;
        for (uint8 i = 1; i <= 10; i++) {
            if (bet[i]) {
                counter++;
            }
        }

        if (counter > 9) {
            return false;
        }

        uint gameId = games[msg.sender].length;
        if (gameId == 0) {
            uint playerId = numberOfPlayers;
            players[playerId] = msg.sender;
            numberOfPlayers++;
        }

        games[msg.sender].length += 1;
        games[msg.sender][gameId].id = gameId;
        games[msg.sender][gameId].player = msg.sender;
        games[msg.sender][gameId].amount = msg.value;
        games[msg.sender][gameId].bet = bet;
        games[msg.sender][gameId].hash = getBlockHash(pointer);
        games[msg.sender][gameId].number = getNumber(games[msg.sender][gameId].hash);
        pointer = games[msg.sender][gameId].number;
        
        bool win = false;
        uint prize = 1;
        for (uint8 j = 1; j <= 10; j++) {
            if (bet[j]) {
                if (j-1 == games[msg.sender][gameId].number) {
                    win = true;
                    prize = msg.value + (msg.value * (1 - (counter / 10)));
                    break;
                }
            }
        }

        games[msg.sender][gameId].prize = prize;

        BetPlaced(
            msg.sender,
            gameId,
            msg.value,
            bet
        );

        if (win) {
            payout(msg.sender, gameId, bet, games[msg.sender][gameId].prize);
        } else {
            GameLoose(
                msg.sender,
                gameId,
                bet,
                games[msg.sender][gameId].number,
                msg.value,
                games[msg.sender][gameId].prize
            );
        }

        return true;
    }

    function withdraw() public returns (uint) {
        uint amount = getBalance();
        if (amount > 0) {
            balances[msg.sender] = 0;
            msg.sender.transfer(amount);
            return amount;
        }
        return 0;
    }

    function setMinBetAmount(uint _minBetAmount) onlyowner returns (uint) {
        minBetAmount = _minBetAmount;
        MinBetAmountChanged(minBetAmount);
        return minBetAmount;
    }

    function setMaxBetAmount(uint _maxBetAmount) onlyowner returns (uint) {
        maxBetAmount = _maxBetAmount;
        MaxBetAmountChanged(maxBetAmount);
        return maxBetAmount;
    }

    function getBalance() constant returns (uint) {
        if ((balances[msg.sender] > 0) && (balances[msg.sender] < this.balance)) {
            return balances[msg.sender];
        }
        return 0;
    }

    function numberOfGames() constant returns(uint numberOfGames) {
        numberOfGames = 0;
        address[] memory _players = getPlayers();
        for (uint i = 0; i < _players.length; i++) {
            numberOfGames += games[_players[i]].length;
        }
    }

    function getPlayers() constant returns(address[] memory addresses) {
        addresses = new address[](numberOfPlayers);
        for (uint i = 0; i < numberOfPlayers; i++) {
            addresses[i] = players[i];
        }
    }

    function getGameIds(address player) constant returns(uint[] memory ids) {
        ids = new uint[](games[player].length);
        for (uint i = 0; i < games[player].length; i++) {
            ids[i] = games[player][i].id;
        }
    }

    function getGameAmount(address player, uint gameId) constant returns(uint) {
        return games[player][gameId].amount;
    }

    function getGameBet(address player, uint gameId) constant returns(bool[11]) {
        return games[player][gameId].bet;
    }

    function getGamePointer(address player, uint gameId) constant returns(uint) {
        return games[player][gameId].pointer;
    }

    function getGameHash(address player, uint gameId) constant returns(bytes32) {
        return games[player][gameId].hash;
    }

    function getGameNumber(address player, uint gameId) constant returns(uint) {
        return games[player][gameId].number;
    }

    function getGameWin(address player, uint gameId) constant returns(bool) {
        return games[player][gameId].win;
    }

    function getGamePrize(address player, uint gameId) constant returns(uint) {
        return games[player][gameId].prize;
    }

    function getMinBetAmount() constant returns(uint) {
        return minBetAmount;
    }

    function getMaxBetAmount() constant returns(uint) {
        return maxBetAmount;
    }

    function () payable {

    }
}