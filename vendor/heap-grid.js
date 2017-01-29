(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = class Grid {

    constructor (rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.build();
    }

    build () {
        this.grid = [];
        for (var r = 0; r < this.rows; r++) {
            this.grid.push([]);
            for (var c = 0; c < this.columns; c++) {
                this.grid[r].push(true);
            }
        }
    }

    log () {
        var gridStr = this.grid.map(r => 
            r.map(rc => '| ' + (rc ? ' ': 'X') + ' |')
            .join('')
        ).join('\n')
        console.log(gridStr);
    }

    available (r, c, x, y) {
        var _this = this;
        var isAvailable = true;

        function spotAvailable (ry,cx) {
            if (typeof _this.grid[ry] !== 'object') return false;
            if (typeof _this.grid[ry][cx] !== 'boolean') return false;
            return _this.grid[ry][cx];
        }

        for (var cx = c; cx < c + x; cx++) {
            for (var ry = r; ry < r + y; ry++) {
                if (!spotAvailable(ry,cx)) {
                    isAvailable = false;
                }
            }
        }

        return isAvailable
    }

    block (r, c, x, y) {
        for (var cx = c; cx < c + x; cx++) {
            for (var ry = r; ry < r + y; ry++) {
                this.grid[ry][cx] = false;
            }
        }
    }

    find (x, y) {
        for (var c = 0; c < this.columns; c++) {
            for (var r = 0; r < this.rows; r++) {
                if (this.available(r, c, x, y)) {
                    this.block(r, c, x, y);
                    return {
                        row: r,
                        column: c
                    }
                }
            }
        }
    }
}
},{}],2:[function(require,module,exports){
var HeapGrid = window.HeapGrid || {};

HeapGrid = require('./pin');

window.HeapGrid = HeapGrid;
module.exports = HeapGrid;
},{"./pin":3}],3:[function(require,module,exports){
const Grid = require('./grid');
const gridType = require('./select');
const GROUP_LENGTH = 6;

class Groups {
    constructor (size, width) {
        this.size = size;
        this.groupSize = size * 2;
        this.maxWidth = width;
        this.groups = {};
    }

    create () {
        var grid = new Grid(4,4);
        var type = gridType();
        return type.map((c, i) =>  {
            var styles = {};
            var x = c[0];
            var y = c[1];
            styles.width = x === 1 ? this.size / 2 : this.size;
            styles.height = y === 1 ? this.size / 2 : this.size;
            var rc = grid.find(x, y);
            console.log(x, y, rc);
            styles.top = rc.row * (this.size / 2);
            styles.left = rc.column * (this.size / 2);
            return styles;
        });
    }

    place (i) {
        var group = Math.floor(i / GROUP_LENGTH);
        var index = i % GROUP_LENGTH;

        if (!this.groups[group] && !this.groups[group - 1]) {
            this.groups[group] = {};
            this.groups[group].items = this.create();
            this.groups[group].top = 0;
            this.groups[group].left = 0;
        }

        if (!this.groups[group]) {
            this.groups[group] = {}
            this.groups[group].items = this.create();
            this.groups[group].top = this.groups[group - 1].top;
            this.groups[group].left = this.groups[group - 1].left + this.groupSize;
            if (this.groups[group].left + this.groupSize > this.maxWidth) {
                this.groups[group].top = this.groups[group - 1].top + this.groupSize;
                this.groups[group].left = 0;
            }
        }

        var place = this.groups[group].items[index];

        return {
            top: this.groups[group].top + place.top,
            left: this.groups[group].left + place.left,
            width: place.width,
            height: place.height
        }
    }
}



module.exports = class Pin {

    constructor (element, opts) {
        opts = opts || {};
        this.element = element;
        this.size = opts.size || 250;
        this.groupSize = this.size * 2;
        this.limit = opts.limit;
        this.reset();
    }

    reset () {
        this.rect = this.element.getBoundingClientRect();
        this.groups = new Groups(this.size, this.rect.width);
        this.pinned = 0;
    }

    place () {
        return this.groups.place(this.pinned++);
    }
}


},{"./grid":1,"./select":4}],4:[function(require,module,exports){
const Grid = require('./grid');
const permutator = require('./utils/permutator');
const random = require('./utils/random');
const big = [2,2];
const wide = [2,1];
const tall = [1,2];

var validGrids = (function gridPermutations () {
    var success = [];
    var invalid = 0;
    var tests = permutator([big,big,wide,wide,tall,tall]);

    tests.map(function (test) {
        try {
            var g = new Grid(4,4);
            test.map(function (sizes) {
                return g.find(sizes[0], sizes[1]);
            }).map(function (rc) {
                return rc.row && rc.column;
            });
            success.push(test);
        } catch (err) {
            ++invalid;
        }
    })

    console.log({
        success: success,
        invalid: invalid
    });

    return success;
})();

module.exports = () => random(validGrids);
},{"./grid":1,"./utils/permutator":5,"./utils/random":6}],5:[function(require,module,exports){
// STACK OVERFLOW
// http://stackoverflow.com/questions/9960908/permutations-in-javascript
// delimited

module.exports = function permutator(inputArr) {
  var results = [];
  function permute(arr, memo) {
    var cur, memo = memo || [];
    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }
    return results;
  }
  return permute(inputArr);
}
},{}],6:[function(require,module,exports){
const rand = (min, max) => min + Math.floor(Math.random() * max);

module.exports = arr => {
    if (!arr.length) return false;
    const index = rand(0, arr.length - 1);
    return arr[index];
}
},{}]},{},[2]);
