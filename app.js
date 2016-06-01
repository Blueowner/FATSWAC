;
(function() {

    var screen = {
        x: 600,
        y: 400
    };

    var game = {
        columns: 12,
        rows: 8,
        board: []
    };

    var bodies = [];

    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;
    var LEFT = 37;
    var ESC = 27;

    for (var x = 0; x < game.columns; x++) {
        game.board[x] = [];
        for (var y = 0; y < game.rows; y++) {
            game.board[x][y] = null;
        }
    }

    function resetTail() {
        for (var x = 0; x < game.columns; x++) {
            for (var y = 0; y < game.rows; y++) {
                if (game.board[x][y] && game.board[x][y].className == 'Tail') {
                    game.board[x][y] = null;
                }
            }
        }
    }

    var bingo = new Bingo(0, 0)
    addBody(bingo);


    addBody(new Rock(1, 2));
    addBody(new Rock(1, 3));

    function addBody(body) {
        game.board[body.position.x][body.position.y] = body;
    };

    document.addEventListener('keyup', function(e) {
        if (e.keyCode == UP) {
            var currentPosition = { x: bingo.position.x, y: bingo.position.y };
            if (bingo.move('UP', 1)) {
                addBody(new Tail(currentPosition.x, currentPosition.y));
            } else {
                bingo.resetState();
                resetTail();
            }
        } else if (e.keyCode == RIGHT) {
            var currentPosition = { x: bingo.position.x, y: bingo.position.y };
            if (bingo.move('RIGHT', 1)) {
                addBody(new Tail(currentPosition.x, currentPosition.y));
            } else {
                bingo.resetState();
                resetTail();
            }
        } else if (e.keyCode == DOWN) {
            var currentPosition = { x: bingo.position.x, y: bingo.position.y };
            if (bingo.move('DOWN', 1)) {
                addBody(new Tail(currentPosition.x, currentPosition.y));
            } else {
                bingo.resetState();
                resetTail();
            }
        } else if (e.keyCode == LEFT) {
            var currentPosition = { x: bingo.position.x, y: bingo.position.y };
            if (bingo.move('LEFT', 1)) {
                addBody(new Tail(currentPosition.x, currentPosition.y));
            } else {
                bingo.resetState();
                resetTail();
            }
        } else if (e.keyCode == ESC) {
            bingo.resetState();
            resetTail();
        }

        isWon = true;

        for (var x = 0; x < game.columns; x++) {
            for (var y = 0; y < game.rows; y++) {
                if (game.board[x][y] === null ) {
                    isWon = false;
                    break;
                }
            }
        }

        draw();

        if (isWon) {
            var youWon = document.getElementById('youWon');
            ctx.drawImage(
                youWon,
                screen.x / 2 - (youWon.width / 2),
                80
            );

            alert();

            bingo.resetState();
            resetTail();
            draw();
        }

    });

    var map = function(value, in_min, in_max, out_min, out_max) {
        return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    };

    var canvas = document.getElementById('screen');
    var ctx = canvas.getContext('2d');

    canvas.height = screen.y;
    canvas.width = screen.x;

    function draw() {
        ctx.clearRect(0, 0, screen.x, screen.y);

        for (var i = 0; i <= game.columns; i++) {
            ctx.beginPath();
            ctx.moveTo(map(i, 0, game.columns, 0, screen.x), 0);
            ctx.lineWidth = 1;
            ctx.lineTo(map(i, 0, game.columns, 0, screen.x), screen.y);
            ctx.stroke();
        }

        for (var i = 0; i <= game.rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, map(i, 0, game.rows, 0, screen.y));
            ctx.lineWidth = 1;
            ctx.lineTo(screen.x, map(i, 0, game.rows, 0, screen.y));
            ctx.stroke();
        }

        for (var x = 0; x < game.columns; x++) {
            for (var y = 0; y < game.rows; y++) {
                var img = document.getElementById('ground');

                ctx.beginPath();
                ctx.drawImage(
                    img,
                    x * screen.x / game.columns,
                    y * screen.y / game.rows,
                    screen.x / game.columns,
                    screen.y / game.rows
                );
            }
        }

        for (var x = 0; x < game.columns; x++) {
            for (var y = 0; y < game.rows; y++) {
                if (game.board[x][y] === null) {
                    continue;
                }

                var body = game.board[x][y];
                var img = document.getElementById(body.image);

                ctx.beginPath();
                ctx.drawImage(
                    img,
                    body.position.x * screen.x / game.columns,
                    body.position.y * screen.y / game.rows,
                    screen.x / game.columns,
                    screen.y / game.rows
                );
            }
        }

    }

    function Bingo(x, y, color) {
        this.className = 'Bingo';
        // Body
        this.size = { x: screen.x / game.columns, y: screen.y / game.rows };
        this.position = { x: x, y: y };

        this.color = 'rgb(191,224,255)';
        this.image = 'bingo';
        this.tail = [];

        this.move = function(direction, offset) {

            if (direction == 'UP') {
                if (this.position.y - offset < 0 ) {
                    return false;
                }

                var isCrashed = game.board[this.position.x][this.position.y - offset] !== null;

                if (isCrashed) {
                    return false;
                }

                this.position.y -= offset;
            } else if (direction == 'RIGHT') {
                if (this.position.x + offset > game.columns - 1) {
                    return false;
                }

                var isCrashed = game.board[this.position.x + offset][this.position.y] !== null;

                if (isCrashed) {
                    return false;
                }

                this.position.x += offset;
            } else if (direction == 'DOWN') {
                if (this.position.y + offset > game.rows - 1) {
                    return false;
                }

                var isCrashed = game.board[this.position.x][this.position.y + offset] !== null;

                if (isCrashed) {
                    return false;
                }

                this.position.y += offset;
            } else if (direction == 'LEFT') {
                if (this.position.x - offset < 0) {
                    return false;
                }

                var isCrashed = game.board[this.position.x - offset][this.position.y] !== null;

                if (isCrashed) {
                    return false;
                }

                this.position.x -= offset;
            }

            addBody(this);

            return true;
        }

        this.resetState = function() {
            game.board[this.position.x][this.position.y] = null;

            this.position = { x: x, y: y };
            this.tail = [];

            addBody(this);
        }

    }

    function Rock(x, y) {
        this.className = 'Rock';

        // Body
        this.position = { x: x, y: y };
        this.size = { x: screen.x / game.columns, y: screen.y / game.rows };

        this.color = 'rgb(109,76,65)';
        this.image = 'rock';
    }

    function Tail(x, y) {
        this.className = 'Tail';

        // Body
        this.position = { x: x, y: y };
        this.size = { x: screen.x / game.columns, y: screen.y / game.rows };

        this.color = 'rgb(191,224,255)';
        this.image = 'ground-2';
    }

    draw();

    function Body(x, y, width, height) {
        this.size = { x: width, y: height };
        this.position = { x: x, y: y };
    }

    // function isColliding(b1, b2) {
    //     return ! (
    //         b1 === b2 ||
    //         b1.position.y > b2.position.y + b2.size.y ||
    //         b1.position.x > b2.position.x + b2.size.x ||
    //         b1.position.y + b1.size.y < b2.position.y ||
    //         b1.position.x + b1.size.x < b2.position.x
    //     );
    // }

})();