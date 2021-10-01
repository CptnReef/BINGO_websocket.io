document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect();

    let unavailableNumbers = [];
    let bingoNumberCounter = 0;

    $('td').on('click', e => {
        let clickedBoxValue = e.target.innerHTML;
        let currentBingoNumber = document.getElementById('bingoNumber').innerHTML;

        if (clickedBoxValue == currentBingoNumber) {
            document.getElementById(e.target.id).style.background = 'pink';
        };
    });

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

    const bingoNumber = () => {
        setTimeout( () => {
            bingoNumberCounter ++;
            let currentNumber = randomNumber();

            while (unavailableNumbers.includes(currentNumber) == true) {
                currentNumber = randomNumber();
            };

            unavailableNumbers.push(currentNumber);
            document.getElementById('bingoNumber').innerHTML = currentNumber

            if (bingoNumberCounter < 26) {
                bingoNumber();
            } else {
                unavailableNumbers = [];
                return
            };
        }, 5000);
    };

    generateBoard();
    bingoNumber();
});