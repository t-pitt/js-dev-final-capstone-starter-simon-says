/**
 * DOM SELECTORS
 */

const startButton = document.querySelector(".js-start-button");
const statusSpan = document.querySelector(".js-status");
const skillLevelSpan = document.querySelector(".js-skill-level");
const heading = document.querySelector(".js-heading");
const padContainer = document.querySelector(".js-pad-container");
const main = document.querySelector("main");

/**
 * VARIABLES
 */
let computerSequence = []; // track the computer-generated sequence of pad presses
let playerSequence = []; // track the player-generated sequence of pad presses
let maxRoundCount = 0; // the max number of rounds, varies with the chosen level
let roundCount = 0; // track the number of rounds that have been played so far
let skillLevel = 1; // track the player assigned skill level

/**
 * The `pads` array contains an array of pad objects.
 *
 * Each pad object contains the data related to a pad: `color`, `sound`, and `selector`.
 * - The `color` property is set to the color of the pad (e.g., "red", "blue").
 * - The `selector` property is set to the DOM selector for the pad.
 * - The `sound` property is set to an audio file using the Audio() constructor.
 * - The `number` property is set to the skill level that pad represents.
 */

 const pads = [
  {
    color: "red",
    selector: document.querySelector(".js-pad-red"),
    sound: new Audio("../assets/simon-says-sound-1.mp3"),
    number: 1
  },
  {
    color: "green",
    selector: document.querySelector(".js-pad-green"),
    sound: new Audio("../assets/simon-says-sound-2.mp3"),
    number: 2
  },
  {
    color: "blue",
    selector: document.querySelector(".js-pad-blue"),
    sound: new Audio("../assets/simon-says-sound-3.mp3"),
    number: 3
  },
  {
    color: "yellow",
    selector: document.querySelector(".js-pad-yellow"),
    sound: new Audio("../assets/simon-says-sound-4.mp3"),
    number: 4
  }
];

/**
 * EVENT LISTENERS
 */

padContainer.addEventListener("click", padHandler);
startButton.addEventListener("click", startButtonHandler);

/**
 * EVENT HANDLERS
 */

// Handles when the start button is clicked. Starts the game with the skill level.
function startButtonHandler() {
  maxRoundCount = setLevel(skillLevel);
  roundCount++;
  startButton.classList.add("hidden");
  skillLevelSpan.classList.add("hidden");
  main.classList.remove("pre-game");
  clearButtons();
  statusSpan.classList.remove("hidden");
  playComputerTurn();
  return { startButton, statusSpan };
}

// Handles when a pad is clicked. If the game hasn't started, it sets the skill level,
// otherwise it checks the current pad against the computer's sequence.
function padHandler(event) {
  console.log(event.target.dataset);
  const { color, level } = event.target.dataset;
  let pad;
  // Check if the event was the pad or span and get the approriate pad from the data
  if (color) {
    pad = pads.find(pad => pad.color == color);
  } else if (level) {
    pad = pads.find(pad => pad.number == level);
  } else {
    return;
  }

  // Check if the game has started. If it has, check the press, otherwise set the skill level
  if (maxRoundCount != 0) {
    pad.sound.play();
    checkPress(color);
  } else {
    skillLevel = pad.selector.querySelector("span").textContent;
    setText(skillLevelSpan, `Current Skill Level: ${skillLevel}`);
  }
  return color;
}

/**
 * HELPER FUNCTIONS
 */

// Sets the level of the game given a `level` parameter. Returns the length of the sequence
// for a valid `level` parameter (1 - 4) or an error message otherwise.
function setLevel(level = 1) {
  let rounds = 0;
  if (level == 1) {
    rounds = 8;
  } else if (level == 2) {
    rounds = 14;
  } else if (level == 3) {
    rounds = 20;
  } else if (level == 4) {
    rounds = 31;
  } else {
    rounds = "Please enter level 1, 2, 3, or 4";
  }
  return rounds;
}

// Returns a randomly selected item from the given collection.
function getRandomItem(collection) {
  if (collection.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * collection.length);
  return collection[randomIndex];
}

