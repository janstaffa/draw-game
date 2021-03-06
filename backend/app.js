const express = require('express');
const app = express();
const socket = require("socket.io");
const fs = require('fs');

const server = app.listen(8000, () => {
    console.log('listening on port 8000');
});
app.get('/', (req, res) => {
    res.send('Hi');
});

const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const playerColors = ['#ff4000', '	#80ff00', '#00ffff', '#0040ff', '#4000ff', '#bf00ff', '#ff0000', '#663300', '#ffff00', '#006600'];
const getRandomColor = () => {
    let randomIndex = Math.floor(Math.random() * playerColors.length);
    return playerColors[randomIndex];
}
let game = {};

const Player = function (id, nick, color) {
    this.id = id;
    this.nick = nick;
    this.color = color;
    this.score = 0;
    this.place = 0;
}
let timer = 0;
const newRound = (room) => {
    const players = game[room].players;
    const drawer = players[Math.floor(Math.random() * players.length)];
    const themeArray = fs.readFileSync('themes.txt').toString().split('\n');
    const theme = themeArray[Math.floor(Math.random() * themeArray.length)];

    game[room].theme = theme;
    game[room].drawer = drawer;
    io.in(room).emit('roundStart', {
        drawer,
        theme,
        round: game[room].round
    });
    io.to(drawer.id).emit('allowDraw', { theme });
    let time = 120;
    timer = setInterval(() => {
        --time;

        io.in(room).emit('timer', {
            time
        });
        if (game[room]?.players.length < 2) {
            clearInterval(timer);
            return;
        }

        if (time === 0) {
            gameEnd(room, 'Round time has ended.');
            clearInterval(timer);
        } else if (game[room].guessed === game[room].players.length - 1) {
            gameEnd(room, 'Everyone guessed the theme.');
            clearInterval(timer);
        }
    }, 1000);
}

const gameEnd = (room, message) => {
    io.in(room).emit('gameEnd', {
        message,
        results: game[room].players,
        theme: game[room].theme
    });

    game[room].round++;
    game[room].theme = '';
    game[room].guessed = 0;
    game[room].drawer = '';

    for (let i = 0; i < game[room].players.length; i++) {
        game[room].players[i].place = 0;
    }
    setTimeout(() => {
        newRound(room);
    }, 5000);
}

const startGame = (game) => {
    if (game.players.length >= 2) {
        newRound(game.room);
    }
}

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);

        const socketColor = getRandomColor();

        if (game[data.room]) {
            game[data.room].players.push(new Player(socket.id, data.nick, socketColor));
        } else {
            game[data.room] = {
                room: data.room,
                round: 1,
                theme: '',
                drawer: '',
                guessed: 0,
                players: [new Player(socket.id, data.nick, socketColor)]
            };
        }

        const players = game[data.room].players;
        const playerCount = players.length;


        if (playerCount === 2) {
            startGame(game[data.room]);
        }


        io.in(data.room).emit('server', {
            content: `${data.nick} joined the game.`,
            timestamp: new Date(),
            players: playerCount
        });

        socket.on('disconnect', () => {
            io.in(data.room).emit('server', {
                content: `${data.nick} left the game.`,
                timestamp: new Date(),
                players: playerCount
            });

            if (game[data.room].players.length === 1) {
                delete game[data.room];
            } else {
                for (let i = 0; i < game[data.room].players.length; i++) {
                    if (game[data.room].players[i].id === socket.id) {
                        game[data.room].players.splice(i, 1);
                        break;
                    }
                }
            }
            socket.removeAllListeners();
        });

        socket.on('chat', (msg) => {
            if (socket.id === game[data.room].drawer.id) {
                return;
            }

            const guessWord = game[data.room].theme.trim();

            if (msg.content.trim().includes(guessWord)) {
                const points = game[data.room].players.length - game[data.room].guessed;

                for (let i = 0; i < game[data.room].players.length; i++) {
                    if (game[data.room].players[i].id === socket.id) {
                        game[data.room].players[i].score += points;
                        game[data.room].players[i].place = game[data.room].guessed + 1;
                        break;
                    }
                }
                game[data.room].guessed++;

                io.in(data.room).emit('server', {
                    content: `${data.nick} guessed the word.`,
                    timestamp: new Date(),
                    players: playerCount
                });
            } else {
                io.in(data.room).emit('chat', {
                    sender: msg.nick,
                    content: msg.content,
                    timestamp: new Date(),
                    color: socketColor
                });
            }
        });

        socket.on('draw', (payload) => {
            socket.to(data.room).emit('draw', payload);
        });
        socket.on('mouseup', () => {
            socket.to(data.room).emit('mouseup');
        });
        socket.on('resetCanvas', () => {
            socket.to(data.room).emit('resetCanvas');
        });
    });
});




