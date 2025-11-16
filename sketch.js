// p5.js sketch for Pendulum PLL Simulation
// Main animation and visualization logic

// Global variables
let pll;
let pendulum;
let simulationPaused = false;

// Pendulum parameters
let pendulumParams = {
    frequency: 1.0,      // Hz (oscillations per second)
    amplitude: 45,       // degrees
    qFactor: 1000,       // Quality factor (1e2 to 1e7)
    length: 150,         // visual length in pixels
};

// PLL parameters
let pllParams = {
    loopGain: 1.0,
    vcoInitialFreq: 0.8
};

// Canvas dimensions
const canvasWidth = 800;
const canvasHeight = 500;

// Pendulum physics state
let pendulumAngle = 0;
let pendulumVelocity = 0;
let pendulumTime = 0;

// Signal history for FFT
let signalHistory = [];
const maxSignalHistory = 512; // Power of 2 for FFT

// p5.js setup function
function setup() {
    // Create canvas and attach to container
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('p5-canvas');
    
    // Initialize PLL
    pll = new PLL(pllParams.vcoInitialFreq, pllParams.loopGain);
    
    // Initialize pendulum
    resetPendulum();
    
    // Set initial angle
    pendulumAngle = radians(pendulumParams.amplitude);
}

// p5.js draw function - called every frame
function draw() {
    background(240, 245, 250);
    
    if (!simulationPaused) {
        // Update physics
        updatePendulum();
        
        // Update PLL with current pendulum phase
        const pendulumPhase = normalizeAngle(pendulumAngle + PI);
        pll.update(pendulumPhase);
        
        // Update UI status
        updateLockStatus(pll.isLocked);
    }
    
    // Draw everything
    drawGrid();
    drawPendulum();
    drawPLLReference();
    drawInfo();
}

// Update pendulum physics using equation of motion
function updatePendulum() {
    const dt = 0.016; // ~60 fps
    
    // Angular frequency (omega = 2 * pi * f)
    const omega0 = 2 * Math.PI * pendulumParams.frequency;
    
    // Calculate damping from Q factor
    // Q = omega0 / (2 * zeta * omega0) = 1 / (2 * zeta)
    // Therefore: zeta = 1 / (2 * Q)
    const zeta = 1.0 / (2.0 * pendulumParams.qFactor);
    const dampingCoeff = 2 * zeta * omega0;
    
    // Damped harmonic oscillator equation
    // d²θ/dt² = -ω₀² * sin(θ) - 2ζω₀ * dθ/dt
    const angleInRadians = pendulumAngle;
    
    // For better accuracy with high Q, use proper pendulum equation
    const acceleration = -omega0 * omega0 * sin(angleInRadians) - 
                        dampingCoeff * pendulumVelocity;
    
    // Update velocity and position (Euler integration)
    pendulumVelocity += acceleration * dt;
    pendulumAngle += pendulumVelocity * dt;
    
    // Store signal for FFT (record angular position)
    signalHistory.push(pendulumAngle);
    if (signalHistory.length > maxSignalHistory) {
        signalHistory.shift();
    }
    
    // Update time
    pendulumTime += dt;
}

// Draw the pendulum
function drawPendulum() {
    push();
    
    // Move origin to center top
    translate(width / 2, 100);
    
    // Draw mounting point
    fill(60);
    noStroke();
    circle(0, 0, 15);
    
    // Calculate bob position
    const bobX = pendulumParams.length * sin(pendulumAngle);
    const bobY = pendulumParams.length * cos(pendulumAngle);
    
    // Draw rod
    stroke(60);
    strokeWeight(3);
    line(0, 0, bobX, bobY);
    
    // Draw bob
    fill(52, 152, 219);
    noStroke();
    circle(bobX, bobY, 30);
    
    // Draw motion trail (subtle arc)
    noFill();
    stroke(52, 152, 219, 100);
    strokeWeight(1);
    const arcStart = -radians(pendulumParams.amplitude);
    const arcEnd = radians(pendulumParams.amplitude);
    arc(0, 0, pendulumParams.length * 2, pendulumParams.length * 2, 
        arcStart, arcEnd);
    
    pop();
}

// Draw PLL reference oscillator (visualization)
function drawPLLReference() {
    push();
    
    // Move origin to center top
    translate(width / 2, 100);
    
    // Get VCO phase from PLL
    const vcoOutput = pll.getVCOOutput();
    const vcoAngle = vcoOutput.phase - PI; // Convert to pendulum coordinate system
    
    // Calculate reference position
    const refX = pendulumParams.length * sin(vcoAngle);
    const refY = pendulumParams.length * cos(vcoAngle);
    
    // Draw reference bob (semi-transparent)
    fill(231, 76, 60, 150);
    noStroke();
    circle(refX, refY, 25);
    
    // Draw reference rod (dashed)
    stroke(231, 76, 60, 150);
    strokeWeight(2);
    drawDashedLine(0, 0, refX, refY);
    
    pop();
}

