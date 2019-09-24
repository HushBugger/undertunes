"use strict";

function fadeInMusic(player) {
    for (var i = 40; i <= 400; i += 40) {
        (function() {
            // closures can be a pain
            var vol = i / 400;
            setTimeout(function() {
                player.volume = vol;
            }, i);
        })();
    }
}

var Home = Track.create({
    title: "Home",
    music: 'home.mp3',
    background: images.bedroom,

    prepare: function() {
        this.altPlayer = new Audio('sound/home-alt.mp3');
        this.altPlayer.loop = true;
        this.altPlayer.volume = 0;
        this.altPlayer.play();

        var LampButton = Obj.create({
            x: 177,
            y: 31,
            width: 15,
            height: 38,
            lastToggle: null,

            startDrag: function(x, y, event) {
                if (this.lastToggle !== null
                    && event.timeStamp - this.lastToggle < 500) {
                    return;
                }
                this.lastToggle = event.timeStamp;
                if (Home.backgroundObj.sprite === images.bedroom) {
                    Home.altPlayer.currentTime = Home.player.currentTime;
                    Home.player.volume = 0;
                    fadeInMusic(Home.altPlayer);
                    Home.backgroundObj.sprite = images.bedroomOccupied;
                } else {
                    Home.player.currentTime = Home.altPlayer.currentTime;
                    Home.altPlayer.volume = 0;
                    fadeInMusic(Home.player);
                    Home.backgroundObj.sprite = images.bedroom;
                }
            },
        });

        this.scene.add(LampButton);

        this.scene.captureDrag();
    },

    finish: function() {
        Track.finish.apply(this, arguments);
        this.altPlayer.pause();
    },
})
