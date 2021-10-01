const port = 3000;
// const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

let currentUsers = {};

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
        console.log(currentUsers);
    });
});

// Start server
server.listen(port, () => {
    console.log(`Bingo Multiplayer listening on ${port}`);
});