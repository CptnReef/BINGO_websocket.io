const port = 3000;
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// *** limit the number of players to a game
const connections = [null, null]; // two connections to keep track of?

let currentUsers = {};
let unavailableNumbers = [];
let bingoNumberCounter = 0;

const randomNumber = () => {
    // Generate random number from 0 to 149
    return Math.floor(Math.random() * 26)
};

const bingoNumber = () => {
    bingoNumberCounter ++;
    let currentNumber = randomNumber();

    while (unavailableNumbers.includes(currentNumber) == true) {
        currentNumber = randomNumber();
    };

    unavailableNumbers.push(currentNumber);
    io.emit('bingo number', currentNumber);

    if (bingoNumberCounter < 26) {
        setTimeout( () => {
            bingoNumber();
        }, 5000)
    } else {
        unavailableNumbers = [];
        return
    };
};

// Set up express static folder
app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html')
});

io.on('connection', socket => {
        // *** Find an available player number
        // *** identify player 1 & 2 as 0 & 1, if -1 ignore player.
        let playerIndex = -1
        for (const i in connections){
            if (connections[i] === null){
                playerIndex = i
                break
            }
        }

        // *** Ignore player 3
        if (playerIndex === -1) return

        // *** checks if player is ready or not?
        connections[playerIndex] = false


    // Listen for new player creation
    socket.on('new player', name => {
        currentUsers[socket.id] = {name: name};

        // *** Tell the Connecting client what player number they are
        socket.emit('player-number', playerIndex)

        console.log(`Player ${playerIndex} has connected`)

        // *** Tell which player number just connected
        socket.broadcast.emit('player-connection', playerIndex)

        // currentUsers[socket.id]["test"] = 'hi there'
        io.emit('new player', { name: name, id: socket.id });


    });

    // Get all online users
    socket.on('get users', users => {
        socket.emit('get users', currentUsers);
    });

    // Remove user from currentUsers list when they disconnect
    socket.on('disconnect', () => {
        // *** Handle Disconnection
        console.log(`Player ${playerIndex} disconnected`)
        connections[playerIndex] = null

        // *** Tell everyone what player number just disconnected
        socket.broadcast.emit('player-connection', playerIndex)

        delete currentUsers[socket.id];
        io.emit('player disconnected', currentUsers);
    });

    // Begin bingo number counter
    socket.on('begin game', () => {
        bingoNumber();
    });

    // Player won. End game and display winner to all users
    socket.on('player won', winningPlayer => {
        bingoNumberCounter = 1000; // End the bingo counter loop
        unavailableNumbers = []; // Reset unavailable number counter
        io.emit('player won', winningPlayer)
    });

    // Generate new board
    socket.on('generate new board', () => {
        io.emit('generate new board')
    })
});

// Start server
server.listen(port, () => {
    console.log(`Bingo Multiplayer listening on ${port}`);
});