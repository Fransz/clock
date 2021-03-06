/**
 * Clock.js
 *
 * @author Frans Jaspers <fjaspers@xs4all.nl>
 * @see
 *
 * This clock shows passed hours:minutes:seconds, and the current day:month.
 */

/**
 * Add a method to the Object object for setting another objects prototype.
 */
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

/**
 * Get the days in a given month by getting the day of the month, of day 0 of the next month.
 *
 * @param month The month for which we want to know the days in the month. 0 .. 11.
 * @param year The year for which we want to know the days in the given month. A four digit year.
 *
 * @return The number of days in the given month.
 */
function daysInMonth(month, year) {
    if (month == 11) month = -1, year -= 1;
    return new Date(year, month + 1, 0).getDate();
}

/**
 * A custom attribute of raphaels paper.
 * It returns an oobject with two attributes, path and fill.
 * The attribute can be animated.
 */
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
    /**
     * Initializes a hand with the given attributes, or sensible defaults.
     */
    init: function(attr) {
        this.r = attr.r || 250;
        this.hue = attr.hue || 0;
        this.ticks = attr.ticks || 60;
        this.offset = attr.offset || 0;
        this.htmlElement = attr.htmlElement;

        clock.push(this.drawDots());
        this.path = paper.path().attr({hand: [this.r, 0, 0], "stroke-width": "20px"});
        clock.push(this.path);
    },

    /**
     * The write modifier.
     * It is called before we write the value of this hand as text.
     * The default write modifier adds leading zero's.
     */
    writeModifier: function(v) {
        return v < 10 ? "0" + v : v;
    },

    /*
     * Set hand and value.
     */
    set: function(s) {
        if(s > this.ticks) s = this.ticks;
        if(s < 0) s = 0;

        // Set the value, we want to tick to that, show value.
        this.value = s;
        var tickTo = this.value;

        // Value on its limit, sme adjustments.
        if (this.value === this.ticks)  {
            this.value = 0;
            tickTo -= 0.001;
            effect = "";
        }

        this.path.animate({hand: [this.r, 2 * Math.PI * tickTo / this.ticks, this.hue]}, 600, "<");
        this.htmlElement.innerHTML = this.writeModifier(this.value, this.ticks);
    },

    /**
     * The ticker.
     */
    tick: function() {
        var self = this;
        var cb = function() {};
        var effect = "elastic";

        // Increase the value, we want to tick to that, show value.
        this.value++;
        var tickTo = this.value;

        // Value on its limit, sme adjustments.
        if (this.value === this.ticks)  {
            this.value = 0;
            tickTo -= 0.001;
            effect = "";
        }

        // Reset our hand after ticking. On different ticks for time and date.
        if(this.value === this.offset) {
            effect = "";
            cb = function() { self.path.attr({ hand: [self.r, 2 * Math.PI * self.value / self.ticks, 0] }) };
        }

        // tick
        this.path.animate({hand: [this.r, 2 * Math.PI * tickTo / this.ticks, this.hue]}, 400, effect, cb);
        this.htmlElement.innerHTML = this.writeModifier(this.value, this.ticks);
    },


    /**
     *  draws the tick nr of dots for this hand on the clock
     */
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

    /**
     * Clears all dots for this hand.
     */
    clearDots: function() {
        for(var d = 0; d < this.dots.length; d++) {
            this.dots[d].node.remove();
        }
        this.dots.clear();
    }
}

var seconds = Object.create(hand);
seconds.init({r: 250, hue: 0, ticks: 60, offset: 0, htmlElement: document.getElementById("seconds")})
hands.push(seconds);


var minutes = Object.create(hand);
minutes.init({r: 200, hue: 1/5, ticks: 60, offset: 0, htmlElement: document.getElementById("minutes")})
hands.push(minutes);


var hours = Object.create(hand);
hours.init({r: 150, hue: 2/5, ticks: 24, offset: 0, htmlElement: document.getElementById("hours")})
hands.push(hours);


var days = Object.create(hand);
days.init({r: 100, hue: 3/5, ticks: daysInMonth(now.getMonth(), now.getFullYear()), offset: 1, htmlElement: document.getElementById("days")})
hands.push(days);
days.writeModifier = function(v, t) {
    return v === 0 ? t : v;
}

var months = Object.create(hand);
months.init({r: 50, hue: 4/5, ticks: 12, offset: 1, htmlElement: document.getElementById("months")})
hands.push(months);
months.writeModifier = function(v) {
    return ["december", "januari", "februari", "maart", "april", "mei", "juni", 
            "juli", "augustus", "september", "oktober", "november"][v];
}

// transform everything.
clock.transform(transform);

seconds.set(now.getSeconds());
minutes.set(now.getMinutes());
hours.set(now.getHours());
days.set(now.getDate());
months.set(now.getMonth() + 1);

var year = now.getYear();
document.getElementById("years").innerHTML = now.getFullYear();

// 30 november
/*
 * seconds.set(57);
 * minutes.set(59);
 * hours.set(23);
 * days.ticks = daysInMonth(10, now.getFullYear());
 * days.set(30);
 * months.set(11);
 */

// 31 december,
/*
 * seconds.set(57);
 * minutes.set(59);
 * hours.set(23);
 * days.ticks = daysInMonth(11, now.getFullYear());
 * days.set(31);
 * months.set(12);
 */


/**
 * The ticker function. It is called every 1000ms.
 * It ticks all hands starting with the seconds hand, until a hand was not reset.
 */
function tick() {
    // Tick all hands until the current hand was not reset.
    var theHand = 0;
    do {
        hands[theHand].tick();
    } while (hands[theHand].value === hands[theHand].offset && ++theHand < hands.length)


    // If we have a new month we have to recalculate days.
    if(days.value === days.offset) {
       days.ticks = daysInMonth(months.value, year);

       days.clearDots();
       clock.push(days.drawDots());
       clock.transform(transform);
    }
}
setInterval(tick, 1000);
