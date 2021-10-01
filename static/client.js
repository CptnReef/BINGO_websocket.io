document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect();

    const randomNumber = () => {
        // Generate random number from 0 to 149
        return Math.floor(Math.random() * 150)
    };

    const generateBoard = () => {
        // Keep track of used numbers
        let usedNumbers = [];

        for (let i = 0; i < 24; i ++) {
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

    generateBoard();
});