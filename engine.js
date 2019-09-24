"use strict";

function mod(a, b) {
    if (a >= 0) {
        return a % b;
    }
    return b - (-a % b);
}

function between(min, max, num) {
    return Math.max(min, Math.min(max, num));
}

function getFrame(imageArray, fps, timestamp) {
    return imageArray[
        Math.trunc((timestamp * fps / 1000) % imageArray.length)
    ];
}

var Base = {
    init: function(props = {}) {
        var self = this;
        Object.keys(props).forEach(function (key) {
            self[key] = props[key];
        });
        this.postInit(props);
    },

    postInit: function() {},

    create: function() {
        var newObj = Object.create(this);
        this.init.apply(newObj, arguments);
        return newObj;
    },

    copy: function(props = {}) {
        var self = this;
        var newObj = Object.create(Object.getPrototypeOf(this));
        Object.keys(this).forEach(function (key) {
            newObj[key] = self[key];
        });
        Object.keys(props).forEach(function (key) {
            newObj[key] = props[key];
        });
        return newObj;
    },
}

var Obj = Base.create({
    x: 0,
    y: 0,
    sprite: null,
    layer: 10,
    scene: null,

    init: function(props = {}) {
        Base.init.apply(this, arguments);
        if (this.hasOwnProperty('sprite')) {
            if (!this.hasOwnProperty('width')) {
                this.width = this.sprite.width;
            }
            if (!this.hasOwnProperty('height')) {
                this.height = this.sprite.height;
            }
        }
    },

    draw: function(context, time, interval) {
        this.step(interval, time);
        if (this.sprite == null) {
            return;
        }
        context.drawImage(this.sprite, this.x, this.y);
    },

    step: function(interval, time) {},
});

var Scene = Base.create({
    init: function(width = 200, height = 200) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width = width;
        this.canvas.height = this.height = height;
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.objects = [];
        this.layers = [];
        this.shouldStop = false;

        this.dragging = null;
        this.dragX = null;
        this.dragY = null;
    },

    add: function(...objects) {
        var self = this;
        objects.forEach(function(object) {
            if (!self.layers[object.layer]) {
                self.layers[object.layer] = [];
            }
            self.layers[object.layer].push(object);
            self.objects.push(object);
            object.scene = self;
        });
    },

    draw: function(time, interval) {
        var self = this;
        this.layers.forEach(function(layer) {
            layer.forEach(function(object) {
                object.draw(self.context, time, interval);
            });
        });
    },

    launch: function() {
        var self = this;
        var lastTime = null;
        function loop(time) {
            if (self.shouldStop) {
                self.shouldStop = false;
                return;
            }
            self.draw(time, lastTime ? (time - lastTime) : 0);
            lastTime = time;
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    },

    halt: function() {
        this.shouldStop = true;
    },

    captureDrag: function() {
        var self = this;

        function down(event) {
            var coords = self.convertEventCoords(event);
            var x = coords[0];
            var y = coords[1];
            self.dragX = x;
            self.dragY = y;
            self.dragging = self.objects.filter(function(object) {
                return ((object.drag || object.startDrag || object.endDrag)
                        && object.width && object.height
                        && object.x < x && object.y < y
                        && object.x + object.width > x
                        && object.y + object.height > y);
            });
            self.dragging.forEach(function (object) {
                if (object.startDrag) {
                    object.startDrag(x, y, event);
                }
            });
        }

        function move(event) {
            if (self.dragging == null) {
                return;
            }
            var coords = self.convertEventCoords(event);
            var x = coords[0];
            var y = coords[1];
            var diffX = x - self.dragX;
            var diffY = y - self.dragY;
            self.dragX = x;
            self.dragY = y;
            self.dragging.forEach(function(object) {
                if (object.drag) {
                    object.drag(diffX, diffY, event, x, y);
                }
            });
        }

        function up(event) {
            if (self.dragging === null) {
                return;
            }
            var coords = self.convertEventCoords(event);
            var x = coords[0];
            var y = coords[1];
            self.dragging.forEach(function (object) {
                if (object.endDrag) {
                    object.endDrag(x, y, event);
                }
            });
            self.dragging = null;
        }

        this.canvas.addEventListener('mousedown', down);
        this.canvas.addEventListener('touchstart', down);
        this.canvas.addEventListener('mousemove', move);
        this.canvas.addEventListener('touchmove', move);
        this.canvas.addEventListener('mouseup', up);
        this.canvas.addEventListener('mouseleave', up);
        this.canvas.addEventListener('touchend', up);
        this.canvas.addEventListener('touchcancel', up);
    },

    convertEventCoords: function(event) {
        var absX, absY;
        if (event.touches && event.touches.length) {
            absX = event.touches[0].pageX;
            absY = event.touches[0].pageY;
        } else {
            absX = event.clientX;
            absY = event.clientY;
        }
        var rect = this.canvas.getBoundingClientRect();
        var x = (absX - rect.x) / rect.width * this.canvas.width;
        var y = (absY - rect.y) / rect.height * this.canvas.height;
        return [x, y];
    },
});

var currentTrack = null;

var Track = Base.create({
    start: function() {
        if (currentTrack) {
            currentTrack.finish();
        }
        currentTrack = this;
        document.title = this.title;
        this.player = new Audio('sound/' + this.music);
        this.player.loop = true;
        this.player.play();
        this.scene = Scene.create(this.background.width, this.background.height);
        document.getElementById('menu').style.display = 'none';
        document.body.appendChild(this.scene.canvas);
        this.backgroundObj = Obj.create({sprite: this.background, layer: 1});
        this.scene.add(this.backgroundObj);
        this.prepare();
        this.scene.launch();
    },

    finish: function() {
        this.player.pause();
        this.scene.canvas.remove();
    },
});
