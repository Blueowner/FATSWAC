'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Platform = function Platform() {
    _classCallCheck(this, Platform);

    this.screen = {
        x: 750,
        y: 450
    };

    this.pref = {
        columns: 15,
        rows: 9
    };
};

var platform = new Platform();

var Keyboard = function () {
    function Keyboard() {
        _classCallCheck(this, Keyboard);

        this.keydown = {};
        this.lastKeydown = null;

        this.controller = {
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            LEFT: 37,
            ESC: 27
        };
    }

    _createClass(Keyboard, [{
        key: 'doKeydown',
        value: function doKeydown(e) {
            // Throttle 'keydown' registration to a maximum of one every 10 milliseconds
            if (this.lastKeydown && +new Date() - this.lastKeydown < 10) {
                return;
            }

            if (!this.keydown[e.keyCode]) {
                this.lastKeydown = +new Date();
                this.keydown[e.keyCode] = +new Date();
            }
        }
    }, {
        key: 'doKeyup',
        value: function doKeyup(e) {
            this.keydown[e.keyCode] = false;
        }
    }, {
        key: 'isKeyDown',
        value: function isKeyDown(code) {
            return this.keydown[code] || false;
        }
    }]);

    return Keyboard;
}();

var keyboard = new Keyboard();

var Game = function () {
    function Game() {
        _classCallCheck(this, Game);

        this.canvas = document.getElementById('screen');
        this.ctx = this.canvas.getContext('2d');

        this.state = 'GAME_INITIALIZED';

        this.board = [];

        this.rocks = [[3, 0], [4, 0], [9, 0], [14, 0], [9, 1], [14, 1], [0, 2], [4, 3], [5, 3], [8, 3], [5, 4], [8, 4], [12, 4], [13, 4], [2, 5], [3, 5], [6, 6], [10, 6], [11, 6], [1, 7], [6, 7]];

        this.bingo = new Bingo(0, 0);
    }

    _createClass(Game, [{
        key: 'init',
        value: function init() {
            this.canvas.height = platform.screen.y;
            this.canvas.width = platform.screen.x;

            for (var x = 0; x < platform.pref.columns; x++) {
                for (var y = 0; y < platform.pref.rows; y++) {
                    this.addBody(new Body('Ground', x, y, 'ground'));
                }
            }

            for (var i = 0; i < this.rocks.length; i++) {
                var x = this.rocks[i][0];
                var y = this.rocks[i][1];
                this.addBody(new Rock(x, y));
            }

            this.addBody(this.bingo);

            this.state = 'GAME_PLAYING';
        }
    }, {
        key: 'drawMap',
        value: function drawMap() {
            this.ctx.clearRect(0, 0, platform.screen.x, platform.screen.y);

            for (var i = 0; i < this.board.length; i++) {
                var body = this.board[i];
                var img = document.getElementById(body.image);

                this.ctx.beginPath();
                this.ctx.drawImage(img, body.getPosition().x * platform.screen.x / platform.pref.columns, body.getPosition().y * platform.screen.y / platform.pref.rows, platform.screen.x / platform.pref.columns, platform.screen.y / platform.pref.rows);
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            if (this.state == 'GAME_PLAYING') {
                this.drawMap();
            } else if (this.state == 'GAME_COMPLETED') {
                this.drawMap();

                var img = document.getElementById('youWon');
                this.ctx.drawImage(img, platform.screen.x / 2 - img.width / 2, 80);
                this.state = 'MENU_RESTART';
            } else if (this.state == 'BINGO_CRASHED') {} else if (this.state == 'MENU_RESTART') {
                this.state = 'GAME_PLAYING';
            }
        }
    }, {
        key: 'update',
        value: function update(game) {
            for (var i = 0; i < this.board.length; i++) {
                this.board[i].update(game);
            }

            if (platform.pref.columns * platform.pref.rows - this.rocks.length == this.bingo.getTrailLength() + 1) {
                this.state = 'GAME_COMPLETED';
            }

            for (var i = 0; i < this.board.length; i++) {
                if (this.bingo.collide(this.board[i])) {
                    this.bingo.reset();
                    this.board = this.board.filter(function (body) {
                        return body.name !== 'WalkedGround';
                    });
                }
            }
        }
    }, {
        key: 'addBody',
        value: function addBody(body) {
            this.board.push(body);
        }
    }]);

    return Game;
}();

var Body = function () {
    function Body(name, x, y, image) {
        _classCallCheck(this, Body);

        this.name = name;
        this.position = { x: x, y: y };

        this.size = {
            x: platform.screen.x / platform.pref.columns,
            y: platform.screen.y / platform.pref.rows
        };

        this.image = image;

        this.collider = false;
    }

    _createClass(Body, [{
        key: 'update',
        value: function update() {}
    }, {
        key: 'setPosition',
        value: function setPosition(x, y) {
            this.position = { x: x, y: y };
        }
    }, {
        key: 'getPosition',
        value: function getPosition() {
            return this.position;
        }
    }, {
        key: 'collide',
        value: function collide(body) {
            if (this === body) {
                return false;
            }

            if (!body.collider) {
                return false;
            }

            return this.getPosition().x === body.getPosition().x && this.getPosition().y === body.getPosition().y;
        }
    }]);

    return Body;
}();

var Rock = function (_Body) {
    _inherits(Rock, _Body);

    function Rock(x, y) {
        _classCallCheck(this, Rock);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Rock).call(this, 'Rock', x, y, 'rock'));

        _this.collider = true;

        _this.updatedAt;
        return _this;
    }

    return Rock;
}(Body);

