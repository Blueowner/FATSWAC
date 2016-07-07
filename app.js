class Platform {
    constructor() {
        this.screen = {
            x: 750,
            y: 450
        }

        this.pref = {
            columns: 15,
            rows: 9
        }
    }
}

var platform = new Platform();

class Keyboard {
    constructor() {
        this.keydown = {};
        this.lastKeydown = null;

        this.controller = {
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            LEFT: 37,
            ESC: 27
        }
    }

    doKeydown(e) {
        // Throttle 'keydown' registration to a maximum of one every 10 milliseconds
        if (this.lastKeydown && +new Date() - this.lastKeydown < 10) {
            return;
        }

        if ( ! this.keydown[e.keyCode]) {
            this.lastKeydown = +new Date();
            this.keydown[e.keyCode] = +new Date();
        }
    }

    doKeyup(e) {
        this.keydown[e.keyCode] = false;
    }

    isKeyDown(code) {
        return this.keydown[code] || false;
    }
}

var keyboard = new Keyboard();

class Game {
    constructor() {
        this.canvas = document.getElementById('screen');
        this.ctx = this.canvas.getContext('2d');

        this.state = 'GAME_INITIALIZED';

        this.board = [];

        this.rocks = [
            [3, 0], [4, 0], [9, 0], [14, 0], [9, 1], [14, 1], [0, 2], [4, 3],
            [5, 3], [8, 3], [5, 4], [8, 4], [12, 4], [13, 4], [2, 5], [3, 5],
            [6, 6], [10, 6], [11, 6], [1, 7], [6, 7]
        ];

        this.bingo = new Bingo(0, 0);
    }

    init() {
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

    drawMap() {
        this.ctx.clearRect(0, 0, platform.screen.x, platform.screen.y);

        for (var i = 0; i < this.board.length; i++) {
            var body = this.board[i];
            var img = document.getElementById(body.image);

            this.ctx.beginPath();
            this.ctx.drawImage(
                img,
                body.getPosition().x * platform.screen.x / platform.pref.columns,
                body.getPosition().y * platform.screen.y / platform.pref.rows,
                platform.screen.x / platform.pref.columns,
                platform.screen.y / platform.pref.rows
            );
        }
    }

    draw() {
        if (this.state == 'GAME_PLAYING') {
            this.drawMap();
        } else if (this.state == 'GAME_COMPLETED') {
            this.drawMap();

            var img = document.getElementById('youWon');
            this.ctx.drawImage(
                img,
                platform.screen.x / 2 - (img.width / 2),
                80
            );
            this.state = 'MENU_RESTART';
        } else if (this.state == 'BINGO_CRASHED') {
        } else if (this.state == 'MENU_RESTART') {
            this.state = 'GAME_PLAYING';
        }
    }

    update(game) {
        for (var i = 0; i < this.board.length; i++) {
            this.board[i].update(game);
        }

        if (platform.pref.columns * platform.pref.rows - this.rocks.length == this.bingo.getTrailLength() + 1) {
            this.state = 'GAME_COMPLETED';
        }

        for (var i = 0; i < this.board.length; i++) {
            if (this.bingo.collide(this.board[i])) {
                this.bingo.reset();
                this.board = this.board.filter(function(body) {
                    return body.name !== 'WalkedGround';
                });
            }
        }
    }

    addBody(body) {
        this.board.push(body);
    }
}

class Body {
    constructor(name, x, y, image) {
        this.name = name;
        this.position = { x: x, y: y };

        this.size = {
            x: platform.screen.x / platform.pref.columns,
            y: platform.screen.y / platform.pref.rows
        };

        this.image = image;

        this.collider = false;
    }

    update() {}

    setPosition(x, y) {
        this.position = { x: x, y: y };
    }

    getPosition() {
        return this.position;
    }

    collide(body) {
        if (this === body) {
            return false;
        }

        if ( ! body.collider) {
            return false;
        }

        return this.getPosition().x === body.getPosition().x &&
               this.getPosition().y === body.getPosition().y;
    }
}

class Rock extends Body {
    constructor(x, y) {
        super('Rock', x, y, 'rock');
        this.collider = true;

        this.updatedAt;
    }
}

class WalkedGround extends Body {
    constructor(x, y) {
        super('WalkedGround', x, y, 'ground-2');
        this.collider = true;
    }
}

class Bingo extends Body {
    constructor(x, y) {
        super('Bingo', x, y, 'bingo');
        this.collider = true;

        this.previousKeydown = {};
        this.trailLength = 0;
    }

    update(game) {
        if (keyboard.isKeyDown(keyboard.controller.UP) && this.previousKeydown[keyboard.controller.UP] != keyboard.keydown[keyboard.controller.UP]) {
            if (super.getPosition().y - 1 < 0) {
                return;
            }
            this.previousKeydown[keyboard.controller.UP] = keyboard.keydown[keyboard.controller.UP];
            game.addBody(new WalkedGround(super.getPosition().x, super.getPosition().y));
            this.trailLength++;
            super.setPosition(super.getPosition().x, super.getPosition().y - 1);
        }

        if (keyboard.isKeyDown(keyboard.controller.RIGHT) && this.previousKeydown[keyboard.controller.RIGHT] != keyboard.keydown[keyboard.controller.RIGHT]) {
            if (super.getPosition().x + 1 >= platform.pref.columns) {
                return;
            }
            this.previousKeydown[keyboard.controller.RIGHT] = keyboard.keydown[keyboard.controller.RIGHT];
            game.addBody(new WalkedGround(super.getPosition().x, super.getPosition().y));
            this.trailLength++;
            super.setPosition(super.getPosition().x + 1, super.getPosition().y);
        }

        if (keyboard.isKeyDown(keyboard.controller.DOWN) && this.previousKeydown[keyboard.controller.DOWN] != keyboard.keydown[keyboard.controller.DOWN]) {
            if (super.getPosition().y + 1 >= platform.pref.rows) {
                return;
            }
            this.previousKeydown[keyboard.controller.DOWN] = keyboard.keydown[keyboard.controller.DOWN];
            game.addBody(new WalkedGround(super.getPosition().x, super.getPosition().y));
            this.trailLength++;
            super.setPosition(super.getPosition().x, super.getPosition().y + 1);
        }

        if (keyboard.isKeyDown(keyboard.controller.LEFT) && this.previousKeydown[keyboard.controller.LEFT] != keyboard.keydown[keyboard.controller.LEFT]) {
            if (super.getPosition().x - 1 < 0) {
                return;
            }
            this.previousKeydown[keyboard.controller.LEFT] = keyboard.keydown[keyboard.controller.LEFT];
            game.addBody(new WalkedGround(super.getPosition().x, super.getPosition().y));
            this.trailLength++;
            super.setPosition(super.getPosition().x - 1, super.getPosition().y);
        }
    }

    reset() {
        super.setPosition(0, 0);
        this.trailLength = 0;
    }

    getTrailLength() {
        return this.trailLength;
    }
}


(function() {
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
