var paper = Raphael("canvas", 821, 621);
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

var clock = paper.set();
var transform = "m0,-1,-1,0,400,300";

clock.push(dots(250, 60));
clock.push(dots(200, 60));
clock.push(dots(150, 60));

// var seconds = paper.path().attr({ hand: [250, 0 * Math.PI / 3, 0], "stroke-width": "20px"});
var seconds = {
    r: 250,
    hue: 0,
    ticks: 60,
    seconds: 0,

    path: paper.path().attr({hand: [250, 0, 0], "stroke-width": "20px"}),

    set: function(s) {
        this.path.animate({hand: [this.r, 2 * Math.PI * s / this.ticks, this.hue]}, 600, "<");
        this.seconds = s;
    },

    tick: function() {
        this.seconds++;

        var self = this;
        var cb = function() {};
        var effect = "elastic";

        if(this.seconds === this.ticks) {
            effect = "bounce";
            cb = function() { self.path.attr({ hand: [self.r, 0, 0] }) };
        }

        this.path.animate({hand: [this.r, 2 * Math.PI * this.seconds / this.ticks, this.hue]}, 400, effect, cb);
        if (this.seconds === this.ticks) this.seconds -= this.ticks;

    }
}
var minutes = paper.path().attr({ hand: [200, 3 * Math.PI / 2, 1/3], "stroke-width": "20px"});
var hours = paper.path().attr({ hand: [150, 3 * Math.PI / 2, 2/3], "stroke-width": "20px"});

clock.push(seconds.path);
clock.push(minutes);
clock.push(hours);

clock.transform(transform);

// seconds.animate({hand: [250, 2 * Math.PI / 3, 0]}, 800, "<");
var now = new Date();

// seconds.set(now.getSeconds());
seconds.set(57);
function tick() {
    seconds.tick();
}
setInterval(tick, 1000);

function dots(r, cnt) {
    var dots = paper.set();
    for(var d = 0; d < cnt; d++) {
        dots.push(paper.circle(Math.cos(2 * Math.PI * d / cnt) * r, 
                               Math.sin(2 * Math.PI * d / cnt) * r, 
                               2).attr({fill: "#aaaaaa", "stroke-width": "0px"}));
    }
    return dots;
}
