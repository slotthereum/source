function Slotthereum() {
    this.contract = web3.eth.contract([{'constant':true,'inputs':[{'name':'player','type':'address'},{'name':'gameId','type':'uint256'}],'name':'getGameNumber','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'_a','type':'bytes32'}],'name':'getNumber','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':false,'inputs':[],'name':'kill','outputs':[],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'player','type':'address'},{'name':'gameId','type':'uint256'}],'name':'getGameStart','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'player','type':'address'},{'name':'gameId','type':'uint256'}],'name':'getGameHash','outputs':[{'name':'','type':'bytes32'}],'payable':false,'type':'function'},{'constant':true,'inputs':[],'name':'getMaxBetAmount','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':false,'inputs':[{'name':'_minBetAmount','type':'uint256'}],'name':'setMinBetAmount','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':false,'inputs':[{'name':'_maxBetAmount','type':'uint256'}],'name':'setMaxBetAmount','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[],'name':'getMinBetAmount','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'player','type':'address'},{'name':'gameId','type':'uint256'}],'name':'getGameWin','outputs':[{'name':'','type':'bool'}],'payable':false,'type':'function'},{'constant':false,'inputs':[{'name':'start','type':'uint8'},{'name':'end','type':'uint8'}],'name':'placeBet','outputs':[{'name':'','type':'bool'}],'payable':true,'type':'function'},{'constant':true,'inputs':[{'name':'player','type':'address'},{'name':'gameId','type':'uint256'}],'name':'getGameEnd','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'player','type':'address'},{'name':'gameId','type':'uint256'}],'name':'getGamePrize','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'player','type':'address'}],'name':'getGameIds','outputs':[{'name':'ids','type':'uint256[]'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'player','type':'address'},{'name':'gameId','type':'uint256'}],'name':'getGameAmount','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'i','type':'uint256'}],'name':'getBlockHash','outputs':[{'name':'blockHash','type':'bytes32'}],'payable':false,'type':'function'},{'payable':true,'type':'fallback'},{'anonymous':false,'inputs':[{'indexed':true,'name':'player','type':'address'},{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':false,'name':'amount','type':'uint256'},{'indexed':false,'name':'start','type':'uint8'},{'indexed':false,'name':'end','type':'uint8'}],'name':'BetPlaced','type':'event'},{'anonymous':false,'inputs':[{'indexed':false,'name':'amount','type':'uint256'}],'name':'MinBetAmountChanged','type':'event'},{'anonymous':false,'inputs':[{'indexed':false,'name':'amount','type':'uint256'}],'name':'MaxBetAmountChanged','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'player','type':'address'},{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':false,'name':'start','type':'uint8'},{'indexed':false,'name':'end','type':'uint8'},{'indexed':false,'name':'number','type':'uint8'},{'indexed':false,'name':'amount','type':'uint256'},{'indexed':false,'name':'prize','type':'uint256'}],'name':'GameWin','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'player','type':'address'},{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':false,'name':'start','type':'uint8'},{'indexed':false,'name':'end','type':'uint8'},{'indexed':false,'name':'number','type':'uint8'},{'indexed':false,'name':'amount','type':'uint256'},{'indexed':false,'name':'prize','type':'uint256'}],'name':'GameLoose','type':'event'}]);

    this.stopped = false;
    this.stopping = -1;

    this.contractInstance = this.contract.at(window.contract_address);
    this.modalIntro = 0;
    this.tabbed = 0;
    this.selectedGame = 0;
    this.eventsInitialized = false;
    this.games = [];
    this.myGames = [];
    this.players = [];
    this.minBetAmount = -1;
    this.maxBetAmount = -1;
    this.machine;
    var self = this;

    ///////////////////////////////////////////////////////////////////////////
    //
    //  SLOT
    //
    this.stop = function (x) {
        self.stopping = x;
        var position = - ((x * 250) + 2500);

        console.log('top: ' + parseInt($('#a').css('top')) + ' - pos: ' + parseInt(position));

        if ((parseInt($('#a').css('top') + 2500) >= parseInt(position)) && (!self.stopped)) {
            console.log('STOPPING')
            self.stopped = true;
            $('#a').animate({ top: position + 'px' }, 2000, 'easeOutCirc');
        }
    }

    this.spin = function () {
        if (!self.stopped) {
            $('#a').css('top', 0);
            if (self.stopping > -1) {
                stop(self.stopping);
            } else {
                $('#a').animate({ top: '-4500px' }, 1500, 'linear', function () { self.spin() });
            }
        }
    }

    this.start = function () {
        self.stopped = false;
        self.stopping = -1;
        $('#a').animate({ top: '-2250px' }, 1500, 'easeInExpo', function () { self.spin() });
    }

    this.formatN = function (n) {
        return n.replace('.', ',');
    }

    this.update_profit = function () {
        var slider_bet = document.getElementById('bet_range');
        var a = parseInt(slider_bet.noUiSlider.get()[0]);
        var b = parseInt(slider_bet.noUiSlider.get()[1]);
        var number_count = (b - a) + 1;
        var amount = $('#amount').val();
        var profit = (amount * (1 - number_count/10)).toFixed(6);

        $('#bet_amount').html(self.formatN(amount));
        $('#bet_profit').html(self.formatN(profit));

        if (number_count > 1)
            $('#bet_numbers').html(number_count + ' numbers');
        else
            $('#bet_numbers').html(number_count + ' number');
    }
    //
    //  SLOT
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  INIT
    //
    this.init = function () {
        async.waterfall([
            function minBetAmount(done) {
                self.contractInstance.getMinBetAmount(function(error, result) {
                    console.log('getMinBetAmount: ' + result.valueOf())
                    self.minBetAmount = result.valueOf();
                    $('#bet-amount').val(web3.fromWei(self.minBetAmount, 'ether'))
                    done(error, self.minBetAmount);
                });
            },
            function maxBetAmount(minBetAmount, done) {
                self.contractInstance.getMaxBetAmount(function(error, result) {
                    console.log('getMaxBetAmount: ' + result.valueOf())
                    self.maxBetAmount = result.valueOf();
                    done(error, self.maxBetAmount);
                });
            },
            function games(maxBetAmount, done) {
                Materialize.fadeInImage('#play-now-btn');
                Materialize.fadeInImage('#play-now-btn2');
                Materialize.fadeInImage('#bet-btn');
                done(null, null);
            }
            // function games(maxBetAmount, done) {
            //     self.contractInstance.getPlayers(function(error, result) {
            //         console.log('getPlayers: ' + result.valueOf())
            //         var players = result.valueOf();
            //         for (var i = 0; i < players.length; i++) {
            //             var player = players[i];
            //             console.log('player: ' + player)
            //             if (!self.players.includes(player)) {
            //                 self.players.push(player);
            //                 // self.addGamePlaceHolder(games[i]);
            //             }

            //             self.contractInstance.getGameIds(player, function(error, result) {
            //                 console.log('getGameIds: ' + result.valueOf())
            //                 var games = result.valueOf();
            //                 for (var i = 0; i < games.length; i++) {
            //                     console.log('player: ' + player)
            //                     var game = new Game(self, player, games[i]);
            //                     self.games.push(game);
            //                     // self.addGamePlaceHolder(games[i]);
            //                     if (player == self.account) {
            //                         self.myGames.push(game);
            //                     }
            //                 }
            //             });
            //         }
            //         done(error, self.players);
            //     });
            // },
        ],
        function (err) {
            if (err) {
                console.error(err);
            }
        });
    };

    this.areAllGamesInitialized = function () {
        var ret = true;
        for (var i = 0; i <= self.games; i++) {
            if (self.games.initialized == false) {
                return false;
            }
        }
        return ret;
    };
    //
    //  INIT
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  PLACE BET
    //
    this.placeBet = function (amount, a, b) {
        var value = amount * 1000000000000000000
        // var gas = 100000000;
        var gas = 200000;
        console.log('sending from: ' + self.account)

        self.contractInstance.placeBet(a, b, {from: self.account, value: value, gas: gas}, function(error, result) {
            if (error) {
                console.log('ERROR:');
                console.log(error);
            } else {
                self.start();
                $('#bet-btn').addClass('disabled');
                $('#bet-btn').removeClass('pulse');

                $('#amount').attr('disabled', true);

                var slider_bet = document.getElementById('bet_range');
                var origins = slider_bet.getElementsByClassName('noUi-origin');
                origins[0].setAttribute('disabled', true);
                origins[1].setAttribute('disabled', true);

                // Materialize.fadeInImage('#confirmations');
                console.log(result);
            }
        });
    }
    //
    //  PLACE BET
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  WITHDRAW
    //
    this.withdraw = function () {
        var gas = 500000;
        console.log('withdraw from: ' + self.account)
        self.contractInstance.withdraw({from: self.account, gas: gas}, function(error, result) {
            $('#withdraw-btn').addClass('disabled');
            $('#withdraw-transaction-id').html(result)
            Materialize.fadeInImage('#withdraw-confirmations');
        });
    }
    //
    //  WITHDRAW
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  ACCOUNTS
    //
    this.initAccounts = function () {
        self.accounts = [];
        self.account = null;

        web3.eth.getAccounts(function(error, accounts) {
            var account = null;
            accounts.forEach(function(_account) {
                if (account == null) {
                    account = _account;
                }
                $('#dropdown-nav').append('<li class="valign-wrapper"><a href="#!' + _account + '" class="accounts_dropdown_item"><div class="eth-address square">' + _account + '</div> ' + _account + '</a></li>');
            });

            if (account != null) {
                self.changeAccount(account)
                $('#avatar').css('display', 'block');
            } else {
                console.log('No accounts found!');
                $('#alert1').modal('open');
            }

            $('select').material_select();

            $('.accounts_dropdown_item').click(function() {
                var newValue = $(this).attr('href').replace('#!', '');
                console.log(newValue);
                self.changeAccount(newValue)
            });

            self.renderAllIdenticons();

            self.init();
        });
    }

    this.changeAccount = function (address) {
        self.account = address;
        self.renderAvatar(self.account);
        $('#current_account_number').html(self.account);
    }
    //
    //  ACCOUNTS
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  EVENTS
    //
    this.initEvents = function () {
        var currentBlockNumber = 0;
        web3.eth.getBlockNumber(function(error, result){
            if(!error)
                currentBlockNumber = result;
            else
                console.error(error);
        })

        var rangeAndPlayer = {player: self.account, fromBlock: currentBlockNumber, toBlock: 'latest'};

        // self.betPlacedEvent = self.contractInstance.BetPlaced(rangeAndPlayer);
        // self.betPlacedEvent.watch(self.betPlaced);

        self.gameWinEvent = self.contractInstance.GameWin(rangeAndPlayer);
        self.gameWinEvent.watch(self.gameWon);

        self.gameLooseEvent = self.contractInstance.GameLoose(rangeAndPlayer);
        self.gameLooseEvent.watch(self.gameLoosed);
    }

    // this.betPlaced = function (error, event) {
    //     if (error) {
    //         console.log('ERROR:');
    //         console.log(error);
    //     } else if (self.account == event.args.player) {
    //         console.log('betPlaced event player: ' + event.args.player);
    //         console.log('event.args.gameId: ' + event.args.gameId);
    //         console.log('event.args.amount: ' + event.args.amount);
    //         console.log('event.args.start: ' + event.args.start);
    //         console.log('event.args.end: ' + event.args.end);

    //         $('#bet-btn').removeClass('disabled');
    //         $('#bet-btn').addClass('pulse');
    //         $('#confirmations').css('opacity', 0);
    //         Materialize.toast('New bet placed', 5000, 'rounded');
    //     }
    // }

    this.gameWon = function (error, event) {
        if (error) {
            console.log('ERROR:');
            console.log(error);
        } else if (self.account == event.args.player) {
            console.log('gameWinEvent');
            console.log('event.args.player: ' + event.args.player);
            console.log('event.args.gameId: ' + event.args.gameId);
            console.log('event.args.amount: ' + event.args.amount);
            console.log('event.args.start: ' + event.args.start);
            console.log('event.args.end: ' + event.args.end);
            console.log('event.args.number: ' + event.args.number);
            console.log('event.args.prize: ' + event.args.prize);
            self.stop(event.args.number);
            Materialize.toast('WIN!', 150000, 'rounded, green');

            $('#bet-btn').removeClass('disabled');
            $('#bet-btn').addClass('pulse');
            $('#amount').attr('disabled', false);

            var slider_bet = document.getElementById('bet_range');
            var origins = slider_bet.getElementsByClassName('noUi-origin');
            origins[0].removeAttribute('disabled');
            origins[1].removeAttribute('disabled');
        }
    }

    this.gameLoosed = function (error, event) {
        if (error) {
            console.log('ERROR:');
            console.log(error);
        } else if (self.account == event.args.player) {
            console.log('gameLooseEvent');
            console.log('event.args.player: ' + event.args.player);
            console.log('event.args.gameId: ' + event.args.gameId);
            console.log('event.args.amount: ' + event.args.amount);
            console.log('event.args.start: ' + event.args.start);
            console.log('event.args.end: ' + event.args.end);
            console.log('event.args.number: ' + event.args.number);
            console.log('event.args.prize: ' + event.args.prize);
            self.stop(event.args.number);
            Materialize.toast('LOOSE!', 150000, 'rounded, red');

            $('#bet-btn').removeClass('disabled');
            $('#amount').attr('disabled', false);

            var slider_bet = document.getElementById('bet_range');
            var origins = slider_bet.getElementsByClassName('noUi-origin');
            origins[0].removeAttribute('disabled');
            origins[1].removeAttribute('disabled');
        }
    }
    //
    //  EVENTS
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  RENDER
    //
    this.addGamePlaceHolder = function (gameId) {
        var html = $('#game_placeholder_template').html();
        html = html.replace(/{game_id}/g, gameId);
        $('#games-container').append(html);
    }

    this.stopLoading = function () {
        self.renderAllIdenticons();
        $('#loading').hide();
        $('.page-footer').css('display', 'block');
        $('.main-container').css('display', 'block');
        $('.navbar-fixed').css('display', 'block');
        $('.nav-wrapper').css('background', '#2196F3');
    }

    this.startLoading = function () {
        $('#loading').show();
        $('.page-footer').css('display', 'none');
        $('.main-container').css('display', 'none');
        $('.navbar-fixed').css('display', 'none');
        $('.nav-wrapper').css('background', 'white');
    }

    this.renderIdenticon = function (obj) {
        obj.style.backgroundImage = 'url(' + blockies.create({ seed:obj.innerHTML.toLowerCase(), size: 8, scale: 16}).toDataURL() + ')'
    }

    this.renderAllIdenticons = function () {
        $('.eth-address').each(function(i, obj) {
            self.renderIdenticon(obj)
        });
    }

    this.initUIElements = function () {
        $(document).ready(function() {
            $('.target').pushpin({top: 0, bottom: 1000, offset: 0});

            $('#withdraw-btn').click(function() {
                self.withdraw();
            });

            $('#close-intro-btn').click(function() {
                $('#intro').css('display', 'none');
            });

            $('#close-intro-btn').click(function() {
                $('#intro').css('display', 'none');
            });

            $('#logo-btn').click(function() {
                $('ul.tabs').tabs('select_tab', 'intro');
                window.scrollTo(0, 0);
            });

            $('#play-now-btn, #play-now-btn2').click(function() {
                window.scrollTo(0, 0);
                $('ul.tabs').tabs('select_tab', 'play-now');
            });

            $(window).scroll(function() {
                var opacity = 1 - $(window).scrollTop() / 30;
                if (opacity < 0) {
                    opacity = 0;
                }
                $('.tabs').css('opacity', opacity);
            });

            $('.modal').modal();

            $('.tooltipped').tooltip({delay: 60});

            $('.main-container').css('display', 'block');

            $('input[type=range]').change(function() {
              console.log($('input[type=range]').val());
              $('#bet-number').html($('input[type=range]').val());
            });

            $(document).ready(function(){
                var slider_bet = document.getElementById('bet_range');
                // var slider_amount_1 = document.getElementById('amount_1');
                // var slider_amount_2 = document.getElementById('amount_2');
                // var slider_amount_3 = document.getElementById('amount_3');

                noUiSlider.create(slider_bet, {
                    start: [0,4],
                    step: 1,
                    // tooltips: [ wNumb({ decimals: 0 }), wNumb({ decimals: 0 }) ],
                    tooltips: [ false, false ],
                    connect: true,
                    limit: 8,
                    range: {
                        'min': 0,
                        'max': 9
                    },
                    pips: { // Show a scale with the slider
                        mode: 'values',
                        values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                        density: 100
                    }
                });

                slider_bet.noUiSlider.on('update', function(){
                    var a = parseInt(slider_bet.noUiSlider.get()[0]);
                    var b = parseInt(slider_bet.noUiSlider.get()[1]);
                    $('.bet-number-btn').addClass('lighten-3');
                    for (var i = a; i <= b; i++){
                        $('#bet-number-' + i).removeClass('lighten-3');
                    }
                    console.log(slider_bet.noUiSlider.get())
                    self.update_profit();
                });

                $('#amount').change(function() {
                    if ($(this).val().length > 7) { 
                        $(this).val(Number($(this).val()).toFixed(6));
                    }
                    self.update_profit();
                });

                $('#bet-btn').click(function() {
                    var a = parseInt(slider_bet.noUiSlider.get()[0]);
                    var b = parseInt(slider_bet.noUiSlider.get()[1]);
                    var amount = $('#amount').val();
                    self.placeBet(amount, a, b);
                });
            });

            // self.machine = $('.slot').slotMachine();

            // var slider = document.getElementById('value-slider');
            // noUiSlider.create(slider, {
            //     start: [20, 80],
            //     connect: true,
            //     step: 1,
            //     orientation: 'horizontal', // 'horizontal' or 'vertical'
            //     range: {
            //         'min': self.minBetAmount,
            //         'max': self.maxBetAmount
            //     },
            //     format: {
            //       to: function ( value ) {
            //         return web3.fromWei(value, 'ether');
            //       },
            //       from: function ( value ) {
            //         return value * 1000000000000000000;
            //       }
            //     }
            // });
        });
    }

    this.renderAvatar = function (address) {
        $('#avatar').html(address);
        $('#avatar').each(function(i, obj) {
            self.renderIdenticon(obj)
        });
    }

    this.renderTabs = function () {
        self.tabbed++;
        if (self.tabbed <= 1) {
            $('#tabs').html('<li class="tab col s2"><a class="active" href="#intro1">Slotthereum</a></li>');
            for (var i = this.games.length-1; i >= 0; i--) {
                $('#tabs').append('<li class="tab col s2"><a href="#game_' + this.games[i].id + '_holder">' + this.games[i].minAmount +' ETH</a></li>');
            }
            $('#tabs').append('<li class="tab col s2"><a href="#withdraw"><span class="new badge balance" data-badge-caption="ETH"></span>Withdraw</a></li>');
            $('#tabs').tabs({
                'swipeable': false,
                'onShow': function (tab) {
                    self.selectedGame = 0;
                    var gameId = parseInt(
                        tab.selector.replace('#game_', '').replace('_holder', '')
                    );
                    if (gameId >= 0) {
                        self.selectedGame = gameId;
                    }
                    console.log('SELECTED GAME: ' + self.selectedGame);
                },
            });
        }
    };

    this.renderResults = function () {
        var ret = true;
        $('#all_games_holder').html('');

        $('#min').html('Min. ' + web3.fromWei(self.minBetAmount, 'ether'));
        $('#max').html('Max. ' + web3.fromWei(self.maxBetAmount, 'ether'));

        for (var i = self.games.length-1; i >= 0; i--) {
            var game = self.games[i];
            var html = $('#game_template').html();
            html = html.replace(/{game_id}/g, game.id);
            html = html.replace(/{player}/g, game.player);
            html = html.replace(/{bet}/g, game.bet);
            html = html.replace(/{number}/g, game.number);
            html = html.replace(/{prize}/g, web3.fromWei(game.prize, 'ether'));
            html = html.replace(/{amount}/g, web3.fromWei(game.amount, 'ether'));

            var btnHtml = $('#bet_number_template').html().replace(/{number}/g, game.number);

            if (game.win) {
                btnHtml = btnHtml.replace('{color}', 'green');
                html = html.replace('{betButton}', btnHtml);
                // html = html.replace('{color}', 'green lighten-2');
            } else {
                btnHtml = btnHtml.replace('{color}', 'red');
                html = html.replace('{betButton}', btnHtml);
                // html = html.replace('{color}', 'red lighten-2');
            }

            $('#all_games_holder').append(html);
        }

        self.renderAllIdenticons();
        return ret;
    };
    //
    //  RENDER
    //
    ///////////////////////////////////////////////////////////////////////////

    this.initAccounts();
    this.initUIElements();
    this.initEvents();
}

