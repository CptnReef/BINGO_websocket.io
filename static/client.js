document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect();

    let playerName;
    let unavailableNumbers = [];
    let bingoNumberCounter = 0;

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
        };
    };

    $('#create-player').on('click', e => {
        e.preventDefault();
        playerName = document.getElementById('player-name-input').value;
        if (playerName.length > 0) {
            socket.emit('new player', playerName)
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
    });

    // Fill the bingo box. Only allows filling if clicked number matches called number
    $('td').on('click', e => {
        let clickedBoxValue = e.target.innerHTML;
        let currentBingoNumber = document.getElementById('bingoNumber').innerHTML;

        if (clickedBoxValue == currentBingoNumber) {
            document.getElementById(e.target.id).style.background = 'pink';
        };
    });

    // Begin the bingo number caller
    document.getElementById('start-game').onclick = () => {
        socket.emit('begin game');
    };

    // Display all other users currently online
    socket.on('get users', users => {
        for (const [key, value] of Object.entries(users)) {
            $('#user-list ul').append(`<li class="online-user">${value}</li>`)
        };
    });

    // Display new users in the online user list
    socket.on('new player', username => {
        $('#user-list ul').append(`<li class="online-user">${username}</li>`)
    });

    // Update user list when user disconnects
    socket.on('player disconnected', users => {
        $('#user-list ul').empty();
        for (const [key, value] of Object.entries(users)) {
            $('#user-list ul').append(`<li class="online-user">${value}</li>`)
        };
    });

    socket.on('begin game', number => {
        startGameButton = document.getElementById('start-game');

        // Remove start game button only if it exists (since this runs in
        // a loop, the button will be gone on subsequent loops)
        if (startGameButton) {
            startGameButton.remove();
        };
        document.getElementById('bingoNumber').innerHTML = number;
    });

});