// Sets the status text of a given HTML element with the given text.
function setText(element, text) {
  element.textContent = text;
  return element;
}

// Activates a pad of a given color by playing its sound and lighting it up.
function activatePad(color) {
  let pad = pads.find(pad => pad.color == color);
  pad.selector.classList.add("activated");
  pad.sound.play();
  setTimeout(() => pad.selector.classList.remove("activated"), 500);
}

// Activates a sequence of colors passed as an array to the function.
function activatePads(sequence) {
  let currentPad = 1;
  sequence.forEach(function(padColor) {
    setTimeout(() => activatePad(padColor), 600 * currentPad)
    currentPad++;
  });
}

// Allows the computer to play its turn. Adds a new random colors to the computer's
// sequence that the player must then repeat back.
function playComputerTurn() {
  padContainer.classList.add("unclickable");
  setText(statusSpan, "The computer's turn...");
  setText(heading, `Round ${roundCount} out of ${maxRoundCount}`);
  computerSequence.push(getRandomItem(pads).color);
  activatePads(computerSequence);
  setTimeout(() => playHumanTurn(roundCount), roundCount * 600 + 1000);
}

// Allows the player to play their turn.
function playHumanTurn() {
  padContainer.classList.remove("unclickable");
  playerSequence = [];
  setText(statusSpan, `Sequence has ${computerSequence.length - playerSequence.length} pad${computerSequence.length - playerSequence.length > 1 ? "s" : ""} remaining`);
}

// Checks the player's selection every time the player presses a pad.
function checkPress(color) {
  playerSequence.push(color);
  let index = playerSequence.length - 1;
  let remainingPresses = computerSequence.length - playerSequence.length;
  setText(statusSpan, `Sequence has ${remainingPresses} pad${remainingPresses > 1 ? "s" : ""} remaining`);
  if (playerSequence[index] != computerSequence[index]) {
    resetGame("Simon didn't say that");
  } else if (remainingPresses === 0) {
    checkRound();
  }
}

// Checks each round to see if the player has completed all the rounds of the game 
// or advance to the next round if the game has not finished.
function checkRound() {
  if (playerSequence.length === maxRoundCount) {
    resetGame("Simon said that, and so did you!");
  } else {
    roundCount++;
    setText(statusSpan, "Simon has more to say, keep listening")
    setTimeout(() => playComputerTurn(), 1000);
  }
}

// Returns the game to the starting settings.
function resetGame(text) {
  alert(text);
  setText(heading, "Simon Says Something");
  startButton.classList.remove("hidden");
  skillLevelSpan.classList.remove("hidden");
  statusSpan.classList.add("hidden");
  main.classList.add("pre-game");
  numberButtons();
  computerSequence = [];
  playerSequence = [];
  maxRoundCount = 0;
  roundCount = 0;
}

// Removes the skill level numbers from the pads.
function clearButtons() {
  pads.forEach(function(pad) {
    setText(pad.selector.querySelector("span"), "");
  });
}

// Returns the numbers to the pads that indicate the skill level.
function numberButtons() {
  pads.forEach(function(pad) {
    setText(pad.selector.querySelector("span"), pad.number);
  });
}

/**
 * Please do not modify the code below.
 * Used for testing purposes.
 *
 */
window.statusSpan = statusSpan;
window.heading = heading;
window.padContainer = padContainer;
window.pads = pads;
window.computerSequence = computerSequence;
window.playerSequence = playerSequence;
window.maxRoundCount = maxRoundCount;
window.roundCount = roundCount;
window.startButtonHandler = startButtonHandler;
window.padHandler = padHandler;
window.setLevel = setLevel;
window.getRandomItem = getRandomItem;
window.setText = setText;
window.activatePad = activatePad;
window.activatePads = activatePads;
window.playComputerTurn = playComputerTurn;
window.playHumanTurn = playHumanTurn;
window.checkPress = checkPress;
window.checkRound = checkRound;
window.resetGame = resetGame;