var WalkedGround = function (_Body2) {
    _inherits(WalkedGround, _Body2);

    function WalkedGround(x, y) {
        _classCallCheck(this, WalkedGround);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(WalkedGround).call(this, 'WalkedGround', x, y, 'ground-2'));

        _this2.collider = true;
        return _this2;
    }

    return WalkedGround;
}(Body);

var Bingo = function (_Body3) {
    _inherits(Bingo, _Body3);

    function Bingo(x, y) {
        _classCallCheck(this, Bingo);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Bingo).call(this, 'Bingo', x, y, 'bingo'));

        _this3.collider = true;

        _this3.previousKeydown = {};
        _this3.trailLength = 0;
        return _this3;
    }

    _createClass(Bingo, [{
        key: 'update',
        value: function update(game) {
            if (keyboard.isKeyDown(keyboard.controller.UP) && this.previousKeydown[keyboard.controller.UP] != keyboard.keydown[keyboard.controller.UP]) {
                if (_get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y - 1 < 0) {
                    return;
                }
                this.previousKeydown[keyboard.controller.UP] = keyboard.keydown[keyboard.controller.UP];
                game.addBody(new WalkedGround(_get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y));
                this.trailLength++;
                _get(Object.getPrototypeOf(Bingo.prototype), 'setPosition', this).call(this, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y - 1);
            }

            if (keyboard.isKeyDown(keyboard.controller.RIGHT) && this.previousKeydown[keyboard.controller.RIGHT] != keyboard.keydown[keyboard.controller.RIGHT]) {
                if (_get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x + 1 >= platform.pref.columns) {
                    return;
                }
                this.previousKeydown[keyboard.controller.RIGHT] = keyboard.keydown[keyboard.controller.RIGHT];
                game.addBody(new WalkedGround(_get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y));
                this.trailLength++;
                _get(Object.getPrototypeOf(Bingo.prototype), 'setPosition', this).call(this, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x + 1, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y);
            }

            if (keyboard.isKeyDown(keyboard.controller.DOWN) && this.previousKeydown[keyboard.controller.DOWN] != keyboard.keydown[keyboard.controller.DOWN]) {
                if (_get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y + 1 >= platform.pref.rows) {
                    return;
                }
                this.previousKeydown[keyboard.controller.DOWN] = keyboard.keydown[keyboard.controller.DOWN];
                game.addBody(new WalkedGround(_get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y));
                this.trailLength++;
                _get(Object.getPrototypeOf(Bingo.prototype), 'setPosition', this).call(this, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y + 1);
            }

            if (keyboard.isKeyDown(keyboard.controller.LEFT) && this.previousKeydown[keyboard.controller.LEFT] != keyboard.keydown[keyboard.controller.LEFT]) {
                if (_get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x - 1 < 0) {
                    return;
                }
                this.previousKeydown[keyboard.controller.LEFT] = keyboard.keydown[keyboard.controller.LEFT];
                game.addBody(new WalkedGround(_get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y));
                this.trailLength++;
                _get(Object.getPrototypeOf(Bingo.prototype), 'setPosition', this).call(this, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).x - 1, _get(Object.getPrototypeOf(Bingo.prototype), 'getPosition', this).call(this).y);
            }
        }
    }, {
        key: 'reset',
        value: function reset() {
            _get(Object.getPrototypeOf(Bingo.prototype), 'setPosition', this).call(this, 0, 0);
            this.trailLength = 0;
        }
    }, {
        key: 'getTrailLength',
        value: function getTrailLength() {
            return this.trailLength;
        }
    }]);

    return Bingo;
}(Body);

(function () {
    var game = new Game();
    game.init();

    // Any way we can avoid the .bind(keyboard)?
    document.addEventListener('keydown', keyboard.doKeydown.bind(keyboard), false);
    document.addEventListener('keyup', keyboard.doKeyup.bind(keyboard), false);

    function tick() {
        requestAnimationFrame(tick);

        game.update(game);
        game.draw();
    }

    requestAnimationFrame(tick);
})();
