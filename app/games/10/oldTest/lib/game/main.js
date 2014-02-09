ig.module('game.main')
.requires(
    //'impact.debug.debug',
    'impact.game',
    'game.entities.reel',
    'game.system.eventChain'
)
.defines(function(){

MyGame = ig.Game.extend({

    clearColor: null,

    config: {
        reelCount: 3,
        chances: { gold: 2, cherry: 5, bar: 1, lose: 8 },
        reelDelay: 1.5
    },

    reelEntities: [],
    outcome: '',
    reels: [],
    running: false,
    chain: null,

    init: function() {

        ig.input.bind(ig.KEY.MOUSE1, 'mouse1');

        this.spawnReels();

        this.setupNewOutcome();
    },

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
            });
    },

    stopReelsQuickly: function() {
        for(var i=0; i<this.reelEntities.length; i++) {
            this.reelEntities[i].stopAt(this.reels[i]);
        }
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
