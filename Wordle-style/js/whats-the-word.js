// Famous food words - all 5 letters
const words = [
  "PIZZA",
  "PASTA",
  "BACON",
  "SUSHI",
  "STEAK",
  "BREAD",
  "SALAD",
  "TACOS",
  "CHILI",
  "APPLE"
];

// Game object
const game = {
  targetWord: "",
  currentRow: 0,
  guesses: ["", "", "", "", "", ""],
  feedback: [null, null, null, null, null, null],
  state: "playing",
  easyMode: false
};

// Page elements
const board = document.getElementById("board");
const statusMessage = document.getElementById("status-message");
const restartBtn = document.getElementById("restart-btn");
const guessCounter = document.getElementById("guess-counter");
const easyModeBtn = document.getElementById("easy-mode-btn");

// LOGIC LAYER

function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

function restartGame() {
  game.targetWord = getRandomWord();
  game.currentRow = 0;
  game.state = "playing";

  if (game.easyMode) {
    game.guesses = [""];
    game.feedback = [null];
  } else {
    game.guesses = ["", "", "", "", "", ""];
    game.feedback = [null, null, null, null, null, null];
  }
}

function processInput(key) {
  if (game.state !== "playing") {
    return;
  }

  let currentGuess = game.guesses[game.currentRow];

  // Add letters
  if (/^[A-Z]$/.test(key)) {
    if (currentGuess.length < 5) {
      game.guesses[game.currentRow] += key;
    }
    return;
  }

  // Remove letters
  if (key === "BACKSPACE") {
    game.guesses[game.currentRow] = currentGuess.slice(0, -1);
    return;
  }

  // Submit guess
  if (key === "ENTER") {
    if (currentGuess.length !== 5) {
      statusMessage.textContent = "Your guess must be 5 letters.";
      return;
    }

    submitGuess();
  }
}

function submitGuess() {
  const guess = game.guesses[game.currentRow];
  const result = checkGuess(guess, game.targetWord);

  game.feedback[game.currentRow] = result;

  if (guess === game.targetWord) {
    if (game.currentRow === 0) {
      game.state = "first-win";
    } else {
      game.state = "win";
    }
    return;
  }

  if (game.easyMode) {
    game.currentRow++;
    game.guesses.push("");
    game.feedback.push(null);
    createBoard();
    return;
  }

  if (game.currentRow === 5) {
    game.state = "lose";
    return;
  }

  game.currentRow++;
}

function checkGuess(guess, target) {
  const result = ["absent", "absent", "absent", "absent", "absent"];

  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
    } else if (target.includes(guess[i])) {
      result[i] = "present";
    }
  }

  return result;
}

// UI LAYER

function createBoard() {
  board.innerHTML = "";

  for (let row = 0; row < game.guesses.length; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    for (let col = 0; col < 5; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.id = "tile-" + row + "-" + col;
      rowDiv.appendChild(tile);
    }

    board.appendChild(rowDiv);
  }
}

function renderGame() {
  for (let row = 0; row < game.guesses.length; row++) {
    const guess = game.guesses[row];
    const feedbackRow = game.feedback[row];

    for (let col = 0; col < 5; col++) {
      const tile = document.getElementById("tile-" + row + "-" + col);

      tile.textContent = guess[col] || "";
      tile.className = "tile";

      if (feedbackRow && feedbackRow[col]) {
        tile.classList.add(feedbackRow[col]);
      }
    }
  }

  if (game.state === "playing") {
    statusMessage.textContent = "Type a 5-letter word to begin.";
  } else if (game.state === "first-win") {
    statusMessage.textContent = "Congrats pal, but we need to touch some grass!";
  } else if (game.state === "win") {
    statusMessage.textContent = "Oh wow you actually did it!";
  } else if (game.state === "lose") {
    statusMessage.textContent = "Just testing how to lose gracefully I see! The word was " + game.targetWord + ".";
  }

  if (game.state === "playing") {
    if (game.easyMode) {
      guessCounter.textContent = "Guess: " + (game.currentRow + 1) + " (Easy Mode: unlimited)";
    } else {
      guessCounter.textContent = "Guess: " + (game.currentRow + 1) + " of 6";
    }
  } else {
    guessCounter.textContent = "Game finished";
  }

  if (game.easyMode) {
    easyModeBtn.textContent = "Easy Mode: On";
  } else {
    easyModeBtn.textContent = "Easy Mode: Off";
  }
}

// EVENTS

document.addEventListener("keydown", function (event) {
  const key = event.key.toUpperCase();
  processInput(key);
  renderGame();
});

restartBtn.addEventListener("click", function () {
  restartGame();
  createBoard();
  renderGame();
});

easyModeBtn.addEventListener("click", function () {
  game.easyMode = !game.easyMode;
  restartGame();
  createBoard();
  renderGame();
});

// Start the game
restartGame();
createBoard();
renderGame();

// Optional testing line
console.log("Target word:", game.targetWord);