// Draw background grid and axes
function drawGrid() {
    push();
    stroke(200);
    strokeWeight(1);
    
    // Vertical center line
    line(width / 2, 0, width / 2, height);
    
    // Horizontal reference line
    line(0, 100, width, 100);
    
    pop();
}

// Draw information overlay
function drawInfo() {
    push();
    
    // Info box background
    fill(255, 255, 255, 230);
    noStroke();
    rect(10, 10, 250, 120, 5);
    
    // Text styling
    fill(44, 62, 80);
    textAlign(LEFT, TOP);
    textSize(13);
    
    // Display information
    const vcoOutput = pll.getVCOOutput();
    text(`Pendulum Freq: ${pendulumParams.frequency.toFixed(3)} Hz`, 20, 20);
    text(`VCO Freq: ${vcoOutput.frequency.toFixed(3)} Hz`, 20, 40);
    text(`Phase Error: ${(pll.phaseError * 180 / PI).toFixed(2)}°`, 20, 60);
    text(`Lock Status: ${pll.isLocked ? 'LOCKED' : 'ACQUIRING'}`, 20, 80);
    text(`Q Factor: ${pendulumParams.qFactor.toExponential(1)}`, 20, 100);
    
    // Lock quality indicator
    const lockStatus = pll.getLockStatus();
    const lockQuality = lockStatus.lockQuality;
    
    fill(200);
    rect(20, 115, 210, 15, 3);
    
    if (pll.isLocked) {
        fill(46, 204, 113);
    } else {
        fill(231, 76, 60);
    }
    rect(20, 115, 210 * lockQuality, 15, 3);
    
    pop();
    
    // Draw legend
    drawLegend();
}

// Draw legend for colors
function drawLegend() {
    push();
    
    const legendX = width - 200;
    const legendY = 10;
    
    // Background
    fill(255, 255, 255, 230);
    noStroke();
    rect(legendX, legendY, 190, 85, 5);
    
    // Title
    fill(44, 62, 80);
    textAlign(LEFT, TOP);
    textSize(13);
    textStyle(BOLD);
    text('Legend', legendX + 10, legendY + 10);
    
    // Pendulum
    textStyle(NORMAL);
    fill(52, 152, 219);
    circle(legendX + 20, legendY + 40, 15);
    fill(44, 62, 80);
    text('Physical Pendulum', legendX + 35, legendY + 33);
    
    // PLL Reference
    fill(231, 76, 60);
    circle(legendX + 20, legendY + 65, 15);
    fill(44, 62, 80);
    text('PLL Reference (VCO)', legendX + 35, legendY + 58);
    
    pop();
}

// Helper function to draw dashed line
function drawDashedLine(x1, y1, x2, y2, dashLength = 5) {
    const distance = dist(x1, y1, x2, y2);
    const dashes = distance / dashLength;
    const xStep = (x2 - x1) / dashes;
    const yStep = (y2 - y1) / dashes;
    
    for (let i = 0; i < dashes; i += 2) {
        const startX = x1 + xStep * i;
        const startY = y1 + yStep * i;
        const endX = x1 + xStep * (i + 1);
        const endY = y1 + yStep * (i + 1);
        line(startX, startY, endX, endY);
    }
}

// Normalize angle to [0, 2*PI]
function normalizeAngle(angle) {
    while (angle < 0) angle += 2 * PI;
    while (angle >= 2 * PI) angle -= 2 * PI;
    return angle;
}

// Reset pendulum to initial conditions
function resetPendulum() {
    pendulumAngle = radians(pendulumParams.amplitude);
    pendulumVelocity = 0;
    pendulumTime = 0;
}

// Reset entire simulation
function resetSimulation() {
    resetPendulum();
    pll.reset(pllParams.vcoInitialFreq);
    
    // Clear graphs
    if (typeof clearGraphs === 'function') {
        clearGraphs();
    }
}

// Toggle pause state
function togglePause() {
    simulationPaused = !simulationPaused;
    if (typeof updatePauseButton === 'function') {
        updatePauseButton();
    }
}

// Update parameters from UI
function updatePendulumFrequency(freq) {
    pendulumParams.frequency = freq;
}

function updatePendulumAmplitude(amp) {
    pendulumParams.amplitude = amp;
}

function updateQFactor(q) {
    pendulumParams.qFactor = q;
}

function updatePLLGain(gain) {
    pllParams.loopGain = gain;
    if (pll) {
        pll.setLoopGain(gain);
    }
}

function updateVCOFrequency(freq) {
    pllParams.vcoInitialFreq = freq;
    if (pll) {
        pll.setVCOFrequency(freq);
    }
}

// Get PLL data for graphing
function getPLLData() {
    if (!pll) return { phaseError: [], frequency: [], signal: [] };
    return {
        phaseError: pll.phaseErrorHistory,
        frequency: pll.freqHistory,
        signal: signalHistory
    };
}

// Make simulationPaused accessible globally for i18n
window.simulationPaused = simulationPaused;

