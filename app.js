const port = 3000;
// const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

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
    io.emit('begin game', currentNumber);

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
    // Listen for new player creation
    socket.on('new player', name => {
        currentUsers[socket.id] = name;
        io.emit('new player', name);
    });

    // Get all online users
    socket.on('get users', users => {
        socket.emit('get users', currentUsers);
    });

    // Remove user from currentUsers list when they disconnect
    socket.on('disconnect', () => {
        delete currentUsers[socket.id];
        io.emit('player disconnected', currentUsers);
    });

    // Begin bingo number counter
    socket.on('begin game', () => {
        bingoNumber();
    });
});

// Start server
server.listen(port, () => {
    console.log(`Bingo Multiplayer listening on ${port}`);
});