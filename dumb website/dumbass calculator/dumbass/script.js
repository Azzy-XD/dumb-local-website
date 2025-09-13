// Dumbass calculator state
let isMatrixActive = false;
let displayValue = '';
let isResultDisplayed = false;
const display = document.getElementById('display');
const matrixOverlay = document.getElementById('matrixOverlay');
const calculator = document.getElementById('calculator');
const resultMessage = document.getElementById('resultMessage');
const cpuUsageDisplay = document.getElementById('cpuUsage');
const resultFound = document.getElementById('resultFound');
const finalResult = document.getElementById('finalResult');

// Matrix effect variables
const matrixCanvas = document.getElementById('matrixCanvas');
const ctx = matrixCanvas.getContext('2d');
let drops = [];
let columns;

// Initialize the dumbass calculator
function init() {
    console.log('PIXELOS v2.1.4 - DUMBASS CALCULATOR INITIALIZED');
    updateCPUUsage();
    window.addEventListener('resize', setupMatrix);
    setupMatrix();
    clearInput();
}

// Handle all button inputs (except equals)
function handleInput(value) {
    if (isResultDisplayed) {
        if (!isNaN(value) || value === '.') {
            displayValue = ''; // Clear for new calculation
        }
        isResultDisplayed = false;
    }

    // Check for multiple operators and decimal points
    const lastChar = displayValue.slice(-1);
    if (['+', '-', '*', '/', '.'].includes(value) && ['+', '-', '*', '/', '.'].includes(lastChar)) {
        return; // Don't allow multiple operators or decimals in a row
    }

    displayValue += value;
    updateDisplay();
    addGlitchEffect(event.target);
}

// Clear the display
function clearInput() {
    displayValue = '';
    updateDisplay();
    isResultDisplayed = false;
}

// Toggle sign
function toggleSign() {
    if (displayValue !== '' && !isNaN(displayValue)) {
        displayValue = (parseFloat(displayValue) * -1).toString();
        updateDisplay();
    }
}

// Handle percentage
function handlePercentage() {
    if (displayValue !== '' && !isNaN(displayValue)) {
        displayValue = (parseFloat(displayValue) / 100).toString();
        updateDisplay();
    }
}

// Update the calculator display
function updateDisplay() {
    display.textContent = displayValue.replace('*', '×').replace('/', '÷');
}

// Add a glitch effect to an element
function addGlitchEffect(element) {
    element.classList.add('glitch-effect');
    setTimeout(() => {
        element.classList.remove('glitch-effect');
    }, 500);
}

// Update the CPU usage randomly
function updateCPUUsage() {
    const usage = Math.floor(Math.random() * 80) + 20; // 20-100%
    const blocks = '█'.repeat(Math.floor(usage / 10)) + '░'.repeat(10 - Math.floor(usage / 10));
    cpuUsageDisplay.textContent = `CPU: ${blocks} ${usage}%`;
    setTimeout(updateCPUUsage, 2000);
}

// Function to handle the equals button - MODIFIED TO RETURN RANDOM RESULT
function showMatrixEffect() {
    if (isMatrixActive || displayValue === '') {
        return;
    }

    calculator.classList.add('shake-effect');

    // Generate a random result instead of calculating
    const randomNumber = Math.floor(Math.random() * 999999999);
    const stupidAnswers = [
        "42",
        "Error: Brain Not Found",
        "It's over 9000!",
        "The cake is a lie",
        "Calculating... Not really.",
        "404: Answer not found",
        "Why are you asking me?",
        "Don't do math, kids."
    ];
    const randomStupidAnswer = stupidAnswers[Math.floor(Math.random() * stupidAnswers.length)];
    const result = Math.random() > 0.5 ? randomNumber : randomStupidAnswer;

    isMatrixActive = true;
    matrixOverlay.classList.add('active');

    calculator.style.opacity = '0';
    calculator.style.visibility = 'hidden';

    resultMessage.style.opacity = '0';
    resultMessage.style.visibility = 'hidden';

    setTimeout(() => {
        resultMessage.style.opacity = '1';
        resultMessage.style.visibility = 'visible';
    }, 500);

    animateMatrix();

    const computingText = document.querySelector('.computing-text');
    const progressBar = document.querySelector('.progress-fill');

    computingText.style.opacity = '1';
    progressBar.style.width = '0%';
    resultFound.style.opacity = '0';
    finalResult.style.opacity = '0';

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
            computingText.style.opacity = '0';

            setTimeout(() => {
                resultFound.textContent = "ANSWER'S READY";
                resultFound.classList.add('show');

                finalResult.textContent = `STUPID ANSWER: ${result}`;
                finalResult.classList.add('show');

                displayValue = result.toString();
                isResultDisplayed = true;

                setTimeout(() => {
                    resetMatrixEffect();
                }, 3000);
            }, 500);
        }
    }, 100);
}

function resetMatrixEffect() {
    isMatrixActive = false;
    matrixOverlay.classList.remove('active');
    calculator.classList.remove('shake-effect');
    calculator.style.opacity = '1';
    calculator.style.visibility = 'visible';
    updateDisplay();
    cancelAnimationFrame(animationFrameId);
}

// Matrix Effect Code
function setupMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    ctx.font = "15px Arial";
    columns = Math.floor(matrixCanvas.width / 15);
    drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    ctx.fillStyle = "#00ff41";

    for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(text, i * 15, drops[i] * 15);

        if (drops[i] * 15 > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

let animationFrameId;

function animateMatrix() {
    drawMatrix();
    animationFrameId = requestAnimationFrame(animateMatrix);
}

// Initialize when page loads
window.onload = function() {
    init();
};

// Console Easter eggs
console.log(`
    ██████╗ ██╗██╗  ██╗███████╗██╗      ██████╗ ███████╗
    ██╔══██╗██║╚██╗██╔╝██╔════╝██║     ██╔═══██╗██╔════╝
    ██████╔╝██║ ╚███╔╝ █████╗  ██║     ██║   ██║███████╗
    ██╔═══╝ ██║ ╚██╔╝  ██╔══╝  ██║     ██║   ██║╚════██║
    ██║     ██║  ██║   ███████╗███████╗╚██████╔╝███████║
    ╚═╝     ╚═╝  ╚═╝   ╚══════╝╚══════╝ ╚═════╝ ╚══════╝
    
    PIXELOS v2.4.1 - DUMBASS CALCULATOR
    -----------------------------------
    You think you're smart, huh?
    Well, so do I.
`);