function Game(slotthereum, player, gameId) {
    this.slotthereum = slotthereum;
    this.player = player;
    this.id = parseInt(gameId);
    this.initialized = false;

    this.contractInstance = slotthereum.contractInstance;

    this.amount = -1;
    this.bet = -1;
    this.pointer = -1;
    this.number = -1;
    this.hash = '';
    this.win = false;

    var self = this;

    this.init = function () {
        async.waterfall([
            function(done) {
                console.log('Game id: ' + self.id);
                console.log('player: ' + self.player);
                console.log('id: ' + self.id);

                self.contractInstance.getGameAmount(self.player, self.id, function(error, result){
                    self.amount = result.valueOf();
                    done(error, self.amount);
                });
            },
            function(amount, done) {
                console.log('Game amount: ' + self.amount);
                self.contractInstance.getGameBet(self.player, self.id, function(error, result) {
                    self.bet = result.valueOf();
                    done(error, self.bet);
                });
            },
            function(bet, done) {
                console.log('Game bet: ' + self.bet);
                self.contractInstance.getGamePointer(self.player, self.id, function(error, result) {
                    self.pointer = result.valueOf();
                    done(error, self.pointer);
                });
            },
            function(pointer, done) {
                console.log('Game pointer: ' + self.pointer);
                self.contractInstance.getGameNumber(self.player, self.id, function(error, result) {
                    self.number = result.valueOf();
                    done(error, self.number);
                });
            },
            function(number, done) {
                console.log('Game number: ' + self.number);
                self.contractInstance.getGameHash(self.player, self.id, function(error, result) {
                    self.hash = result.valueOf();
                    done(error, self.hash);
                });
            },
            function(hash, done) {
                console.log('Game hash: ' + self.hash);
                self.contractInstance.getGameWin(self.player, self.id, function(error, result) {
                    self.win = result.valueOf();
                    done(error, self.win);
                });
            },
            function(win, done) {
                console.log('Game win: ' + self.win);
                self.contractInstance.getGamePrize(self.player, self.id, function(error, result) {
                    self.prize = result.valueOf();
                    done(error, self.win);
                });
            },
            function(prize, done) {
                console.log('Game prize: ' + self.prize);
                self.initialized = true;
                self.render();
                done(null, null);
            },
        ],
        function (err) {
            if (err) {
                console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.error(err);
            }
        });
    }

    this.render = function () {
        console.log('redering player: ' + self.player + ' game: ' + self.id);

        if(self.slotthereum.areAllGamesInitialized()) {
            console.log('ALL GAMES INITIALIZED!!!');
            self.slotthereum.renderResults();
        }
    }

    this.init();
    console.log('game.id >>>> ' + this.id);
}
