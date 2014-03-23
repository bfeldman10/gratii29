ig.module('game.main')
.requires(
    //'impact.debug.debug',
    'impact.game',
    'game.entities.reel',
    'game.system.eventChain'
)
.defines(function(){

/************************BDF API**************************/
window.eventHandler = {

    gameToken: "X0X0X0X",
    lastSpinGratiiResult: 0,
    prevResponse: null,

    init: function(){

        var request = $.ajax({
            type: "GET",
            url: "../../"+parent.apiRoot+"game/slots/start",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR){
            console.log( 'Started Slots Game' );
            console.log( response );

            window.ig.game.gratiiStart(response);

        });

        request.fail(function(response, textStatus, jqXHR){
            console.log( 'Failed to Load Slots Game' );
            console.log( response );
        });

    },
    spin: function(wager){

        //alert('spinning with ' + wager);



        //make bet call
        var placeBetEvent = {
            'gameToken': window.eventHandler.gameToken,
            'eventName': 'placeBet',
            'score': "-"+wager,
        };

        var request = $.ajax({
            type: "POST",
            url: "../../"+parent.apiRoot+"user/game/event",
            dataType: 'json',
            contentType: 'application/json',
            data: "["+JSON.stringify(placeBetEvent)+"]"
        });

        request.done(function(response, textStatus, jqXHR){
            console.log( 'placed bet successfully' );
            //TODO add more validation of success

            window.eventHandler.spinPhaseTwo(wager);
        });
        request.fail(function(response, textStatus, jqXHR){

            // var errorMsg = response.responseJSON.msg;
            var responseText = jQuery.parseJSON(response.responseText);
            var errorMsg = responseText['msg'];
            var proError = errorMsg.indexOf("PRO##");

            if ( proError >= 0 ) {

                errorMsg = errorMsg.substring(5);

                console.log( 'This is a PRO error' );
                alert(errorMsg);
                $("#spin").html("SPIN");
                $("#spin").css({"color":"white"});
                //app.Animation.showMessagePanel("generic", errorMsg);

                return;
            }


            alert(errorMsg);
            $("#spin").html("SPIN");
            $("#spin").css({"color":"white"});
            arcade.eventStorage.clearAllArcadeEvents('ArcadeEvents');
            // wipe everything
            localStorage.clear();

        });

        //return results

    },
    spinPhaseTwo: function(wager){

        parent.user.changeGratii(wager*-1);

        var spinEvent = {
            'gratiiBet': wager
        };

        var request = $.ajax({
            type: "POST",
            url: "../../"+parent.apiRoot+"game/slots/spin",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(spinEvent)
        });

        request.done(function(response, textStatus, jqXHR){
            console.log( 'spun successfully' );

            window.eventHandler.lastSpinGratiiResult = response.results.gratiiResult;

            //UPDATE jackpot and previous jackpot
            //window.ig.game.gratiiStart(response);
            window.eventHandler.prevResponse = response;

            window.ig.game.start(response.results);

            window.eventHandler.spinPhaseThree(response.results.gratiiResult, response.results.outcomeName);

        });

        request.fail(function(response, textStatus, jqXHR){
            console.log( 'failed to spin.' );
            alert("Uh oh, there was an error");
            $("#spin").html("SPIN");
            $("#spin").css({"color":"white"});
            //TODO handle error
        });

    },

    spinPhaseThree: function(gratiiResult, outcomeName){

        //make bet call
        var resultEvent = {
            'gameToken': window.eventHandler.gameToken,
            'eventName': outcomeName,
            'score': gratiiResult,
        };

        var request = $.ajax({
            type: "POST",
            url: "../../"+parent.apiRoot+"user/game/event",
            dataType: 'json',
            contentType: 'application/json',
            data: "["+JSON.stringify(resultEvent)+"]"
        });

        request.done(function(response, textStatus, jqXHR){
            console.log( 'placed result event successfully' );

        });
        request.fail(function(response, textStatus, jqXHR){
            //TODO handle erros
            console.log( 'failed to place result event.' );
            alert("Uh oh, there was an error");
            $("#spin").html("SPIN");
            $("#spin").css({"color":"white"});
        });

    },

    win: function(){
        if (window.eventHandler.lastSpinGratiiResult > 0) {
            parent.user.changeGratii(window.eventHandler.lastSpinGratiiResult);
        }
    },

    getJackPot: function(){

    }
}
/************************BDF API**************************/

MyGame = ig.Game.extend({

    clearColor: null,

    config: {
        reelCount: 3,
        chances: { gold: 0, cherry: 0, bar: 0, lose: 1 },
        reelDelay: 1.5
    },

    reelEntities: [],
    outcome: '',
    reels: [],
    running: false,
    chain: null,

    usersCurrentGratii: 0,
    wager: 5,
    currentJackpot: 0,
    spinning: 0,
    winType: 'd',
    winAmount: 0,
    betInterval: null,
    betTimer: 300,

    init: function() {

        ig.input.bind(ig.KEY.MOUSE1, 'mouse1');

        this.spawnReels();

        this.setupNewOutcome();

        var t = this;

        // start Gratii session
        /*$.post("../api/startGameSession.php", {gameName:'Slots'}, function(data){
            //console.log('slots! init');
        },"json");
        */

        // $.post("../api/getSlotsJackpot.php", function(data){
        //     console.log(data);
        //     t.usersCurrentGratii = data.usersCurrentGratii;
        //     t.currentJackpot     = data.currentJackpot;
        //     $('#jackpot span').text(data.currentJackpot);
        //     $('#gratii-coins span').text(data.usersCurrentGratii);
        // },"json");
        
        window.eventHandler.init();


        $('#cash-out').bind('click',function(e){
            e.preventDefault();
            // window.location = "../../users/html/arcade.html";
        });

        $('#hurry').bind('click',function(e){
            e.preventDefault();
            ig.game.stopReelsQuickly();
        });

        $('#spin').bind('touchstart',function(e){
            $(this).html('Wait..');
            $(this).css('color','#eb7170');
        });

        $('#spin').bind('click',function(e){

            e.preventDefault();

            if(ig.game.spinning) return false;
            $(this).html('Wait..');
            $(this).css('color','#eb7170');

           window.eventHandler.spin(ig.game.wager);
            // ig.game.start();

        });

        $('#increment-bet').bind('touchstart mousedown',function(e){
            e.preventDefault();
            if(ig.game.spinning) return false;
            ig.game.betInterval = window.setTimeout(ig.game.mTimedInc, 0);
        });

        $('#increment-bet').bind('touchend mouseup',function(e){
            e.preventDefault();
            if(ig.game.spinning) return false;
            ig.game.betTimer = 300;
            window.clearTimeout(ig.game.betInterval);
        });

        $('#decrement-bet').bind('touchstart mousedown',function(e){
            e.preventDefault();
            if(ig.game.spinning) return false;
            ig.game.betInterval = window.setTimeout(ig.game.mTimedDec, 0);
        });

        $('#decrement-bet').bind('touchend mouseup',function(e){
            e.preventDefault();
            if(ig.game.spinning) return false;
            ig.game.betTimer = 300;
            window.clearTimeout(ig.game.betInterval);
        });

    },

    mTimedInc: function(){
        window.clearTimeout(ig.game.betInterval);
        if (ig.game.wager < 500){
            var amt = 5;
            if (ig.game.betTimer < 100) amt = 10;
            ig.game.modifyWager(1, amt);
            if (ig.game.betTimer > 10) ig.game.betTimer *= 0.90;
            ig.game.betInterval = window.setTimeout(ig.game.mTimedInc, ig.game.betTimer);
        }
        else{
            ig.game.betTimer = 300;
            window.clearTimeout(ig.game.betInterval);
            alert('Maximum Bet is 500 Gratii');
        }
    },
    mTimedDec: function(){
        window.clearTimeout(ig.game.betInterval);
        if (ig.game.wager > 5){
            var amt = 5;
            if (ig.game.betTimer < 100) amt = 10;
            ig.game.modifyWager(0, amt);
            if (ig.game.betTimer > 10) ig.game.betTimer *= 0.90;
            ig.game.betInterval = window.setTimeout(ig.game.mTimedDec, ig.game.betTimer);
        }
        else{
            ig.game.betTimer = 300;
            window.clearTimeout(ig.game.betInterval);
            alert('Minimum Bet is 5 Gratii');
        }
    },

    modifyWager: function(increment, amount){

        if(increment){
            this.wager+=parseFloat(amount);
            if (this.wager > 500) {
                this.wager = 500;
            }
        }
        else{
            this.wager-=parseFloat(amount);
            if (this.wager < 5){
                this.wager = 5;
            }
        }

        $('#bet').text(this.wager);

    },

    gratiiStart: function(data){
        console.log( 'gratii start' );
        this.currentJackpot = data.results.currentJackpot;
        $('.cur-jackpot .amount').text(data.results.currentJackpot);
        $('.prev-jackpot .amount').text(data.results.previousJackpot != 0 ? data.results.previousJackpot : "---");
        $('.prev-jackpot .winner').text(data.results.previousWinnerNickname);
    },

    start: function (data){

        var t = this;

        t.winAmount = (data.gratiiResult);

        switch (data.outcomeName){

            case "double":
                t.winType = 'a';
                t.config.chances = { gold: 0, cherry: 1, bar: 0, lose: 0 };
            break;
            case "triple":
                t.winType = 'b';
                t.config.chances = { gold: 1, cherry: 0, bar: 0, lose: 0 };
            break;
            case "jackpot":
                t.winType = 'c';
                t.config.chances = { gold: 0, cherry: 0, bar: 1, lose: 0 };
            break;
            default:
                t.winType = 'd';
                t.config.chances = { gold: 0, cherry: 0, bar: 0, lose: 1 };
            break;

        }

        ig.game.spinning = 1;

        t.setupNewOutcome();
        t.startReels();

        // t.usersCurrentGratii = data.usersCurrentGratii;
        t.currentJackpot     = data.currentJackpot;

        $('#hurry').show(0);

    },

    spinComplete: function(){

        ig.game.spinning = 0;

        $('#hurry').hide(0);

        $('#jackpot span').text(this.currentJackpot);

        window.ig.game.gratiiStart(window.eventHandler.prevResponse);

        if (ig.game.winType !== 'd'){
            // ig.game.win( $('#'+ig.game.winType), ig.game.winAmount);
           window.eventHandler.win();
        }

        // $('#gratii-coins span').delay(150).animate({
        //    opacity: 0.35,
        //  }, 500, function() {
        //     $('#gratii-coins span').text(ig.game.usersCurrentGratii);
        //     $('#gratii-coins span').animate({
        //          opacity: 1.00,
        //     }, 200, function() {});
        //  });

        $('#gratii-coins span').text(ig.game.usersCurrentGratii);

        $("#spin").html("SPIN");
        $('#spin').css('color','#ffffff');


    },

   /* win: function($target, amount){
        $target.find('.win span').text(amount);
        TweenLite.to($target.find('.win'), 0.7, {css:{opacity:"1.0", scale:"1.0", top:"-=200"}, ease:Power1.easeInOut, delay:0.7});
        TweenLite.to($target.find('.win'), 0.3, {css:{opacity:"0.0", scale:"0.5", top:"+=200"}, ease:Power1.easeOut, delay:1.8});
    },*/

    update: function() {
        this.parent();
        if(this.running) {
            this.chain();
        }
    },

    draw: function() {
        // Do transparent background.
        ig.system.context.clearRect(0, 0, ig.system.realWidth, ig.system.realHeight);
        this.parent();
    },

    setupNewOutcome: function() {
        this.outcome = this.calculateRandomGameOutcome();
        this.reels = this.createReelArrayFromOutcome(this.outcome);
        return this.outcome;
    },

    startReels: function() {
        this.running = true;
        for(var i=0; i<this.reelEntities.length; i++) {
            this.reelEntities[i].start(this.reels[i]);
        }
        this.chain = EventChain(this)
            .wait(this.config.reelDelay)
            .then(function() {
                ig.game.reelEntities[0].stopAt(this.reels[0]);
            })
            .wait(this.config.reelDelay)
            .then(function() {
                ig.game.reelEntities[1].stopAt(this.reels[1]);
            })
            .wait(this.config.reelDelay)
            .then(function() {
                ig.game.reelEntities[2].stopAt(this.reels[2]);
                if (ig.game.spinning) ig.game.spinComplete();
            });
    },

    stopReelsQuickly: function() {
        for(var i=0; i<this.reelEntities.length; i++) {
            this.reelEntities[i].stopAt(this.reels[i]);
        }
        ig.game.spinComplete();
    },

    spawnReels: function() {
        for(var i=0; i<this.config.reelCount; i++) {
            var x = ig.system.width/2 - (EntityReel.prototype.size.x*this.config.reelCount)/2 + (i*EntityReel.prototype.size.x);
            var y = ig.system.height/2 - EntityReel.prototype.size.y/2;
            var reel = this.spawnEntity(EntityReel, x, y);
            this.reelEntities.push(reel);
        }
    },

    getNonLossSymbols: function() {
        var symbols = [];
        for(var symbol in this.config.chances) {
            if(this.config.chances.hasOwnProperty(symbol)) {
                if(symbol === 'lose') {
                    continue;
                } else {
                    symbols.push(symbol);
                }
            }
        }
        return symbols;
    },

    createReelArrayFromOutcome: function(outcome) {
        var reels = [];
        if(outcome === 'lose') {
            reels = this.createRandomLossReelArray();
        } else {
            reels = this.createWinReelArray(outcome);
        }
        return reels;
    },

    createWinReelArray: function(symbol) {
        var reels = [];
        for(var i=0; i<this.config.reelCount; i++) {
            reels.push(symbol);
        }
        return reels;
    },

    createRandomLossReelArray: function() {
        var symbols = this.getNonLossSymbols();
        var reels = [];
        for(var i=0; i<this.config.reelCount; i++) {
            var randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reels.push(randomSymbol);
        }
        while(this.isWinningReelArray(reels)) {
            reels = this.randomizeLastReelInArray(reels);
        }
        return reels;
    },

    isWinningReelArray: function(reels) {
        var current = '';
        var last = reels[0];
        for(var i=1; i<reels.length; i++) {
            current = reels[i];
            if(current !== last) {
                return false;
            }
            last = current;
        }
        return true;
    },

    randomizeLastReelInArray: function(reels) {
        var symbols = this.getNonLossSymbols();
        var randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        reels[reels.length - 1] = randomSymbol;
        return reels;
    },

    getSumOfObjectProperties: function(object) {
        var sum = 0;
        for(var key in object) {
            if(object.hasOwnProperty(key)) {
                sum += object[key];
            }
        }
        return sum;
    },

    calculateChanceRange: function() {
        var range = {};
        var offset = 0;
        for(var symbol in this.config.chances) {
            if(this.config.chances.hasOwnProperty(symbol)) {
                range[symbol] = {};
                range[symbol].first = offset;
                range[symbol].last = offset + this.config.chances[symbol] - 1;
                offset += this.config.chances[symbol];
            }
        }
        return range;
    },

    calculateRandomGameOutcome: function() {
        var total = this.getSumOfObjectProperties(this.config.chances);
        var range = this.calculateChanceRange();
        var random = Math.floor(Math.random() * total);
        for(var symbol in range) {
            if(range.hasOwnProperty(symbol)) {
                if(random >= range[symbol].first && random <= range[symbol].last) {
                    return symbol;
                }
            }
        }
        throw "Invalid game outcome.";
    },

    testGameOutcomes: function() {
        var results = {};
        for(var i=0; i<1000; i++) {
            var result = this.calculateRandomGameOutcome();
            if(typeof results[result] === 'undefined') {
                results[result] = 0;
            }
            results[result]++;
        }
        console.log(results);
    },

    testReelGeneration: function() {
        var outcome = this.calculateRandomGameOutcome();
        var reels = [];
        if(outcome === 'lose') {
            reels = this.createRandomLossReelArray();
        } else {
            reels = this.createWinReelArray(outcome);
        }
        console.log(reels);
    }

});

var width = EntityReel.prototype.size.x * 3;
var height = EntityReel.prototype.size.y;
ig.main( '#canvas', MyGame, 60, width, height, 2 );

});
