const powerBtn = document.querySelector("#power-btn"); 
const muteBtn = document.querySelector("#mute-btn"); 
const muteBtnIcon = document.querySelector("#mute-btn i")
const themeBtn = document.querySelector("#theme-btn");
const themeBtnIcon = document.querySelector("#theme-btn i");
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

let playerHistory = [];
let transitions = {
    rock: { rock: 0, paper: 0, scissors: 0 },
    paper: { rock: 0, paper: 0, scissors: 0 },
    scissors: { rock: 0, paper: 0, scissors: 0 }
};
const difficultySelect = document.querySelector("#difficulty-select");

function loadDifficulty() {
    const savedDifficulty = localStorage.getItem("pokimonDifficulty") || "medium";
    difficultySelect.value = savedDifficulty;
}
difficultySelect.addEventListener("change", (e) => {
    localStorage.setItem("pokimonDifficulty", e.target.value);
    if (isPlaying && !isGameEnding) {
        showMsg(`Difficulty changed to ${e.target.value.toUpperCase()}`);
    }
});
loadDifficulty();


// THEME TOGGLE FUNCTIONS
function applyTheme(theme) {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${theme}`);

    if (theme === "dark") {
        themeBtnIcon.classList.remove("fa-moon");
        themeBtnIcon.classList.add("fa-sun");
    } else {
        themeBtnIcon.classList.remove("fa-sun");
        themeBtnIcon.classList.add("fa-moon");
    }

    localStorage.setItem("pokimonTheme", theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem("pokimonTheme") || "light";
    applyTheme(savedTheme);
}

themeBtn.onclick = () => {
    const nextTheme = document.body.classList.contains("theme-dark") ? "light" : "dark";
    applyTheme(nextTheme);
};

// Load theme immediately (script is deferred, so DOM is ready)
loadTheme();


let introTimer = null;

// initializes game
function gameInit() {
    renderScore();
    
    // Start intro sequence
    view.classList.add("intro-playing");
    const introScreen = document.getElementById("intro-screen");
    introScreen.classList.add("active");
    
    introTimer = setTimeout(() => {
        if (!isPlaying) return; // if powered off during intro
        introScreen.classList.remove("active");
        
        // After fade out, trigger main game animation
        setTimeout(() => {
            if (!isPlaying) return;
            view.classList.remove("intro-playing");
            view.classList.add("init"); 
        }, 500);
    }, 4000); // Intro length
}

// text prompt when game starts 
function startGame() {
    const diff = difficultySelect.value.toUpperCase();
    textQueue.push(`Welcome to Rock Paper Scissors (Pokemon Version). Mode: ${diff}. First to 5 wins!`); 
    textQueue.push("Choose from the buttons to the right. (click STATUS to see the current score)"); 
}


// resets variables and end game 
function gameEnd() {
    isPlaying = false;
    isGameEnding = false;
    textQueue = [];
    clearTimeout(timer);
    clearTimeout(introTimer);
    playerScore = initPlayerScore; 
    computerScore = initComputerScore;
    playerHistory = [];
    transitions = {
        rock: { rock: 0, paper: 0, scissors: 0 },
        paper: { rock: 0, paper: 0, scissors: 0 },
        scissors: { rock: 0, paper: 0, scissors: 0 }
    };
    
    document.getElementById("intro-screen").classList.remove("active");
    view.classList.remove("intro-playing");
    view.classList.remove("init");
    view.classList.remove("no-screen"); 
    computerImg.style.right = "-35%"; 
    playerImg.style.left = "-35%"
    textBox.textContent = ""; 
}


function getCounterMove(move) {
    if (move === "rock") return "paper";
    if (move === "paper") return "scissors";
    if (move === "scissors") return "rock";
    return getRandomMove();
}

function getRandomMove() {
    const CHOICES = ["rock", "paper", "scissors"]; 
    return CHOICES[Math.floor(Math.random() * 3)]; 
}

// RPS game logic 
function computerPlay() {
    const difficulty = difficultySelect.value;
    if (difficulty === "easy" || playerHistory.length === 0) {
        return getRandomMove();
    }

    let lastMove = playerHistory[playerHistory.length - 1];

    if (difficulty === "medium") {
        if (Math.random() < 0.4) {
            return getCounterMove(lastMove);
        }
        return getRandomMove();
    }

    if (difficulty === "hard") {
        let possibleNextMoves = transitions[lastMove];
        let predictedMove = "rock";
        let maxCount = -1;
        
        for (let move in possibleNextMoves) {
            if (possibleNextMoves[move] > maxCount) {
                maxCount = possibleNextMoves[move];
                predictedMove = move;
            }
        }
        
        if (maxCount === 0) {
            let moveCounts = { rock: 0, paper: 0, scissors: 0 };
            playerHistory.forEach(m => moveCounts[m]++);
            let freqMove = "rock";
            let maxFreq = -1;
            for (let m in moveCounts) {
                if (moveCounts[m] > maxFreq) {
                    maxFreq = moveCounts[m];
                    freqMove = m;
                }
            }
            return getCounterMove(freqMove);
        }

        if (Math.random() < 0.8) {
            return getCounterMove(predictedMove);
        } else {
            return getRandomMove();
        }
    }
    
    return getRandomMove();
}

function getResult(playerSelection, computerSelection) {
    playerSelection = playerSelection; 
    computerSelection = computerSelection; 
    if (playerSelection === computerSelection) {
        return (`A Tie! ${playerSelection} and ${computerSelection}`); 
    } else if (playerSelection === "rock" && computerSelection === "scissors" ||
        playerSelection === "scissors" && computerSelection === "paper" || 
        playerSelection === "paper" && computerSelection === "rock") {
            return (`You Win! ${playerSelection} beats ${computerSelection}`); 
        } else {
            return (`You Lose! ${computerSelection} beats ${playerSelection}`); 
        }
}

function checkGameOver() {
    if (playerScore === 5 || computerScore === 5) {
        if (playerScore === 5) {
            isGameEnding = true; 
            timer = setTimeout(()=>{gameEnd()}, 5000); 
            return "You Win! Thanks for playing"; 
        }
        else {
            isGameEnding = true; 
            timer = setTimeout(()=>{gameEnd()}, 5000); 
            return "You Lose! Thanks for playing"; 
        }
    }
    return ''; 
}

function playRound(playerSelection) {
    if (!isAnimating && !isGameEnding) {     
        let computerSelection = computerPlay(); 
        
        if (playerHistory.length > 0) {
            let lastMove = playerHistory[playerHistory.length - 1];
            transitions[lastMove][playerSelection]++;
        }
        playerHistory.push(playerSelection);

        playerChoiceEl.src=`images/choices/${playerSelection}.png`;
        playerChoiceEl.classList.add("shoot");
        computerChoiceEl.src=`images/choices/${computerSelection}.png`;
        computerChoiceEl.classList.add("shoot");
        let result = getResult(playerSelection, computerSelection); 
        if (result.indexOf("Win") != -1) {
            playerScore++; 
            computerImg.classList.add("hurt");
        } else if (result.indexOf("Lose") != -1) {
            computerScore++; 
            playerImg.classList.add("hurt");
        } else {
            computerImg.classList.add("tie"); 
            playerImg.classList.add("tie"); 
        }
        renderScore(playerScore, computerScore); 
        showMsg(result, checkGameOver()); 
    }
}

// Text animation 
function showMsg(...msgs) {
    if (!isAnimating) {
        msgs.forEach(msg => {
            if (msg !== ''){
                textQueue.push(msg); 
            }
        })
        view.dispatchEvent(animateTextDoneEvent); 

    }
}

function animateFirstChar(msg){
    if (msg !== '') {
        let charEl = document.createElement("span"); 
        charEl.textContent = msg[0]; 
        textBox.appendChild(charEl); 
        timer = setTimeout(()=>{animateFirstChar(msg.slice(1));}, 20); 
    } else {
        isAnimating = false; 
        view.dispatchEvent(animateTextDoneEvent);
    }    
}    

function animateText(msg) {
    textBox.textContent = "";
    animateFirstChar(msg); 
}


// score rendering 
function renderScore() {
    computerScoreRender.style.width = `${((1-(playerScore / 5)) * 100).toFixed(0)}%`
    playerScoreRender.style.width = `${((1-(computerScore / 5)) * 100).toFixed(0)}%`
}


// EVENT LISTENERS 
// powerBtn: start / restart game 
powerBtn.onclick = () => {
    isPlaying = !isPlaying; 
    (isPlaying) ? gameInit() : gameEnd();
}
// muteBtn: mute / play
muteBtn.onclick = () => {
    muteBtnIcon.classList.toggle("fa-volume-mute")
    muteBtnIcon.classList.toggle("fa-volume-up")
    if (battleMusic.paused) {
        battleMusic.play(); 
    } else {
        battleMusic.pause(); 
    }
}

// loops music 
battleMusic.addEventListener("ended", () => {
    battleMusic.currentTime = 0; 
    battleMusic.play();
})


// displays text and set player, computer position when start screen animation ends 
view.addEventListener("animationend", (e) => {
    if (e.animationName === "open-animation") {
        view.classList.add("no-screen");
        view.classList.remove("init");    
        computerImg.style.right = "7%"; 
        playerImg.style.left = "-3%"
        startGame();
        view.dispatchEvent(animateTextDoneEvent); 
    }
})

// animate text from queue 
view.addEventListener("animatetextdone", () => {
    if (textQueue.length !== 0) {
        isAnimating = true; 
        timer = setTimeout(()=>{animateText(textQueue.shift())}, 1000); 
    }
})

// stops choices animation 
playerChoiceEl.addEventListener("animationend", (e) => {
    if (e.animationName === "player-shoot"){
        playerChoiceEl.classList.remove("shoot");
    }
})

computerChoiceEl.addEventListener("animationend", (e) => {
    if (e.animationName === "computer-shoot"){
        computerChoiceEl.classList.remove("shoot");
    }
})


// stops player & computer animation on "hurt" or "tie" 
playerImg.addEventListener("animationend", (e) => {
    if (e.animationName === "hurt"){
        playerImg.classList.remove("hurt");
    }
    if (e.animationName === "tie") {
        playerImg.classList.remove("tie"); 
    }
})

computerImg.addEventListener("animationend", (e) => {
    if (e.animationName === "hurt"){
        computerImg.classList.remove("hurt");
    }
    if (e.animationName === "tie") {
        computerImg.classList.remove("tie"); 
    }
})


// the choices buttons 
document.querySelector("#statusBtn").onclick = () => {
    if (!isGameEnding){
        showMsg(`Your score: ${playerScore}, Computer score: ${computerScore}`); 
    }
}
document.querySelector("#rockBtn").onclick = () => {
   playRound("rock"); 
}
document.querySelector("#paperBtn").onclick = () => {
    playRound("paper"); 
}
document.querySelector("#scissorsBtn").onclick = () => {
    playRound("scissors"); 
}