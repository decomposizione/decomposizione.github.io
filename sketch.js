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
    lengthCm: 150,       // physical length in cm
    mass: 1.0,           // mass in kg
    energyImpulse: 10e-9,  // energy impulse in Joules when passing zero (default: 10 nJ)
    lunarFreq: 22.344e-6 // Lunar/tidal modulation frequency (Hz)
};

// Track zero crossings for energy impulse
let lastAngleSign = 0;

// PLL parameters
let pllParams = {
    loopGain: 1.0,
    vcoInitialFreq: 0.8
};

// Canvas dimensions
const canvasWidth = 800;
const canvasHeight = 500;

// Simulation time scaling for visualization
const simulationTimeScale = 1000; // Speed up tidal effects

// Pendulum physics state
let pendulumAngle = 0;
let pendulumVelocity = 0;
let pendulumTime = 0;

// Signal history for FFT
let signalHistory = [];
const maxSignalHistory = 512; // Power of 2 for high-freq FFT

// Long-term signal history for tidal frequency analysis
let tidalSignalHistory = [];
const maxTidalHistory = 1024; // Buffer size: 1024 samples
let tidalSampleCounter = 0;
const tidalSampleRate = 10; // Sample every N frames for tidal analysis
const tidalUpdateInterval = 64; // Update spectrum every 64 samples for FFT

// p5.js setup function
function setup() {
    // Create canvas and attach to container
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('p5-canvas');
    
    // Initialize PLL
    pll = new PLL(pllParams.vcoInitialFreq, pllParams.loopGain);
    
    // Initialize pendulum
    resetPendulum();
    
    // Initial angle is set in resetPendulum() to 0.01 degrees
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
    drawInfo();
}

// Update pendulum physics using equation of motion
function updatePendulum() {
    const dt = 0.016; // ~60 fps
    
    // Calculate natural frequency from physical length
    // For small angles: T = 2π√(L/g), so ω = √(g/L)
    const g = 9.81; // m/s²
    const lengthM = pendulumParams.lengthCm / 100; // convert cm to m
    const omega0_natural = Math.sqrt(g / lengthM); // rad/s
    
    // Use user-set frequency or natural frequency (whichever is more appropriate)
    // For now, use user frequency but adjust for length effects
    let omega0 = 2 * Math.PI * pendulumParams.frequency;
    
    // Add tidal modulation to simulate real oceanographic conditions
    // User-controllable lunar frequency (200 µHz to 0.1 Hz)
    const tidalM2_freq = pendulumParams.lunarFreq; // User-controlled M2 frequency
    const tidalS2_freq = 23.148e-6 * simulationTimeScale; // S2 (relative to M2)
    const tidalK1_freq = 11.607e-6 * simulationTimeScale; // K1
    
    // Modulate the natural frequency with tidal components
    // This simulates how tidal forces would affect the pendulum
    const tidalModulation = 
        0.02 * Math.sin(2 * Math.PI * tidalM2_freq * pendulumTime) +
        0.015 * Math.sin(2 * Math.PI * tidalS2_freq * pendulumTime) +
        0.01 * Math.sin(2 * Math.PI * tidalK1_freq * pendulumTime);
    
    omega0 = omega0 * (1 + tidalModulation);
    
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
    
    // Check for zero crossing and apply energy impulse
    const currentAngleSign = Math.sign(pendulumAngle);
    if (lastAngleSign !== 0 && currentAngleSign !== 0 && lastAngleSign !== currentAngleSign) {
        // Zero crossing detected! Apply energy impulse
        if (pendulumParams.energyImpulse > 0) {
            // Convert energy to velocity change
            // E = 0.5 * m * v², so Δv = √(2E/m)
            // For angular motion: E = 0.5 * I * ω², where I = m * L²
            const momentOfInertia = pendulumParams.mass * lengthM * lengthM;
            const currentKineticEnergy = 0.5 * momentOfInertia * pendulumVelocity * pendulumVelocity;
            const newKineticEnergy = currentKineticEnergy + pendulumParams.energyImpulse;
            
            // Calculate new velocity (preserve direction)
            const velocityMagnitude = Math.sqrt(2 * newKineticEnergy / momentOfInertia);
            pendulumVelocity = Math.sign(pendulumVelocity) * velocityMagnitude;
        }
    }
    lastAngleSign = currentAngleSign;
    
    pendulumAngle += pendulumVelocity * dt;
    
    // Store signal for high-frequency FFT (record angular position)
    signalHistory.push(pendulumAngle);
    if (signalHistory.length > maxSignalHistory) {
        signalHistory.shift();
    }
    
    // Store signal for tidal-frequency FFT (decimated for long-term analysis)
    tidalSampleCounter++;
    if (tidalSampleCounter >= tidalSampleRate) {
        tidalSampleCounter = 0;
        // Store instantaneous frequency deviation (proxy for tidal modulation)
        const instantFreq = pendulumVelocity / (2 * Math.PI);
        tidalSignalHistory.push(instantFreq);
        // Maintain buffer at exactly 1024 samples (circular buffer)
        if (tidalSignalHistory.length > maxTidalHistory) {
            tidalSignalHistory.shift();
        }
    }
    
    // Update time
    pendulumTime += dt;
}

