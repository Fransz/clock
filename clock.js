if(typeof Object.create !== "function") {
    Object.create = function(obj) {
        var F = function () {};
        F.prototype = o;
        return new F();
    }
}

// Globals 
var paper = Raphael("canvas", 821, 621);

var clock = paper.set();
var hands = [];
var transform = "m0,-1,-1,0,400,300";

paper.rect(10, 10, 810, 610).attr({fill: "black"});



paper.customAttributes.hand = function(r, a, color) {

    var hsb = "hsb(".concat(color, ",", a / (2 * Math.PI) , ", .75)");
    var large = a > Math.PI  && a < 2 * Math.PI ? 1 : 0;
    var ex = Math.cos(a) * r;
    var ey = -Math.sin(a) * r;

    return {
        // path : "M" + r + ",0 A" + r + "," + r + " 0 " + large + ",0 " + ex + "," + ey,
        path : [ ["M", r, 0], ["A", r, r, 0, large, 0, ex, ey] ],
        stroke: hsb
    };
}


// Our hands.
var hand = {
    set: function(s) {
        this.path.animate({hand: [this.r, 2 * Math.PI * s / this.ticks, this.hue]}, 600, "<");
        this.value = s;
    },

    tick: function() {
        this.value++;

        var self = this;
        var cb = function() {};
        var effect = "elastic";

        if(this.value === this.ticks) {
            effect = "bounce";
            cb = function() { self.path.attr({ hand: [self.r, 0, 0] }) };
        }

        this.path.animate({hand: [this.r, 2 * Math.PI * this.value / this.ticks, this.hue]}, 400, effect, cb);
        if (this.value === this.ticks) this.value -= this.ticks;

    },

    dots: function () {
        var dots = paper.set();
        for(var d = 0; d < this.ticks; d++) {
            dots.push(paper.circle(Math.cos(2 * Math.PI * d / this.ticks) * this.r, 
                                Math.sin(2 * Math.PI * d / this.ticks) * this.r, 
                                2).attr({fill: "#aaaaaa", "stroke-width": "0px"}));
        }
        return dots;
    }
}


var seconds = Object.create(hand);
seconds.r = 250;
seconds.hue = 0;
seconds.ticks = 60;
seconds.value = 0;

clock.push(seconds.dots());
seconds.path = paper.path().attr({hand: [250, 0, 0], "stroke-width": "20px"});
clock.push(seconds.path);

hands.push(seconds);


var minutes = Object.create(hand);
minutes.r = 200;
minutes.hue = 1/3;
minutes.ticks = 60;
minutes.value = 0;

clock.push(minutes.dots());
minutes.path = paper.path().attr({hand: [200, 0, 0], "stroke-width": "20px"});
clock.push(minutes.path);

hands.push(minutes);


var hours = Object.create(hand);
hours.r = 150;
hours.hue = 2/3;
hours.ticks = 24;
hours.value = 0;

clock.push(hours.dots());
hours.path = paper.path().attr({hand: [150, 0, 0], "stroke-width": "20px"});
clock.push(hours.path);

hands.push(hours);


// transform everything.
clock.transform(transform);


// Time.
var now = new Date();
seconds.set(now.getSeconds());
minutes.set(now.getMinutes());
hours.set(now.getHours());
/*
 * seconds.set(57);
 * minutes.set(59);
 * hours.set(23);
 */

function tick() {
    var theHand = 0;
    do {
        hands[theHand].tick();
    } while (hands[theHand].value === 0 && ++theHand < hands.length)
}
setInterval(tick, 1000);
