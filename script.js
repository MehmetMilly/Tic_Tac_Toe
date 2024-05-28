document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll("[data-cell]");
    const board = document.getElementById("board");
    const restartButton = document.getElementById("restartButton");
    const resetScoresButton = document.getElementById("resetScoresButton");
    const switchPlayersButton = document.getElementById("switchPlayersButton");
    const turnIndicator = document.getElementById("turnIndicator");
    const popup = document.getElementById("popup");
    const popupRestartButton = document.getElementById("popupRestartButton");
    const messageElement = document.getElementById("message");
    const player1NameInput = document.getElementById("player1Name");
    const player2NameInput = document.getElementById("player2Name");
    const player1ScoreElement = document.getElementById("player1Score");
    const player2ScoreElement = document.getElementById("player2Score");

    const winSound = document.getElementById("winSound");
    const moveSound = document.getElementById("moveSound");
    const drawSound = document.getElementById("drawSound");
    const restartSound = document.getElementById("restartSound");
    const lossSound = document.getElementById("lossSound");

    const confettiContainer = document.getElementById("confetti-container");

    let player1Score = 0;
    let player2Score = 0;
    let isPlayer1Turn = true;
    let gameActive = true;
    let isPlayerVsAI = false;

    let originalPlayer1Name = player1NameInput.textContent;
    let originalPlayer2Name = player2NameInput.textContent;

    const pvpModeButton = document.getElementById("pvpModeButton");
    const pvaModeButton = document.getElementById("pvaModeButton");

    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const updateTurnIndicator = () => {
        if (isPlayer1Turn) {
            turnIndicator.textContent = `${player1NameInput.textContent || 'Player 1'}'s Turn`;
            turnIndicator.style.color = "#EB3324";
        } else {
            turnIndicator.textContent = `${player2NameInput.textContent || 'Player 2'}'s Turn`;
            turnIndicator.style.color = "#3f72af";
        }
    };

    const handleCellClick = (e) => {
        const cell = e.target;
        if (!gameActive || cell.classList.contains("x") || cell.classList.contains("o")) {
            return;
        }

        const currentClass = isPlayer1Turn ? "x" : "o";
        moveSound.currentTime = 0;
        moveSound.play();
        cell.classList.add(currentClass);

        if (checkWin(currentClass)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            isPlayer1Turn = !isPlayer1Turn;
            updateTurnIndicator();
            if (isPlayerVsAI && !isPlayer1Turn) {
                setTimeout(aiMove, 500);
            }
        }
    };

    const checkWin = (currentClass) => {
        return winPatterns.some((pattern) => {
            return pattern.every((index) => {
                return cells[index].classList.contains(currentClass);
            });
        });
    };

    const isDraw = () => {
        return [...cells].every((cell) => {
            return cell.classList.contains("x") || cell.classList.contains("o");
        });
    };

    const endGame = (draw) => {
        gameActive = false;
        if (draw) {
            messageElement.textContent = "It's a draw! 🤝";
            drawSound.play();
        } else {
            const winner = isPlayer1Turn ? player1NameInput.textContent || 'Player 1' : player2NameInput.textContent || 'Player 2';
            if (!isPlayer1Turn && isPlayerVsAI) {
                messageElement.textContent = "AI Wins! 😢";
                lossSound.play();
            } else {
                messageElement.textContent = `${winner} Wins! 🥳🎉`;
                winSound.play();
                if (isPlayer1Turn) {
                    player1Score++;
                    player1ScoreElement.textContent = player1Score;
                } else {
                    player2Score++;
                    player2ScoreElement.textContent = player2Score;
                }
                triggerConfetti();
            }
        }
        popup.style.display = "flex";
    };

    const restartGame = () => {
        cells.forEach((cell) => {
            cell.classList.remove("x");
            cell.classList.remove("o");
        });
        gameActive = true;
        isPlayer1Turn = true;
        updateTurnIndicator();
        popup.style.display = "none";
        restartSound.currentTime = 0;
        restartSound.play();
    };

    const resetScores = () => {
        player1Score = 0;
        player2Score = 0;
        player1ScoreElement.textContent = player1Score;
        player2ScoreElement.textContent = player2Score;
        restartSound.currentTime = 0;
        restartSound.play();
    };

    const aiMove = () => {
        let bestScore = -Infinity;
        let move;

        cells.forEach((cell, index) => {
            if (!cell.classList.contains("x") && !cell.classList.contains("o")) {
                cell.classList.add("o");
                let score = minimax(cells, 0, false, 0.9);
                cell.classList.remove("o");
                if (score > bestScore) {
                    bestScore = score;
                    move = index;
                }
            }
        });

        cells[move].classList.add("o");

        if (checkWin("o")) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            isPlayer1Turn = true;
            updateTurnIndicator();
        }
    };

    const minimax = (newBoard, depth, isMaximizing, difficulty) => {
        if (checkWin("o")) {
            return 10 - depth;
        } else if (checkWin("x")) {
            return depth - 10;
        } else if (isDraw()) {
            return 0;
        }

        if (Math.random() > difficulty) {
            return (Math.random() * 2 - 1) * 10;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            newBoard.forEach((cell) => {
                if (!cell.classList.contains("x") && !cell.classList.contains("o")) {
                    cell.classList.add("o");
                    let score = minimax(newBoard, depth + 1, false, difficulty);
                    cell.classList.remove("o");
                    bestScore = Math.max(score, bestScore);
                }
            });
            return bestScore;
        } else {
            let bestScore = Infinity;
            newBoard.forEach((cell) => {
                if (!cell.classList.contains("x") && !cell.classList.contains("o")) {
                    cell.classList.add("x");
                    let score = minimax(newBoard, depth + 1, true, difficulty);
                    cell.classList.remove("x");
                    bestScore = Math.min(score, bestScore);
                }
            });
            return bestScore;
        }
    };

    const triggerConfetti = () => {
        createConfetti();
    };

    function createConfetti() {
        for (let i = 0; i < 200; i++) {
            const confetti = document.createElement("div");
            confetti.classList.add("confetti");
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `-10%`;
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confettiContainer.appendChild(confetti);
            animateConfetti(confetti);
        }
    }

    function animateConfetti(confetti) {
        const duration = Math.random() * 3 + 2;
        confetti.style.animation = `confettiAnimation ${duration}s forwards`;

        confetti.addEventListener('animationend', () => {
            confettiContainer.removeChild(confetti);
        });
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    const switchPlayers = () => {
        moveSound.currentTime = 0; // Ensure the sound starts from the beginning
        moveSound.play();  // Play move sound
        const tempName = player1NameInput.textContent;
        player1NameInput.textContent = player2NameInput.textContent;
        player2NameInput.textContent = tempName;

        const tempScore = player1Score;
        player1Score = player2Score;
        player2Score = tempScore;

        player1ScoreElement.textContent = player1Score;
        player2ScoreElement.textContent = player2Score;

        isPlayer1Turn = true;
        updateTurnIndicator();
        restartGame();

        if (isPlayerVsAI) {
            isPlayer1Turn = !isPlayer1Turn;
            setTimeout(aiMove, 500);
        }
    };

    cells.forEach((cell) => {
        cell.addEventListener("click", handleCellClick);
    });

    restartButton.addEventListener("click", restartGame);
    popupRestartButton.addEventListener("click", restartGame);
    resetScoresButton.addEventListener("click", resetScores);
    switchPlayersButton.addEventListener("click", switchPlayers);

    pvpModeButton.addEventListener("click", () => {
        moveSound.currentTime = 0; // Ensure the sound starts from the beginning
        moveSound.play(); // Play move sound
        isPlayerVsAI = false;
        pvpModeButton.classList.add('selected');
        pvaModeButton.classList.remove('selected');
        player2NameInput.textContent = originalPlayer2Name;
        switchPlayersButton.disabled = false;
        resetScores();
        restartGame();
    });

    pvaModeButton.addEventListener("click", () => {
        moveSound.currentTime = 0; // Ensure the sound starts from the beginning
        moveSound.play(); // Play move sound
        isPlayerVsAI = true;
        pvpModeButton.classList.remove('selected');
        pvaModeButton.classList.add('selected');
        originalPlayer2Name = player2NameInput.textContent;
        player2NameInput.textContent = 'AI';
        switchPlayersButton.disabled = true;
        resetScores();
        restartGame();
    });

    player1NameInput.addEventListener("input", updateTurnIndicator);
    player2NameInput.addEventListener("input", updateTurnIndicator);

    pvpModeButton.click();
    updateTurnIndicator();
});

