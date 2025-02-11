// Ensure the DOM is loaded before running the game logic.
document.addEventListener("DOMContentLoaded", () => {
  // ======== DOM Elements ========
  const cells = document.querySelectorAll(".cell");
  const player1NameInput = document.getElementById("player1-name");
  const player2NameInput = document.getElementById("player2-name");
  const player1ScoreEl = document.getElementById("player1-score");
  const player2ScoreEl = document.getElementById("player2-score");
  const turnIndicatorEl = document.getElementById("current-turn");
  const popup = document.getElementById("popup");
  const endgameMessage = document.getElementById("endgame-message");
  const closePopupBtn = document.getElementById("close-popup");
  const restartBtn = document.getElementById("restart-btn");
  const resetScoresBtn = document.getElementById("reset-scores-btn");
  const switchNamesBtn = document.getElementById("switch-names-btn");
  const modePvPBtn = document.getElementById("mode-pvp");
  const modePvABtn = document.getElementById("mode-pva");

  // Audio Elements
  const moveSound = document.getElementById("move-sound");
  const winSound = document.getElementById("win-sound");
  const drawSound = document.getElementById("draw-sound");
  const lossSound = document.getElementById("loss-sound");
  const restartSound = document.getElementById("restart-sound");

  // ======== Game State Variables ========
  let board = Array(9).fill(""); // Game board as an array of 9 cells
  let currentPlayer = "X"; // "X" always starts
  let gameActive = true; // Tracks whether the game is still active
  let gameMode = "PvP"; // Default mode: Player vs Player. (PvA sets AI as "O")
  let aiDifficulty = "hard"; // Options: "easy", "medium", "hard"
  let scores = { X: 0, O: 0 };

  // Winning combinations: indexes corresponding to board cells.
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  // ======== Helper Functions ========

  // Update the turn indicator to display the active player's name and color.
  function updateTurnIndicator() {
    const activeName =
      currentPlayer === "X" ? player1NameInput.value : player2NameInput.value;
    turnIndicatorEl.textContent = activeName;
    // Change color based on the current player.
    turnIndicatorEl.style.color = currentPlayer === "X" ? "#6a82fb" : "#fc5c7d";
  }

  // Update the scoreboard with current scores.
  function updateScores() {
    player1ScoreEl.textContent = scores.X;
    player2ScoreEl.textContent = scores.O;
  }

  // Reset the game board (but not the scores).
  function resetBoard() {
    board = Array(9).fill("");
    gameActive = true;
    currentPlayer = "X";
    cells.forEach(cell => {
      cell.textContent = "";
      cell.classList.remove("disabled");
    });
    updateTurnIndicator();
  }

  // Restart the game with a new board and play a restart sound.
  function restartGame() {
    resetBoard();
    restartSound.play();
  }

  // Reset both the board and the player scores.
  function resetScores() {
    scores = { X: 0, O: 0 };
    updateScores();
    restartGame();
  }

  // Check if the current board state is a win for the given player.
  function checkWin(boardState, player) {
    return winningCombinations.some(combo =>
      combo.every(index => boardState[index] === player)
    );
  }

  // Check if the board is full (i.e., a draw).
  function checkDraw(boardState) {
    return boardState.every(cell => cell !== "");
  }

  // End the game by showing a popup with the result (win/draw) and playing the corresponding sound.
  function endGame(result) {
    gameActive = false;
    if (result === "win") {
      const winnerName =
        currentPlayer === "X"
          ? player1NameInput.value
          : player2NameInput.value;
      endgameMessage.textContent = `${winnerName} wins!`;
      // Update score for the winning player.
      scores[currentPlayer]++;
      updateScores();
      // Play win (or loss) sound depending on game mode.
      if (gameMode === "PvA" && currentPlayer === "O") {
        winSound.play();
      } else if (gameMode === "PvA" && currentPlayer === "X") {
        winSound.play();
      } else {
        winSound.play();
      }
      triggerConfetti();
    } else if (result === "draw") {
      endgameMessage.textContent = "It's a draw!";
      drawSound.play();
    }
    popup.classList.remove("hidden");
  }

  // ======== Event Handlers ========

  // Handles a player's click on a cell.
  function handleCellClick(e) {
    const cell = e.target;
    const index = cell.getAttribute("data-cell-index");

    // Ignore clicks if game over or cell is already filled.
    if (!gameActive || board[index] !== "") return;

    // Update the board and UI.
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    moveSound.play();

    // Check for win or draw after the move.
    if (checkWin(board, currentPlayer)) {
      endGame("win");
      return;
    } else if (checkDraw(board)) {
      endGame("draw");
      return;
    }

    // Switch turn.
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnIndicator();

    // If in PvA mode and it is now the AI's turn, trigger the AI move.
    if (gameMode === "PvA" && currentPlayer === "O" && gameActive) {
      setTimeout(aiMove, 500); // Delay for realism
    }
  }

  // ======== AI Functions ========

  // AI move handler that chooses a move based on difficulty and then updates the board.
  function aiMove() {
    let index;
    if (aiDifficulty === "easy") {
      // For "easy", pick a random available move.
      const availableMoves = board
        .map((val, idx) => (val === "" ? idx : null))
        .filter(val => val !== null);
      index = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      // For "medium" and "hard", use the minimax algorithm.
      // Limit search depth for "medium" difficulty.
      const depthLimit = aiDifficulty === "medium" ? 3 : Infinity;
      index = getBestMove(board, depthLimit);
    }
    // Make the AI move.
    board[index] = currentPlayer;
    const cell = document.querySelector(`.cell[data-cell-index="${index}"]`);
    cell.textContent = currentPlayer;
    moveSound.play();

    // Check for win or draw.
    if (checkWin(board, currentPlayer)) {
      endGame("win");
      return;
    } else if (checkDraw(board)) {
      endGame("draw");
      return;
    }

    // Switch back to human's turn.
    currentPlayer = "X";
    updateTurnIndicator();
  }

  // Determines the best move for the AI using minimax.
  function getBestMove(newBoard, depthLimit) {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O"; // AI plays as "O"
        let score = minimax(newBoard, 0, false, depthLimit);
        newBoard[i] = "";
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  // Minimax algorithm implementation.
  // 'isMaximizing' is true when it's the AI's turn.
  function minimax(newBoard, depth, isMaximizing, depthLimit) {
    if (checkWin(newBoard, "O")) {
      return 10 - depth;
    }
    if (checkWin(newBoard, "X")) {
      return depth - 10;
    }
    if (checkDraw(newBoard) || depth === depthLimit) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] === "") {
          newBoard[i] = "O";
          let score = minimax(newBoard, depth + 1, false, depthLimit);
          newBoard[i] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] === "") {
          newBoard[i] = "X";
          let score = minimax(newBoard, depth + 1, true, depthLimit);
          newBoard[i] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  // ======== Confetti Effect ========
  function triggerConfetti() {
    // Create 30 confetti pieces with randomized positions and colors.
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.backgroundColor = getRandomColor();
      document.body.appendChild(confetti);
      // Remove each confetti piece after its animation ends.
      confetti.addEventListener("animationend", () => {
        confetti.remove();
      });
    }
  }

  // Helper to select a random color from a preset list.
  function getRandomColor() {
    const colors = ["#fc5c7d", "#6a82fb", "#fcb045", "#ff5f6d", "#d76d77"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ======== Event Listeners Registration ========
  cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick);
  });

  restartBtn.addEventListener("click", restartGame);
  resetScoresBtn.addEventListener("click", resetScores);
  closePopupBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    if (!gameActive) {
      resetBoard();
    }
  });

  // Switch player names and their associated scores.
  switchNamesBtn.addEventListener("click", () => {
    let tempName = player1NameInput.value;
    player1NameInput.value = player2NameInput.value;
    player2NameInput.value = tempName;

    let tempScore = scores.X;
    scores.X = scores.O;
    scores.O = tempScore;
    updateScores();
    updateTurnIndicator();
  });

  // Set game mode to Player vs Player.
  modePvPBtn.addEventListener("click", () => {
    gameMode = "PvP";
    resetBoard();
  });

  // Set game mode to Player vs AI.
  modePvABtn.addEventListener("click", () => {
    gameMode = "PvA";
    resetBoard();
  });

  // ======== Initialization ========
  updateTurnIndicator();
  updateScores();
});

