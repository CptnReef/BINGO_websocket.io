document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect();

    let playerName;
    let playerEmail;
    let playerId;
    let clickedSquares = ['x3-y3'];
    let winningCoordinates = [
        ['x1-y1', 'x2-y1','x3-y1','x4-y1','x5-y1'],
        ['x1-y2', 'x2-y2','x3-y2','x4-y2','x5-y2'],
        ['x1-y3', 'x2-y3','x3-y3','x4-y3','x5-y3'],
        ['x1-y4', 'x2-y4','x3-y4','x4-y4','x5-y4'],
        ['x1-y5', 'x2-y5','x3-y5','x4-y5','x5-y5'],
        ['x1-y1', 'x1-y2','x1-y3','x1-y4','x1-y5'],
        ['x2-y1', 'x2-y2','x2-y3','x2-y4','x2-y5'],
        ['x3-y1', 'x3-y2','x3-y3','x3-y4','x3-y5'],
        ['x4-y1', 'x4-y2','x4-y3','x4-y4','x4-y5'],
        ['x5-y1', 'x5-y2','x5-y3','x5-y4','x5-y5'],
        ['x1-y1', 'x2-y2','x3-y3','x4-y4','x5-y5'],
        ['x1-y5', 'x2-y4','x3-y3','x4-y2','x5-y1']
    ];

    // *** Game Player's Status
    let currentPlayer = 'user'
    let arr = []

    // *** timer variables & function
    let seconds = 4;
    let countdown = document.getElementById('countdown')

    function countdownUpdate() {
        seconds--;
        countdown.innerHTML = `${seconds}`;

        if(seconds <= 0) {
            seconds = 5
        }
    }

    function next() {
            var file = './sound/next.mp3'
            let mp3 = new Audio(file);
            mp3.preload = 'auto';
            mp3.onloadeddata = function () {
                console.log("audio: " + file + " has successfully loaded.");
            };
            mp3.play();
        }

    function match() {
        var file = './sound/match.mp3'
            let mp3 = new Audio(file);
            mp3.preload = 'auto';
            mp3.onloadeddata = function () {
                console.log("audio: " + file + " has successfully loaded.");
            };
            mp3.play();
    }

    function win() {
            var file = './sound/win.mp3'
            let mp3 = new Audio(file);
            mp3.preload = 'auto';
            mp3.onloadeddata = function () {
                console.log("audio: " + file + " has successfully loaded.");
            };
            mp3.play();
    }

    // Get all currently online users on page load
    socket.emit('get users');

    const randomNumber = () => {
        // Generate random number from 0 to 149
        return Math.floor(Math.random() * 26)
    };

    const generateBoard = () => {
        // Keep track of used numbers
        let usedNumbers = [];

        for (let i = 0; i < 24; i++) {
            let newNumber = randomNumber();

            // If generated number has already been used, keep generating new numbers
            // until an unused number is found
            while (usedNumbers.includes(newNumber) == true) {
                newNumber = randomNumber();
            };

            // Keep track of new unused number, then display number on the board
            usedNumbers.push(newNumber);
            document.getElementById('box' + i).innerHTML = newNumber;
            document.getElementById('box' + i).style.fontSize = '35px'
        };
    };

    $('#create-player').on('click', e => {
        e.preventDefault();
        playerName = document.getElementById('player-name-input').value;
        playerEmail = document.getElementById('player-email').value;
        if (playerName.length > 0) {
            // *** Add connection
            multiplayer()
            socket.emit('new player', { playerName: playerName, playerEmail: playerEmail })
        };

        // Remove the form after user has been created
        const form = document.getElementsByClassName('user-creation-form');
        while (form.length > 0) {
            form[0].remove();
        };
        
        // Generate the bingo board
        generateBoard();

        // Show game board after username has been entered
        document.getElementById('game').style.display = 'block';
        document.getElementById('your-name').innerHTML = `Your name: ${playerName}`;
    });

    // Fill the bingo box. Only allows filling if clicked number matches called number
    $('td').on('click', e => {
        let clickedBoxValue = e.target.innerHTML;
        let currentBingoNumber = document.getElementById('bingoNumber').innerHTML;
        
        if (clickedBoxValue == currentBingoNumber) {
            document.getElementById(e.target.id).style.background = 'pink';
            clickedSquares.push(e.target.classList[0])
            // *** call 'match' audio
            match()

            for (item in winningCoordinates) {

                if (winningCoordinates[item].every(res => clickedSquares.includes(res))) {
                    socket.emit('player won', { player: playerName, id: socket.id })
                };
            };
        };
    });

    // Begin the bingo number caller. Using event delegation because these buttons
    // get dynamically added and removed
    $(document).on('click', '#start-game', () => {
        socket.emit('begin game');
        // *** call timer
        setInterval(countdownUpdate, 1000)
        
        //TESTING
        // socket.emit('player won', { player: playerName, id: socket.id })
    });

    $(document).on('click', '#generate-new-board', () => {
        socket.emit('generate new board');
    });

    // *** Player Identifier
    function multiplayer(num=0) {
        let playerNum = 0;

        // *** Get player Number        
        if (num === -1) {
            infoDisplay.innerHTML = "Sorry, Server is Full"
        } else {
            playerNum = parseInt(num)
            if(playerNum === 1) {
                currentPlayer = "opponent"
                console.log(`${playerNum}`)
            }
        }
        
        // *** Operate's the "div class 'player #' " in response to 'connection'
        // *** Added a toggle feature for span in css 
        
        let player = `.p${parseInt(num) + 1}`
        // *** if the player is us we want to signal our connection
        if(parseInt(num) === playerNum) {
            document.querySelector(player).style.fontWeight = 'bold'
            document.querySelector(`${player} .connected span`).classList.toggle('green')
        }
        if(parseInt(num - 1) === playerNum) {
            document.querySelector(player).style.fontWeight = 'bold'
            document.querySelector(`${player} .connected span`).classList.toggle('green')
        }
        
    }

    // Display all other users currently online
    socket.on('get users', users => {
        for (const [key, value] of Object.entries(users)) {
            $('#user-list ul').append(`<li class="online-user">${value.name}</li>`)
        };
    });

    // Display new users in the online user list
    socket.on('new player', data => {
        playerId = data.id;
        $('#user-list ul').append(`<li class="online-user">${data.name}</li>`)
    });

    // Update user list when user disconnects
    socket.on('player disconnected', users => {
        $('#user-list ul').empty();
        for (const [key, value] of Object.entries(users)) {
            $('#user-list ul').append(`<li class="online-user">${value.name}</li>`)
        };
    });

    // Gets randomly generated bingo number and displays it on the game page
    socket.on('bingo number', number => {
        startGameButton = document.getElementById('start-game');

        // Remove start game button only if it exists (since this runs in
        // a loop, the button will be gone on subsequent loops)
        if (startGameButton) {
            startGameButton.remove();
        };
        document.getElementById('bingoNumber').innerHTML = number;
        document.getElementById('bingoNumber').style.fontSize = '40px';

        // *** call 'next' audio
        next()
    });

    // When a player wins, display name of winning player. Then, clear out
    // leftover data from previous game and prepare elements for a new game
    socket.on('player won', winningPlayer => {
        document.getElementById('winner').innerHTML = `${winningPlayer} won!` // Display winning player
        document.getElementById('bingoNumber').innerHTML = '';
        clickedSquares = []; // Clear clicked squares from previous game
        $('#game-controls').append('<button id="generate-new-board">Generate new game board!</button>')

        // *** call 'win' audio
        win()
    });

    socket.on('generate new board', () => {
        generateBoard();

        // Clear colored boxes from previous game
        for (let i = 0; i < 24; i++) {
            document.getElementById('box' + i).style.background = 'white';
        };

        document.getElementById('generate-new-board').remove(); // Remove generate new board button
        $('#game-controls').append('<button id="start-game">Begin the game!</button>')
    });

});