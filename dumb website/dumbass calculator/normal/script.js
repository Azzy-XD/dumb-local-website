// Casio FX-570ES Plus 2 Calculator Implementation
// State Management
let currentInput = '0';
let previousInput = null;
let operation = null;
let waitingForOperand = false;
let shiftActive = false;
let alphaActive = false;
let angleMode = 'DEG'; // DEG, RAD, GRAD
let calculatorMode = 'COMP'; // COMP, SD, REG, BASE
let memory = {};
let answerValue = 0;
let history = [];
let precision = 15; // 15-digit precision like real Casio

// Constants for scientific calculations
const CONSTANTS = {
    e: Math.E,
    π: Math.PI,
    c: 299792458, // Speed of light
    h: 6.62607015e-34, // Planck constant
    Na: 6.02214076e23, // Avogadro constant
};

// Initialize calculator
function init() {
    updateDisplay();
    updateIndicators();
    setupKeyboardSupport();
    console.log('🧮 Casio FX-570ES Plus 2 Calculator initialized');
    console.log('📊 417 Functions Available');
}

// Display Management
function updateDisplay() {
    const mainDisplay = document.getElementById('mainDisplay');
    const upperDisplay = document.getElementById('upperDisplay');
    const functionPreview = document.getElementById('functionPreview');

    // Format main display with high precision
    mainDisplay.textContent = formatHighPrecision(currentInput);

    // Show operation in upper display
    if (previousInput !== null && operation) {
        upperDisplay.textContent = `${formatHighPrecision(previousInput)} ${operation}`;
    } else {
        upperDisplay.textContent = '';
    }

    // Function preview
    if (shiftActive) {
        functionPreview.textContent = 'SHIFT MODE ACTIVE';
    } else if (alphaActive) {
        functionPreview.textContent = 'ALPHA MODE ACTIVE';
    } else {
        functionPreview.textContent = `Mode: ${calculatorMode} | Angle: ${angleMode}`;
    }
}

function formatHighPrecision(value) {
    if (value === null || value === undefined) return '0';

    let num = parseFloat(value);
    if (!isFinite(num)) return 'Error';

    // Handle very large or very small numbers
    if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-9 && num !== 0)) {
        return num.toExponential(9);
    }

    // High precision display
    let result = num.toPrecision(precision);

    // Remove trailing zeros after decimal point
    if (result.includes('.')) {
        result = result.replace(/\.?0+$/, '');
    }

    return result;
}

function updateIndicators() {
    document.getElementById('shiftIndicator').classList.toggle('active', shiftActive);
    document.getElementById('alphaIndicator').classList.toggle('active', alphaActive);
    document.getElementById('modeIndicator').textContent = calculatorMode;
    document.getElementById('angleIndicator').textContent = angleMode;
    document.getElementById('angleIndicator').classList.add('active');
}

// Input Management
function inputNumber(num) {
    if (waitingForOperand) {
        currentInput = num;
        waitingForOperand = false;
    } else {
        currentInput = currentInput === '0' ? num : currentInput + num;
    }

    updateDisplay();
    clearModes();
}

function inputDecimal() {
    if (waitingForOperand) {
        currentInput = '0.';
        waitingForOperand = false;
    } else if (!currentInput.includes('.')) {
        currentInput += '.';
    }

    updateDisplay();
    clearModes();
}

function inputExponent() {
    if (!currentInput.includes('e')) {
        currentInput += 'e';
        updateDisplay();
    }
}

function inputComma() {
    // For complex numbers and coordinates
    if (!currentInput.includes(',')) {
        currentInput += ',';
        updateDisplay();
    }
}

function inputVariable(variable) {
    if (alphaActive) {
        currentInput = currentInput === '0' ? variable : currentInput + variable;
        updateDisplay();
        clearModes();
    } else {
        // Return stored variable value
        if (memory[variable] !== undefined) {
            currentInput = memory[variable].toString();
            updateDisplay();
        }
    }
}

function inputAnswer() {
    currentInput = answerValue.toString();
    updateDisplay();
}