// Draw the pendulum
function drawPendulum() {
    push();
    
    // Move origin to center top
    translate(width / 2, 100);
    
    // Scale visual length based on physical length (50-200cm maps to reasonable visual range)
    const minLength = 50;
    const maxLength = 200;
    const visualLength = map(pendulumParams.lengthCm, minLength, maxLength, 100, 200);
    
    // Draw mounting point
    fill(60);
    noStroke();
    circle(0, 0, 15);
    
    // Calculate bob position using visual length
    const bobX = visualLength * sin(pendulumAngle);
    const bobY = visualLength * cos(pendulumAngle);
    
    // Draw rod
    stroke(60);
    strokeWeight(3);
    line(0, 0, bobX, bobY);
    
    
    // Draw motion trail (subtle arc)
    noFill();
    stroke(52, 152, 219, 100);
    strokeWeight(1);
    const arcStart = -radians(pendulumParams.amplitude);
    const arcEnd = radians(pendulumParams.amplitude);
    arc(0, 0, visualLength * 2, visualLength * 2, 
        arcStart, arcEnd);
    
    // Draw bob size proportional to mass
    const bobSize = map(pendulumParams.mass, 1, 10, 25, 40);
    fill(52, 152, 219);
    noStroke();
    circle(bobX, bobY, bobSize);
    
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
    text(`Length: ${pendulumParams.lengthCm} cm | Mass: ${pendulumParams.mass.toFixed(1)} kg`, 20, 120);
    if (pendulumParams.energyImpulse > 0) {
        // Format energy display with appropriate units
        let energyText;
        if (pendulumParams.energyImpulse < 1e-6) {
            energyText = `${(pendulumParams.energyImpulse * 1e9).toFixed(1)} nJ`;
        } else if (pendulumParams.energyImpulse < 1e-3) {
            energyText = `${(pendulumParams.energyImpulse * 1e6).toFixed(1)} µJ`;
        } else if (pendulumParams.energyImpulse < 1) {
            energyText = `${(pendulumParams.energyImpulse * 1e3).toFixed(1)} mJ`;
        } else {
            energyText = `${pendulumParams.energyImpulse.toFixed(2)} J`;
        }
        text(`Energy Impulse: ${energyText}`, 20, 140);
    }
    
    // Lock quality indicator
    const lockStatus = pll.getLockStatus();
    const lockQuality = lockStatus.lockQuality;
    
    const lockBarY = pendulumParams.energyImpulse > 0 ? 155 : 135;
    fill(200);
    rect(20, lockBarY, 210, 15, 3);
    
    if (pll.isLocked) {
        fill(46, 204, 113);
    } else {
        fill(231, 76, 60);
    }
    rect(20, lockBarY, 210 * lockQuality, 15, 3);
    
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
    rect(legendX, legendY, 190, 60, 5);
    
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
    
    pop();
}


// Normalize angle to [0, 2*PI]
function normalizeAngle(angle) {
    while (angle < 0) angle += 2 * PI;
    while (angle >= 2 * PI) angle -= 2 * PI;
    return angle;
}

// Reset pendulum to initial conditions
function resetPendulum() {
    // Start from 0.01 degrees (1 centesimo di grado)
    pendulumAngle = radians(0.01);
    pendulumVelocity = 0;
    pendulumTime = 0;
    lastAngleSign = 0; // Reset zero crossing tracker
    
    // Apply initial energy impulse if enabled
    if (pendulumParams.energyImpulse > 0) {
        const g = 9.81;
        const lengthM = pendulumParams.lengthCm / 100;
        const momentOfInertia = pendulumParams.mass * lengthM * lengthM;
        
        // Calculate initial velocity from energy impulse
        // E = 0.5 * I * ω², so ω = √(2E/I)
        const initialAngularVelocity = Math.sqrt(2 * pendulumParams.energyImpulse / momentOfInertia);
        pendulumVelocity = initialAngularVelocity;
    }
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

function updatePendulumLength(lengthCm) {
    pendulumParams.lengthCm = lengthCm;
    // Update frequency based on new length (T = 2π√(L/g))
    const g = 9.81;
    const lengthM = lengthCm / 100;
    const naturalPeriod = 2 * Math.PI * Math.sqrt(lengthM / g);
    const naturalFreq = 1 / naturalPeriod;
    // Optionally update frequency to match natural frequency
    // pendulumParams.frequency = naturalFreq;
}

function updatePendulumMass(mass) {
    pendulumParams.mass = mass;
}

function updateEnergyImpulse(energy) {
    pendulumParams.energyImpulse = energy;
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

function updateLunarFrequency(freq) {
    pendulumParams.lunarFreq = freq;
}

// Get PLL data for graphing
function getPLLData() {
    if (!pll) return { phaseError: [], frequency: [], signal: [], tidalSignal: [] };
    return {
        phaseError: pll.phaseErrorHistory,
        frequency: pll.freqHistory,
        signal: signalHistory,
        tidalSignal: tidalSignalHistory
    };
}

// Make simulationPaused and pendulumParams accessible globally for UI
window.simulationPaused = simulationPaused;
window.pendulumParams = pendulumParams;

