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

paper.rect(0, 0, 800, 600).attr({fill: "black"});

var now = new Date();

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

paper.customAttributes.hand = function(r, a, color) {

    var hsb = "hsb(".concat(color, ",", a / (2 * Math.PI) , ", .75)");
    var large = a > Math.PI  && a < 2 * Math.PI ? 1 : 0;
    var ex = Math.cos(a) * r;
    var ey = -Math.sin(a) * r;

    return {
        path : [ ["M", r, 0], ["A", r, r, 0, large, 0, ex, ey] ],
        stroke: hsb
    };
}


// Our hands.
var hand = {
    writeModifier: function(v) {
        return v < 10 ? "0" + v : v;
    },

    set: function(s) {
        this.path.animate({hand: [this.r, 2 * Math.PI * s / this.ticks, this.hue]}, 600, "<");
        this.value = s;

        this.htmlElement.innerHTML = this.writeModifier(this.value);
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

        this.htmlElement.innerHTML = this.writeModifier(this.value);
    },


    drawDots: function () {
        var dots = paper.set();
        for(var d = 0; d < this.ticks; d++) {
            dots.push(paper.circle(Math.cos(2 * Math.PI * d / this.ticks) * this.r, 
                                Math.sin(2 * Math.PI * d / this.ticks) * this.r, 
                                2).attr({fill: "#aaaaaa", "stroke-width": "0px"}));
        }
        this.dots = dots;
        return dots;
    },

    clearDots: function() {
        for(var d = 0; d < this.dots.length; d++) {
            this.dots[d].node.remove();
        }
        this.dots.clear();
    }
}


var seconds = Object.create(hand);
seconds.r = 250;
seconds.hue = 0;
seconds.ticks = 60;
seconds.value = 0;
seconds.htmlElement = document.getElementById("seconds");

clock.push(seconds.drawDots());
seconds.path = paper.path().attr({hand: [250, 0, 0], "stroke-width": "20px"});
clock.push(seconds.path);

hands.push(seconds);


var minutes = Object.create(hand);
minutes.r = 200;
minutes.hue = 1/5;
minutes.ticks = 60;
minutes.value = 0;
minutes.htmlElement = document.getElementById("minutes");

clock.push(minutes.drawDots());
minutes.path = paper.path().attr({hand: [200, 0, 0], "stroke-width": "20px"});
clock.push(minutes.path);

hands.push(minutes);


var hours = Object.create(hand);
hours.r = 150;
hours.hue = 2/5;
hours.ticks = 24;
hours.value = 0;
hours.htmlElement = document.getElementById("hours");

clock.push(hours.drawDots());
hours.path = paper.path().attr({hand: [150, 0, 0], "stroke-width": "20px"});
clock.push(hours.path);

hands.push(hours);


var days = Object.create(hand);
days.r = 100;
days.hue = 3/5;
days.ticks = daysInMonth(now.getMonth(), now.getYear());
days.value = 0;
days.htmlElement = document.getElementById("days");
days.writeModifier = function(v) {
    return ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"][now.getDay()] + " " + v;
}

clock.push(days.drawDots());
days.path = paper.path().attr({hand: [100, 0, 0], "stroke-width": "20px"});
clock.push(days.path);

hands.push(days);


var months = Object.create(hand);
months.r = 50;
months.hue = 4/5;
months.ticks = 12;
months.value = 0;
months.htmlElement = document.getElementById("months");
months.writeModifier = function(v) {
    return ["januari", "februari", "maart", "april", "mei", "juni", 
            "juli", "augustus", "september", "oktober", "november", "december"][now.getMonth()];
}

clock.push(months.drawDots());
months.path = paper.path().attr({hand: [50, 0, 0], "stroke-width": "20px"});
clock.push(months.path);

hands.push(months);

// transform everything.
clock.transform(transform);

seconds.set(now.getSeconds());
minutes.set(now.getMinutes());
hours.set(now.getHours());
days.set(now.getDate());
months.set(now.getMonth());

var year = now.getYear();
document.getElementById("years").innerHTML = now.getFullYear();

/*
 * seconds.set(57);
 * minutes.set(59);
 * hours.set(23);
 * days.set(29);
 * months.set(11);
 */


function tick() {
    // Tick all neccassary hands.
    var theHand = 0;
    do {
        hands[theHand].tick();
    } while (hands[theHand].value === 0 && ++theHand < hands.length)


    // If we have a new month we have to recalculate days.
    if(days.value === 0) {
       days.ticks = daysInMonth(months.value, year);
       days.ticks = 4;

       days.clearDots();
       clock.push(days.drawDots());
       clock.transform(transform);
    }
}
setInterval(tick, 1000);
