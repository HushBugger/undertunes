"use strict";

var Dog = Obj.create({
    sprite: images.lcar0,
    x: 145,
    y: 125,
    minX: 113,
    minY: 50,
    maxX: 156,
    maxY: 154,
    lastX: null,
    lastY: null,
    direction: 'left',

    step: function(interval, time) {
        var hspeed = City.arrowState.ArrowRight
            - City.arrowState.ArrowLeft
            + City.mouseState[0];
        var vspeed = City.arrowState.ArrowDown
            - City.arrowState.ArrowUp
            + City.mouseState[1];

        this.lastX = this.x;
        this.lastY = this.y;

        this.x += hspeed * interval / 16;
        this.x = mod(this.x, this.scene.width);
        this.y += vspeed * interval / 16;
        this.y = mod(this.y, this.scene.height);

        if (hspeed < 0) {
            this.direction = 'left';
        } else if (hspeed > 0) {
            this.direction = 'right';
        }
        if (hspeed || vspeed) {
            if (this.direction === 'left') {
                this.sprite = getFrame([images.lcar0, images.lcar1], 5, time);
            } else {
                this.sprite = getFrame([images.rcar0, images.rcar1], 5, time);
            }
        }

        if (this.x < this.minX && this.y < this.minY) {
            if (this.lastX < this.minX || this.lastX > this.maxX) {
                this.y = this.minY;
            } else {
                this.x = this.minX;
            }
        } else if (this.x < this.minX && this.y > this.maxY) {
            if (this.lastX < this.minX || this.lastX > this.maxX) {
                this.y = this.maxY;
            } else {
                this.x = this.minX;
            }
        } else if (this.x > this.maxX && this.y < this.minY) {
            if (this.lastX < this.minX || this.lastX > this.maxX) {
                this.y = this.minY;
            } else {
                this.x = this.maxX;
            }
        } else if (this.x > this.maxX && this.y > this.maxY) {
            if (this.lastX < this.minX || this.lastX > this.maxX) {
                this.y = this.maxY;
            } else {
                this.x = this.maxX;
            }
        }
    },

    draw: function(context, time, interval) {
        this.step(interval, time);
        context.drawImage(this.sprite, this.x, this.y);
        context.drawImage(this.sprite, this.x - this.scene.width, this.y);
        context.drawImage(this.sprite, this.x, this.y - this.scene.height);
        context.drawImage(this.sprite, this.x - this.scene.width,
                          this.y - this.scene.height);
    },
})

var City = Track.create({
    music: 'city.mp3',
    background: images.city,

    mouseState: [0, 0],
    arrowState: {
        ArrowLeft: false,
        ArrowUp: false,
        ArrowRight: false,
        ArrowDown: false,
    },

    prepare: function() {
        this.scene.add(Dog);
        this.scene.add(Obj.create({sprite: images.cityOverlay, layer: 10}));
        this.backgroundObj.drag = function(x, y, event, absX, absY) {
            City.mouseState = [4 * absX / this.scene.width - 2,
                               4 * absY / this.scene.height - 2];
        };
        this.backgroundObj.endDrag = function() {
            City.mouseState = [0, 0];
        }
        this.scene.captureDrag();
        document.addEventListener('keydown', function(event) {
            if (Object.keys(City.arrowState).includes(event.key)) {
                City.arrowState[event.key] = true;
            }
        });
        document.addEventListener('keyup', function(event) {
            if (Object.keys(City.arrowState).includes(event.key)) {
                City.arrowState[event.key] = false;
            }
        });
    }
})
