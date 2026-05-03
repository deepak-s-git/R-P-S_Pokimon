const powerBtn = document.querySelector("#power-btn"); 
const muteBtn = document.querySelector("#mute-btn"); 
const muteBtnIcon = document.querySelector("#mute-btn i")
const battleMusic = document.querySelector("#battle-music"); 

const view = document.querySelector("#view");
const textBox = document.querySelector(".textbox"); 
const openAnimation = document.querySelector(".open-animation"); 

const playerImg = document.querySelector(".player");
const computerImg = document.querySelector(".computer");
const computerScoreRender = document.querySelector(".computer-tag-score"); 
const playerScoreRender = document.querySelector(".player-tag-score"); 
const playerChoiceEl = document.querySelector(".player-choice"); 
const computerChoiceEl = document.querySelector(".computer-choice"); 

// when isAnimating is true, no other animations can be started 
// i.e. clicking on buttons will have no effect. 
let isAnimating = false; 
// when isGameEnding is true, the choices buttons will have no effect 
let isGameEnding = false;
let isPlaying = false;
let timer = null; 
// sets the initial value for debugging purposes 
let initPlayerScore = 0, initComputerScore = 0;
let playerScore = initPlayerScore, computerScore = initComputerScore; 
let textQueue = []; 
let animateTextDoneEvent = new CustomEvent("animatetextdone", {
}); 