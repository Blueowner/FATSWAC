;
document.onreadystatechange = (function() {

    var screen = {
        x: 750,
        y: 450
    };

    var game = {
        columns: 15,
        rows: 9,
        board: []
    };

    var isWon = false;

    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;
    var LEFT = 37;
    var ESC = 27;

    var canvas = document.getElementById('screen');
    var ctx = canvas.getContext('2d');

    canvas.height = screen.y;
    canvas.width = screen.x;

    for (var x = 0; x < game.columns; x++) {
        game.board[x] = [];
        for (var y = 0; y < game.rows; y++) {
            game.board[x][y] = null;
        }
    }

    var bingo = new Bingo(0, 0)
    addBody(bingo);

    var rockList = {
        1: [
            [3, 0], [4, 0], [9, 0], [14, 0], [14, 1], [0, 2], [4, 3], [5, 3],
            [8, 3], [8, 4], [13, 4], [14, 4], [2, 5], [11, 5], [2, 6], [10, 6],
            [11, 6], [6, 7]
        ],
        2: [
            [3, 0], [4, 0], [9, 0], [14, 0], [9, 1], [14, 1], [0, 2], [4, 3],
            [5, 3], [8, 3], [5, 4], [8, 4], [12, 4], [13, 4], [2, 5], [3, 5],
            [6, 6], [10, 6], [11, 6], [1, 7], [6, 7]
        ]
    };

    for (var i = 0; i < rockList[2].length; i++) {
        var rock = rockList[2][i];
        addBody(new Rock(rock[0], rock[1]));
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

    function addBody(body) {
        game.board[body.position.x][body.position.y] = body;
    };

    document.addEventListener('keyup', function(e) {
        if (isWon) {
            return;
        }

        console.log(
            [UP, RIGHT, DOWN, LEFT, ESC].indexOf(e.keyCode)
        );

        if ([UP, RIGHT, DOWN, LEFT, ESC].indexOf(e.keyCode) === -1) {
            return;
        }

        var currentPosition = { x: bingo.position.x, y: bingo.position.y };
        var hasMoved = false;

        if (e.keyCode == UP) {
            hasMoved = bingo.move('UP', 1);
        } else if (e.keyCode == RIGHT) {
            hasMoved = bingo.move('RIGHT', 1)
        } else if (e.keyCode == DOWN) {
            hasMoved = bingo.move('DOWN', 1)
        } else if (e.keyCode == LEFT) {
            hasMoved = bingo.move('LEFT', 1)
        }

        if (hasMoved) {
            addBody(new Tail(currentPosition.x, currentPosition.y));
        }

        if ( ! hasMoved || e.keyCode == ESC) {
            bingo.resetState();
            resetTail();
        }

        isWon = true;

        for (var x = 0; x < game.columns; x++) {
            for (var y = 0; y < game.rows; y++) {
                if (game.board[x][y] === null) {
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

            var $isWonInfo = document.getElementById('isWonInfo');
            $isWonInfo.style.display = 'block';

            var $downloadAnchor = document.getElementById('downloadAnchor');
            $downloadAnchor.href = canvas.toDataURL('image/png');
        }

    });

    function draw() {
        ctx.clearRect(0, 0, screen.x, screen.y);

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

});