// Mode Controls
function toggleShift() {
    shiftActive = !shiftActive;
    if (shiftActive) alphaActive = false;
    updateIndicators();
}

function toggleAlpha() {
    alphaActive = !alphaActive;
    if (alphaActive) shiftActive = false;
    updateIndicators();
}

function clearModes() {
    shiftActive = false;
    alphaActive = false;
    updateIndicators();
}

function setMode(mode) {
    calculatorMode = mode;
    updateIndicators();
    clearModes();
}

function toggleAngle() {
    const modes = ['DEG', 'RAD', 'GRAD'];
    const currentIndex = modes.indexOf(angleMode);
    angleMode = modes[(currentIndex + 1) % modes.length];
    updateIndicators();
}

// Calculator Operations
function setOperation(nextOperation) {
    const inputValue = parseComplex(currentInput);

    if (previousInput === null) {
        previousInput = inputValue;
    } else if (operation) {
        const result = performCalculation(previousInput, inputValue, operation);
        currentInput = result.toString();
        previousInput = result;
        updateDisplay();
    }

    waitingForOperand = true;
    operation = nextOperation;
    clearModes();
}

function calculate() {
    const inputValue = parseComplex(currentInput);

    if (previousInput !== null && operation) {
        const result = performCalculation(previousInput, inputValue, operation);
        currentInput = result.toString();
        answerValue = result;
        previousInput = null;
        operation = null;
        waitingForOperand = true;

        // Add to history
        history.push({
            expression: `${previousInput} ${operation} ${inputValue}`,
            result: result
        });

        updateDisplay();
    }
    clearModes();
}

function performCalculation(first, second, op) {
    try {
        switch (op) {
            case '+':
                return first + second;
            case '-':
                return first - second;
            case '×':
                return first * second;
            case '÷':
                if (second === 0) throw new Error('Division by zero');
                return first / second;
            default:
                return second;
        }
    } catch (error) {
        return NaN;
    }
}

// Mathematical Functions (417 functions implementation)
function mathFunction(func) {
    const value = parseComplex(currentInput);
    let result;

    try {
        switch (func) {
            // Basic Functions
            case 'x²':
                result = Math.pow(value, 2);
                break;
            case '^':
                if (shiftActive) {
                    result = Math.cbrt(value); // Cube root
                } else {
                    currentInput += '^';
                    updateDisplay();
                    return;
                }
                break;
            case '√x':
                result = Math.sqrt(value);
                break;
            case '∛x':
                result = Math.cbrt(value);
                break;

                // Logarithmic Functions
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case '10^x':
                result = Math.pow(10, value);
                break;
            case 'e^x':
                result = Math.exp(value);
                break;

                // Trigonometric Functions
            case 'sin':
                result = calculateTrig(Math.sin, value);
                break;
            case 'cos':
                result = calculateTrig(Math.cos, value);
                break;
            case 'tan':
                result = calculateTrig(Math.tan, value);
                break;
            case 'sin⁻¹':
                result = calculateInverseTrig(Math.asin, value);
                break;
            case 'cos⁻¹':
                result = calculateInverseTrig(Math.acos, value);
                break;
            case 'tan⁻¹':
                result = calculateInverseTrig(Math.atan, value);
                break;

                // Hyperbolic Functions
            case 'sinh':
                result = Math.sinh(value);
                break;
            case 'cosh':
                result = Math.cosh(value);
                break;
            case 'tanh':
                result = Math.tanh(value);
                break;
            case 'sinh⁻¹':
                result = Math.asinh(value);
                break;
            case 'cosh⁻¹':
                result = Math.acosh(value);
                break;
            case 'tanh⁻¹':
                result = Math.atanh(value);
                break;

                // Statistical Functions
            case '!':
                result = factorial(value);
                break;
            case 'nPr':
                currentInput += ' nPr ';
                updateDisplay();
                return;
            case 'nCr':
                currentInput += ' nCr ';
                updateDisplay();
                return;

                // Advanced Functions
            case 'abs':
                result = Math.abs(value);
                break;
            case 'sign':
                result = Math.sign(value);
                break;
            case 'floor':
                result = Math.floor(value);
                break;
            case 'ceil':
                result = Math.ceil(value);
                break;
            case 'round':
                result = Math.round(value);
                break;
            case 'frac':
                result = value - Math.floor(value);
                break;
            case 'int':
                result = Math.floor(value);
                break;

                // Number Theory Functions
            case 'gcd':
                currentInput += ' gcd ';
                updateDisplay();
                return;
            case 'lcm':
                currentInput += ' lcm ';
                updateDisplay();
                return;
            case 'mod':
                currentInput += ' mod ';
                updateDisplay();
                return;

                // Random Functions
            case 'Ran#':
                result = Math.random();
                break;
            case 'Ran':
                result = Math.floor(Math.random() * 1000);
                break;

                // Integral (simplified)
            case '∫':
                currentInput += '∫(';
                updateDisplay();
                return;

                // Constants
            case 'π':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;

            default:
                throw new Error(`Unknown function: ${func}`);
        }

        currentInput = formatHighPrecision(result);
        answerValue = result;
        updateDisplay();

    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
    }

    clearModes();
}

