pragma solidity ^0.4.16;


contract Owned {
    address owner;

    modifier onlyowner() {
        if (msg.sender == owner) {
            _;
        }
    }

    function Owned() internal {
        owner = msg.sender;
    }
}


contract Mortal is Owned {
    function kill() public onlyowner {
        selfdestruct(owner);
    }
}


contract Slotthereum is Mortal {

    Game[] public games;                                // games
    uint public numberOfGames = 0;                      // number of games
    uint private minBetAmount = 100000000000000;        // minimum amount per bet
    uint private maxBetAmount = 1000000000000000000;    // maximum amount per bet
    bytes32 private seed;
    uint private nonce = 1;

    struct Game {
        address player;
        uint id;
        uint amount;
        uint8 start;
        uint8 end;
        uint8 number;
        bool win;
        uint prize;
    }

    event MinBetAmountChanged(uint amount);
    event MaxBetAmountChanged(uint amount);
    event PointerChanged(uint8 value);

    event GameRoll(
        address indexed player,
        uint indexed gameId,
        uint8 start,
        uint8 end,
        uint amount
    );

    event GameWin(
        address indexed player,
        uint indexed gameId,
        uint8 start,
        uint8 end,
        uint8 number,
        uint amount,
        uint prize
    );

    event GameLoose(
        address indexed player,
        uint indexed gameId,
        uint8 start,
        uint8 end,
        uint8 number,
        uint amount,
        uint prize
    );

    function random(uint8 min, uint8 max) public returns (uint) {
        nonce++;
        return uint(keccak256(nonce, seed))%(min+max)-min;
    }

    function random8(uint8 min, uint8 max) public returns (uint8) {
        nonce++;
        return uint8(keccak256(nonce, seed))%(min+max)-min;
    }

    function newSeed() public {
        seed = keccak256(nonce, seed, random(0, 255));
    }

    function getNumber() public returns (uint8) {
        newSeed();
        return random8(0,9);
    }

    function notify(address player, uint gameId, uint8 start, uint8 end, uint8 number, uint amount, uint prize, bool win) internal {
        if (win) {
            GameWin(
                player,
                gameId,
                start,
                end,
                number,
                amount,
                prize
            );
        } else {
            GameLoose(
                player,
                gameId,
                start,
                end,
                number,
                amount,
                prize
            );
        }
    }

    function placeBet(uint8 start, uint8 end) public payable returns (bool) {
        if (msg.value < minBetAmount) {
            return false;
        }

        if (msg.value > maxBetAmount) {
            return false;
        }

        uint8 counter = end - start + 1;

        if (counter > 7) {
            return false;
        }

        if (counter < 1) {
            return false;
        }

        uint gameId = games.length;
        games.length++;
        numberOfGames++;

        GameRoll(msg.sender, gameId, start, end, msg.value);

        games[gameId].id = gameId;
        games[gameId].player = msg.sender;
        games[gameId].amount = msg.value;
        games[gameId].start = start;
        games[gameId].end = end;
        games[gameId].prize = 1;
        games[gameId].number = getNumber();

        if ((games[gameId].number >= start) && (games[gameId].number <= end)) {
            games[gameId].win = true;
            uint dec = msg.value / 10;
            uint parts = 10 - counter;
            games[gameId].prize = msg.value + dec * parts;
        }

        msg.sender.transfer(games[gameId].prize);

        notify(
            msg.sender,
            gameId,
            start,
            end,
            games[gameId].number,
            msg.value,
            games[gameId].prize,
            games[gameId].win
        );

        return true;
    }

    function withdraw(uint amount) onlyowner public returns (uint) {
        if (amount <= this.balance) {
            msg.sender.transfer(amount);
            return amount;
        }
        return 0;
    }

    function setMinBetAmount(uint _minBetAmount) onlyowner public returns (uint) {
        minBetAmount = _minBetAmount;
        MinBetAmountChanged(minBetAmount);
        return minBetAmount;
    }

    function setMaxBetAmount(uint _maxBetAmount) onlyowner public returns (uint) {
        maxBetAmount = _maxBetAmount;
        MaxBetAmountChanged(maxBetAmount);
        return maxBetAmount;
    }

    function getGameIds() public constant returns(uint[]) {
        uint[] memory ids = new uint[](games.length);
        for (uint i = 0; i < games.length; i++) {
            ids[i] = games[i].id;
        }
        return ids;
    }

    function getGamePlayer(uint gameId) public constant returns(address) {
        return games[gameId].player;
    }

    function getGameAmount(uint gameId) public constant returns(uint) {
        return games[gameId].amount;
    }

    function getGameStart(uint gameId) public constant returns(uint8) {
        return games[gameId].start;
    }

    function getGameEnd(uint gameId) public constant returns(uint8) {
        return games[gameId].end;
    }

    function getGameNumber(uint gameId) public constant returns(uint8) {
        return games[gameId].number;
    }

    function getGameWin(uint gameId) public constant returns(bool) {
        return games[gameId].win;
    }

    function getGamePrize(uint gameId) public constant returns(uint) {
        return games[gameId].prize;
    }

    function getMinBetAmount() public constant returns(uint) {
        return minBetAmount;
    }

    function getMaxBetAmount() public constant returns(uint) {
        return maxBetAmount;
    }

    function () public payable {
    }
}