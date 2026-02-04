//alert("Welcome to the Memory Game! Click 'New Game' to start🎮. Good luck:)");
// STORAGE KEYS
const GAME_KEY = "memoryGameState";
const GLOBAL_MOVES_KEY = "totalMovesAllTabs";
// DOM ELEMENTS
const gameBoard = document.getElementById("gameBoard");
const difficultySelect = document.getElementById("difficulty");
const newGameBtn = document.getElementById("newGameBtn");
const movesDisplay = document.getElementById("moves");
const timeDisplay = document.getElementById("time");
const messageDisplay = document.getElementById("message");
const totalMovesDisplay = document.getElementById("totalMoves");
const flipSound = document.getElementById("flipSound");

// GAME STATE
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;

function saveGameState(size) {
  const state = {
    values: cards.map(card => ({
      value: card.dataset.value,
      flipped: card.classList.contains("flipped"),
      matched: card.classList.contains("matched")
    })),
    moves,
    timer,
    size
  };

  sessionStorage.setItem(GAME_KEY, JSON.stringify(state));
}

function loadGameState() {
  const saved = sessionStorage.getItem(GAME_KEY);
  if (!saved) return false;

  const state = JSON.parse(saved);

  moves = state.moves;
  timer = state.timer;

  movesDisplay.textContent = moves;

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  timeDisplay.textContent =
    `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  createBoard(state.size, state.values);

  return true;
}

function generateCardValues(size) {
  const totalCards = size * size;
  const values = [];

  for (let i = 1; i <= totalCards / 2; i++) {
    values.push(i, i); // matching pairs
  }

  return shuffle(values);
}
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createBoard(size, savedValues = null) {
  gameBoard.innerHTML = "";
  cards = [];
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  timer = 0;

  movesDisplay.textContent = moves;
  timeDisplay.textContent = timer;
  messageDisplay.textContent = "";

  clearInterval(timerInterval);
  startTimer();

  gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  const cardSizeMap = {
  4: "70px",
  6: "55px",
  8: "42px"
};

  gameBoard.style.setProperty("--card-size", cardSizeMap[size]);

  const values = savedValues
  ? savedValues.map(v => v.value)
  : generateCardValues(size);


  values.forEach((value, i) => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.value = value;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front"></div>
      <div class="card-back">${value}</div>
    </div>
`;

  if (savedValues && savedValues[i].flipped) {
    card.textContent = value;
    card.classList.add("flipped");
  }

  if (savedValues && savedValues[i].matched) {
    card.textContent = value;
    card.classList.add("matched");
  }

  card.addEventListener("click", () => flipCard(card));

  gameBoard.appendChild(card);
  cards.push(card);
});
}

function flipCard(card) {
  if (!gameStarted) return;

  if (
    flippedCards.length === 2 ||
    card.classList.contains("matched") ||
    flippedCards.includes(card)
  ) {
    return;
  }

  //card.textContent = card.dataset.value;
  flipSound.currentTime = 0;
  flipSound.play();
  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesDisplay.textContent = moves;

    saveGameState(Number(difficultySelect.value));
    updateGlobalMoves();

    checkMatch();
  }
}

function updateGlobalMoves() {
  let total = localStorage.getItem(GLOBAL_MOVES_KEY);
  total = total ? parseInt(total) : 0;
  total++;

  localStorage.setItem(GLOBAL_MOVES_KEY, total);
  totalMovesDisplay.textContent = total;
}


function checkMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.value === card2.dataset.value) {
    card1.classList.add("matched");
    card2.classList.add("matched");
    matchedPairs++;

    flippedCards = [];

    if (matchedPairs === cards.length / 2) {
      endGame();
    }
  } else {
    setTimeout(() => {
      //card1.textContent = "";
      //card2.textContent = "";
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
    }, 800);
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;

    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    timeDisplay.textContent =
      `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  gameStarted = false;

  messageDisplay.textContent = `🎉 You won! ${moves} moves in ${timer}s — impressive! 🧠✨`;
}

newGameBtn.addEventListener("click", () => {
  const size = Number(difficultySelect.value);
  gameStarted = true;       
  createBoard(size);
});

// AUTO LOAD ON REFRESH
window.onload = () => {
  const loaded = loadGameState();
  if (loaded) gameStarted = true;

  const total = localStorage.getItem(GLOBAL_MOVES_KEY) || 0;
  totalMovesDisplay.textContent = total;

};