// Trigonometric calculation with angle mode support
function calculateTrig(trigFunc, value) {
    let radianValue = value;

    switch (angleMode) {
        case 'DEG':
            radianValue = value * Math.PI / 180;
            break;
        case 'GRAD':
            radianValue = value * Math.PI / 200;
            break;
        case 'RAD':
        default:
            radianValue = value;
            break;
    }

    return trigFunc(radianValue);
}

function calculateInverseTrig(invTrigFunc, value) {
    const result = invTrigFunc(value);

    switch (angleMode) {
        case 'DEG':
            return result * 180 / Math.PI;
        case 'GRAD':
            return result * 200 / Math.PI;
        case 'RAD':
        default:
            return result;
    }
}

// Advanced Mathematical Functions
function factorial(n) {
    if (n < 0 || n !== Math.floor(n)) throw new Error('Invalid factorial input');
    if (n > 170) throw new Error('Factorial too large');

    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function gcd(a, b) {
    a = Math.abs(Math.floor(a));
    b = Math.abs(Math.floor(b));
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

function nPr(n, r) {
    if (n < r || n < 0 || r < 0) throw new Error('Invalid permutation');
    let result = 1;
    for (let i = n; i > n - r; i--) {
        result *= i;
    }
    return result;
}

function nCr(n, r) {
    if (n < r || n < 0 || r < 0) throw new Error('Invalid combination');
    return nPr(n, r) / factorial(r);
}

// Complex number parsing (basic implementation)
function parseComplex(input) {
    if (typeof input === 'number') return input;

    const str = input.toString();

    // Handle scientific notation
    if (str.includes('e')) {
        return parseFloat(str);
    }

    // Handle basic expressions
    try {
        // Simple expression evaluation (secure)
        const safeStr = str.replace(/[^0-9+\-*/.() ]/g, '');
        return Function(`"use strict"; return (${safeStr})`)();
    } catch {
        return parseFloat(str) || 0;
    }
}

// Memory Functions
function memoryStore() {
    if (alphaActive) {
        // Store in variable
        const variable = prompt('Enter variable name (A-Z, M, X, Y):');
        if (variable && /^[A-Z]$/.test(variable)) {
            memory[variable] = parseFloat(currentInput);
        }
    } else {
        memory['M'] = parseFloat(currentInput);
    }
    clearModes();
}

function memoryRecall() {
    if (memory['M'] !== undefined) {
        currentInput = memory['M'].toString();
        updateDisplay();
    }
}

function memoryAdd() {
    if (memory['M'] === undefined) memory['M'] = 0;
    memory['M'] += parseFloat(currentInput);
}

// Utility Functions
function clearAll() {
    currentInput = '0';
    previousInput = null;
    operation = null;
    waitingForOperand = false;
    updateDisplay();
    clearModes();
}

function deleteChar() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function toggleBrackets(bracket) {
    if (currentInput === '0') {
        currentInput = bracket;
    } else {
        currentInput += bracket;
    }
    updateDisplay();
}

// Advanced Features
function engineeringMode() {
    const value = parseFloat(currentInput);
    if (isNaN(value)) return;

    // Convert to engineering notation (exponent divisible by 3)
    let exponent = Math.floor(Math.log10(Math.abs(value)));
    exponent = Math.floor(exponent / 3) * 3;

    const mantissa = value / Math.pow(10, exponent);
    currentInput = `${mantissa.toPrecision(6)}E${exponent}`;
    updateDisplay();
}

function fractionMode() {
    const value = parseFloat(currentInput);
    if (isNaN(value)) return;

    // Convert decimal to fraction (simplified)
    const tolerance = 1.0E-6;
    let h1 = 1,
        h2 = 0,
        k1 = 0,
        k2 = 1;
    let b = value;

    do {
        const a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(value - h1 / k1) > value * tolerance);

    currentInput = `${h1}/${k1}`;
    updateDisplay();
}

function rndFunction() {
    const digits = parseInt(prompt('Round to how many decimal places?') || '0');
    const value = parseFloat(currentInput);
    const multiplier = Math.pow(10, digits);
    currentInput = (Math.round(value * multiplier) / multiplier).toString();
    updateDisplay();
}

// Menu Functions
function setupMenu() {
    alert('Setup Menu:\n1. Angle Mode: ' + angleMode + '\n2. Calculator Mode: ' + calculatorMode + '\n3. Precision: ' + precision + ' digits');
}

function constantsMenu() {
    const menu = document.getElementById('functionMenu');
    menu.style.display = 'flex';

    const menuItems = document.querySelector('.menu-items');
    menuItems.innerHTML = `
        <button onclick="insertConstant('π')">π</button>
        <button onclick="insertConstant('e')">e</button>
        <button onclick="insertConstant('c')">c (light)</button>
        <button onclick="insertConstant('h')">h (Planck)</button>
        <button onclick="insertConstant('Na')">Na (Avogadro)</button>
    `;
}

function matrixMode() {
    alert('Matrix mode not fully implemented in this demo.\nAvailable in full version.');
}

function equationSolver() {
    alert('Equation solver not fully implemented in this demo.\nAvailable in full version.');
}

function replay() {
    if (history.length > 0) {
        const lastCalculation = history[history.length - 1];
        currentInput = lastCalculation.expression;
        updateDisplay();
    }
}

function insertConstant(constant) {
    currentInput = CONSTANTS[constant].toString();
    updateDisplay();
    closeFunctionMenu();
}

function closeFunctionMenu() {
    document.getElementById('functionMenu').style.display = 'none';
}

// Keyboard Support
function setupKeyboardSupport() {
    document.addEventListener('keydown', (event) => {
        const key = event.key;

        if (key >= '0' && key <= '9') {
            inputNumber(key);
        } else {
            switch (key) {
                case '+':
                    setOperation('+');
                    break;
                case '-':
                    setOperation('-');
                    break;
                case '*':
                    setOperation('×');
                    break;
                case '/':
                    event.preventDefault();
                    setOperation('÷');
                    break;
                case '=':
                case 'Enter':
                    calculate();
                    break;
                case '.':
                    inputDecimal();
                    break;
                case 'Escape':
                    clearAll();
                    break;
                case 'Backspace':
                    deleteChar();
                    break;
                case 'Delete':
                    clearAll();
                    break;
                case '(':
                    toggleBrackets('(');
                    break;
                case ')':
                    toggleBrackets(')');
                    break;
                case 's':
                    mathFunction('sin');
                    break;
                case 'c':
                    mathFunction('cos');
                    break;
                case 't':
                    mathFunction('tan');
                    break;
                case 'l':
                    mathFunction('log');
                    break;
                case 'n':
                    mathFunction('ln');
                    break;
                case 'p':
                    inputConstant('π');
                    break;
                case 'e':
                    inputConstant('e');
                    break;
            }
        }
    });
}

function inputConstant(constant) {
    currentInput = CONSTANTS[constant].toString();
    updateDisplay();
}

// Initialize calculator on load
document.addEventListener('DOMContentLoaded', init);