"use strict";

var Rock = Obj.create({
    sprite: images.rock,
    maxX: 105,

    postInit: function() {
        this.virtualX = this.x;
    },

    drag: function(x, y) {
        this.virtualX += x;
        this.x = between(this.minX, this.maxX, this.virtualX);
    },

    endDrag: function() {
        this.virtualX = this.x;
    },
});

var ThirdRock = Rock.create({
    minX: 5,
    x: 105,
    y: 119,

    drag: function() {
        Rock.drag.apply(this, arguments);
        Ruins.player.volume = between(
            0, 1, (this.x - this.minX) / (this.maxX - this.minX)
        );
    },
});

var FourthRock = Rock.create({
    x: 45,
    minX: 45,
    y: 159,
    endTime: null,
    letGo: false,

    startDrag: function() {
        this.endTime = null;
    },

    endDrag: function(x, y, event) {
        Rock.endDrag.apply(this, arguments);
        this.letGo = true;
    },

    step: function(interval, time) {
        if (this.letGo) {
            this.letGo = false;
            this.endTime = time;
        }
        if (this.x > this.minX
            && this.endTime
            && time - this.endTime >= 1000) {
            this.x -= interval / 50;
            if (this.x <= this.minX) {
                this.x = this.minX;
                this.endTime = null;
            }
            this.virtualX = this.x;
        }
    },
});

var Ruins = Track.create({
    title: "Ruins",
    music: 'ruins.mp3',
    background: images.ruins,

    prepare: function() {
        this.scene.captureDrag();
        this.scene.add(
            Rock.create({minX: 25, x: 25, y: 79}),
            ThirdRock,
            FourthRock,
        );
    },
})
