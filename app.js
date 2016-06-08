;

function Platform() {
    var screen = {
        x: 750,
        y: 450
    };

    var pref = {
        columns: 15,
        rows: 9
    };

    return {
        screen: screen,
        pref: pref
    }
}

var platform = new Platform();

function Keyboard() {
    var keydown = {};

    var controller = {
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LEFT: 37,
        ESC: 27
    }

    function doKeydown(e) {
        keydown[e.keyCode] = true;
    }

    function doKeyup(e) {
        keydown[e.keyCode] = false;
    }

    function isKeyDown(code) {
        return keydown[code] || false;
    }

    return {
        keydown: keydown,
        controller: controller,
        doKeyup: doKeyup,
        doKeydown: doKeydown,
        isKeyDown: isKeyDown
    }
}

var keyboard = new Keyboard();

function Game() {
    var canvas = document.getElementById('screen');
    var ctx = canvas.getContext('2d');

    var state = 'GAME_INITIALIZED';

    var board = [];

    var rocks = [
        [3, 0], [4, 0], [9, 0], [14, 0], [9, 1], [14, 1], [0, 2], [4, 3],
        [5, 3], [8, 3], [5, 4], [8, 4], [12, 4], [13, 4], [2, 5], [3, 5],
        [6, 6], [10, 6], [11, 6], [1, 7], [6, 7]
    ];

    var bingo = new Bingo(0, 0);

    function init() {
        canvas.height = platform.screen.y;
        canvas.width = platform.screen.x;

        for (var x = 0; x < platform.pref.columns; x++) {
            for (var y = 0; y < platform.pref.rows; y++) {
                addBody(new Body('Ground', x, y, 'ground'));
            }
        }

        for (var i = 0; i < rocks.length; i++) {
            var x = rocks[i][0];
            var y = rocks[i][1];
            addBody(new Rock(x, y));
        }

        addBody(this.bingo);

        state = 'GAME_PLAYING';
    }

    function draw() {
        if (state == 'GAME_PLAYING') {
            ctx.clearRect(0, 0, platform.screen.x, platform.screen.y);

            for (var i = 0; i < board.length; i++) {
                var body = board[i];
                var img = document.getElementById(body.image);

                ctx.beginPath();
                ctx.drawImage(
                    img,
                    body.getPosition().x * platform.screen.x / platform.pref.columns,
                    body.getPosition().y * platform.screen.y / platform.pref.rows,
                    platform.screen.x / platform.pref.columns,
                    platform.screen.y / platform.pref.rows
                );
            }
        } else if (state == 'GAME_COMPLETED') {
            var img = document.getElementById('youWon');
            ctx.drawImage(
                img,
                platform.screen.x / 2 - (img.width / 2),
                80
            );
            state = 'MENU_RESTART';
        } else if (state == 'BINGO_CRASHED') {
        } else if (state == 'MENU_RESTART') {
        }
    }

    function update() {
        for (var i = 0; i < board.length; i++) {
            board[i].update();
        }

        for (var i = 0; i < board.length; i++) {
            if (bingo.collide(board[i])) {
                bingo.reset();
            }
        }
    }

    function addBody(body) {
        board.push(body);
    }

    return {
        ctx: ctx,
        board: board,
        bingo: bingo,
        init: init,
        draw: draw,
        update: update
    }

}

function Body(name, x, y, image) {
    var position = { x: x, y: y };

    var size = {
        x: platform.screen.x / platform.pref.columns,
        y: platform.screen.y / platform.pref.rows
    };

    var collider = false;

    function update() {}

    function setPosition(x, y) {
        position = { x: x, y: y };
    }

    function getPosition() {
        return position;
    }

    function collide(body) {
        if (this === body) {
            return false;
        }

        if ( ! body.collider) {
            return false;
        }

        return getPosition().x === body.getPosition().x &&
               getPosition().y === body.getPosition().y;
    }

    return {
        size: size,
        image: image,
        collider: collider,
        update: update,
        setPosition: setPosition,
        getPosition: getPosition,
        collide: collide
    }
}

function Rock(x, y) {
    var parent = new Body('Rock', x, y, 'rock');

    parent.collider = true;

    return parent;
}

function Bingo(x, y) {

    var parent = new Body('Bingo', x, y, 'bingo');

    parent.collider = true;
    parent.update = update;
    parent.reset = reset;

    var isOnCooldown = false;
    var actionStartTimestamp = null;

    function update() {
        if (isOnCooldown && +new Date() - actionStartTimestamp > 120) {
            isOnCooldown = false;
            actionStartTimestamp = null;
        }

        if (isOnCooldown) { return; }

        if (keyboard.isKeyDown(keyboard.controller.UP)) {
            if (parent.getPosition().y - 1 < 0) {
                return;
            }
            parent.setPosition(parent.getPosition().x, parent.getPosition().y - 1);
            isOnCooldown = true;
            actionStartTimestamp = +new Date();
        }

        if (keyboard.isKeyDown(keyboard.controller.RIGHT)) {
            if (parent.getPosition().x + 1 >= platform.pref.columns) {
                return;
            }
            parent.setPosition(parent.getPosition().x + 1, parent.getPosition().y);
            isOnCooldown = true;
            actionStartTimestamp = +new Date();
        }

        if (keyboard.isKeyDown(keyboard.controller.DOWN)) {
            if (parent.getPosition().y + 1 >= platform.pref.rows) {
                return;
            }
            parent.setPosition(parent.getPosition().x, parent.getPosition().y + 1);
            isOnCooldown = true;
            actionStartTimestamp = +new Date();
        }

        if (keyboard.isKeyDown(keyboard.controller.LEFT)) {
            if (parent.getPosition().x - 1 < 0) {
                return;
            }
            parent.setPosition(parent.getPosition().x - 1, parent.getPosition().y);
            isOnCooldown = true;
            actionStartTimestamp = +new Date();
        }
    }

    function reset() {
        parent.setPosition(0, 0);
    }

    return parent;
}




(function() {
    var game = new Game();
    game.init();

    document.addEventListener('keydown', keyboard.doKeydown, false);
    document.addEventListener('keyup', keyboard.doKeyup, false);

    function tick() {
        requestAnimationFrame(tick);

        game.update();
        game.draw();
    }

    requestAnimationFrame(tick);
})();
