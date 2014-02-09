ig.module('game.entities.reel')
.requires('impact.entity')
.defines(function() {

    EntityReel = ig.Entity.extend({

        _wmIgnore: true,
        zIndex: 1024,
        size: { x: 50, y: 78 },
        background: new ig.Image('media/reel-background.png'),
        foreground: new ig.Image('media/reel-foreground.png'),
        timer: null, // Used to scroll symbols.
        symbolOrder: ['gold', 'cherry', 'bar'],
        symbolDrawPositions: [],
        symbolTilesheet: new ig.Image('media/symbols.png'),
        symbolSpacing: 3,
        symbolDrawOffsetX: 3,
        scrollSpeed: 600,
        yStopCoord: null, // Calculated in init.
        stopping: false,
        targetSymbol: {
            name: '',
            index: -1
        },
        allowOneMoreShift: false,

        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.timer = new ig.Timer();
            this.timer.pause();
            this.timer.pausedAt = 2.30; // Start lined up on cherries.
            this.yStopCoord = this.pos.y + this.size.y/2 - this.symbolTilesheet.height/2;
        },

        update: function() {
            if(!this.stopping) {
                this.updateSymbolDrawPositions();
            }
            else if (this.stopping && this.allowOneMoreShift) {
                this.updateSymbolDrawPositions();
                // Prevent additional shifts from occuring.
                if(this.symbolDrawPositions[this.targetSymbol.index].y < this.yStopCoord) {
                    this.allowOneMoreShift = false;
                }
            }
            else if((this.stopping && !this.allowOneMoreShift && !this.targetSymbolHasReachedDestination())) {
                this.updateSymbolDrawPositions();
            }
            else if(this.stopping && !this.allowOneMoreShift && this.targetSymbolHasReachedDestination()) {
                this.onDestinationReached();
            }
        },

        draw: function() {
            this.background.draw(this.pos.x, this.pos.y);
            for(var i=0; i<this.symbolOrder.length; i++) {
                this.symbolTilesheet.drawTile(this.symbolDrawPositions[i].x, this.symbolDrawPositions[i].y, i, 44);
            }
            this.foreground.draw(this.pos.x, this.pos.y);
            this.drawOverSymbolBleed();
            this.parent();
        },

        drawOverSymbolBleed: function() {
            var width = this.size.x;
            var height = this.symbolTilesheet.height + this.symbolSpacing;
            // Above
            ig.system.context.clearRect(
                this.pos.x * ig.system.scale,
                (this.pos.y - height) * ig.system.scale,
                width * ig.system.scale,
                height * ig.system.scale
            );
            // Below
            ig.system.context.clearRect(
                this.pos.x * ig.system.scale,
                (this.pos.y + this.size.y) * ig.system.scale,
                width * ig.system.scale,
                height * ig.system.scale
            );
        },

        onDestinationReached: function() {
            this.timer.pause();

            // Move symbols back if necessary so that all reels will line up.
            index = this.targetSymbol.index;
            if(this.symbolDrawPositions[index].y > this.yStopCoord) {
                var difference = this.symbolDrawPositions[index].y - this.yStopCoord;
                for(var i=0; i<this.symbolDrawPositions.length; i++) {
                    this.symbolDrawPositions[i].y -= difference;
                }
            }
        },

        updateSymbolDrawPositions: function() {
            var time = this.timer.delta();
            for(var i=0; i<this.symbolOrder.length; i++) {
                var x = this.pos.x + this.symbolDrawOffsetX;
                var y = this.pos.y + (i*this.symbolTilesheet.height) + (i*this.symbolSpacing) + (time*this.scrollSpeed);
                var groupHeight = this.symbolOrder.length * (this.symbolTilesheet.height + this.symbolSpacing);
                while(y >= this.pos.y + this.size.y) {
                    y -= groupHeight;
                }
                this.symbolDrawPositions[i] = { x: x, y: y };
            }
        },

        targetSymbolHasReachedDestination: function() {
            var index = this.targetSymbol.index;
            if(this.symbolDrawPositions[index].y >= this.yStopCoord) {
                return true;
            } else {
                return false;
            }
        },

        start: function() {
            this.timer.unpause();
            this.stopping = false;
        },

        stopAt: function(symbol) {
            this.stopping = true;
            this.targetSymbol.name = symbol;
            this.targetSymbol.index = this.symbolOrder.indexOf(symbol);
            if(this.symbolDrawPositions[this.targetSymbol.index].y > this.yStopCoord) {
                this.allowOneMoreShift = true;
            }
        }

    });

});