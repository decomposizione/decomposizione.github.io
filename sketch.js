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
    energyImpulse: 0.001,  // energy impulse in Joules when passing zero (default: 1 mJ)
    lunarFreq: 22.344e-6 // Lunar/tidal modulation frequency (Hz)
};

// Track zero crossings for energy impulse
let lastZeroCrossingTime = 0; // Track time of last zero crossing for period measurement

// PLL parameters
let pllParams = {
    loopGain: 1.0
    // VCO initial frequency is set from natural pendulum frequency
};

// Canvas dimensions
const canvasWidth = 800;
const canvasHeight = 500;

// Simulation time scaling for visualization
const simulationTimeScale = 1000; // Speed up tidal effects

// Simulation speed multiplier (1x = real-time, 1000x = 1000x faster)
let simulationSpeed = 1.0; // Default: real-time

// Pendulum physics state
let pendulumAngle = 0;
let pendulumVelocity = 0;
let pendulumTime = 0;

// Sampling for FFT - based on simulated time, not real frames
let lastSampleTime = 0;
const sampleInterval = 0.016; // Sample every 0.016s of simulated time (~60 Hz in simulated time)

// Signal history for FFT
let signalHistory = [];
const maxSignalHistory = 512; // Power of 2 for high-freq FFT

// Long-term signal history for tidal frequency analysis
let tidalSignalHistory = [];
let tidalPeriodHistory = []; // Track actual periods between zero crossings
const maxTidalHistory = 65536; // Buffer size: 65536 samples
// Sampling happens at zero crossings (when electromagnet impulse is applied)
// This is the PLL feedback - the time between impulses is the sampling period
const tidalUpdateInterval = 64; // Update spectrum every 64 samples for FFT

// p5.js setup function
function setup() {
    // Create canvas and attach to container
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('p5-canvas');
    
    // Initialize pendulum first to get natural frequency
    resetPendulum();
    
    // Initialize PLL with natural frequency of pendulum
    const naturalFreq = getNaturalFrequency();
    pll = new PLL(naturalFreq, pllParams.loopGain);
    
    // Initial angle is set in resetPendulum() to 0.01 degrees
}

// p5.js draw function - called every frame
function draw() {
    background(240, 245, 250);
    
    if (!simulationPaused) {
        // Update physics multiple times per frame if simulation speed > 1
        // This keeps dt small for numerical stability while allowing faster simulation
        const baseDt = 0.016; // ~60 fps base time step (small for stability)
        // Calculate number of steps: use fractional approach for better accuracy
        // For speeds > 100, we need to handle differently to avoid performance issues
        const maxStepsPerFrame = 100; // Limit to prevent performance issues
        let numSteps = Math.max(1, Math.min(maxStepsPerFrame, Math.round(simulationSpeed)));
        
        // For very high speeds (>100), we'll do multiple iterations
        // This is an approximation but better than limiting to 100
        if (simulationSpeed > maxStepsPerFrame) {
            // For speeds > 100, we'll do maxStepsPerFrame steps but scale dt proportionally
            // This is a compromise between accuracy and performance
            numSteps = maxStepsPerFrame;
            // Note: This means we won't achieve exact speed > 100, but it's a reasonable trade-off
        }
        
        // Run all simulation steps first to maintain simulation integrity
        for (let step = 0; step < numSteps; step++) {
            // Use small, constant dt for numerical stability
            updatePendulumWithDt(baseDt); // updatePendulumWithDt now handles sampling internally
            
            // Update PLL with current pendulum phase (update at every step for accuracy)
            const pendulumPhase = normalizeAngle(pendulumAngle + PI);
            pll.update(pendulumPhase);
        }
        
        // Update UI status
        updateLockStatus(pll.isLocked);
    }
    
    // Draw everything
    drawGrid();
    drawPendulum();
    drawInfo();
}

// Update pendulum physics using equation of motion
// Sampling is now based on simulated time, not real frames
function updatePendulumWithDt(dt) {
    
    // Calculate natural frequency from physical length
    // For small angles: T = 2π√(L/g), so ω = √(g/L)
    const g = 9.81; // m/s²
    const lengthM = pendulumParams.lengthCm / 100; // convert cm to m
    const omega0_natural = Math.sqrt(g / lengthM); // rad/s
    
    // Use natural frequency calculated from physical length
    // Frequency is determined by length: f = √(g/L)/(2π)
    const naturalFreq = getNaturalFrequency();
    let omega0 = 2 * Math.PI * naturalFreq;
    
    // Update frequency parameter for display
    pendulumParams.frequency = naturalFreq;
    
    // Calculate damping from Q factor BEFORE applying tidal modulation
    // Q is a physical property of the pendulum and should not vary with tidal modulation
    // Q = omega0 / (2 * zeta * omega0) = 1 / (2 * zeta)
    // Therefore: zeta = 1 / (2 * Q)
    const zeta = 1.0 / (2.0 * pendulumParams.qFactor);
    const dampingCoeff = 2 * zeta * omega0; // Use natural omega0, not modulated
    
    // Add tidal modulation to simulate real oceanographic conditions
    // User-controllable lunar frequency (200 µHz to 0.1 Hz)
    // All frequencies are scaled by simulationTimeScale for consistency
    const tidalM2_freq = pendulumParams.lunarFreq * simulationTimeScale; // User-controlled M2 frequency (scaled)
    const tidalS2_freq = 23.148e-6 * simulationTimeScale; // S2 (relative to M2)
    const tidalK1_freq = 11.607e-6 * simulationTimeScale; // K1
    
    // Modulate the natural frequency with tidal components
    // This simulates how tidal forces would affect the pendulum
    const tidalModulation = 
        0.02 * Math.sin(2 * Math.PI * tidalM2_freq * pendulumTime) +
        0.015 * Math.sin(2 * Math.PI * tidalS2_freq * pendulumTime) +
        0.01 * Math.sin(2 * Math.PI * tidalK1_freq * pendulumTime);
    
    omega0 = omega0 * (1 + tidalModulation);
    
    // Damped harmonic oscillator equation
    // d²θ/dt² = -ω₀² * sin(θ) - 2ζω₀ * dθ/dt
    const angleInRadians = pendulumAngle;
    
    // For better accuracy with high Q, use proper pendulum equation
    const acceleration = -omega0 * omega0 * sin(angleInRadians) - 
                        dampingCoeff * pendulumVelocity;
    
    // Update velocity and position (Euler integration)
    pendulumVelocity += acceleration * dt;
    
    // Store old angle before updating (for zero crossing detection)
    const oldAngle = pendulumAngle;
    pendulumAngle += pendulumVelocity * dt;
    
    // Check for zero crossing and apply energy impulse
    // Zero crossing occurs when angle changes sign
    const oldAngleSign = Math.sign(oldAngle);
    const currentAngleSign = Math.sign(pendulumAngle);
    
    if (oldAngleSign !== 0 && currentAngleSign !== 0 && oldAngleSign !== currentAngleSign) {
        // Zero crossing detected! This is when the electromagnet applies the impulse (PLL feedback)
        
        // Calculate period since last zero crossing (this is the sampling period)
        let period = 0;
        if (lastZeroCrossingTime > 0) {
            period = pendulumTime - lastZeroCrossingTime;
        } else {
            // First zero crossing - estimate period from natural frequency
            const naturalFreq = getNaturalFrequency();
            period = 1.0 / naturalFreq;
        }
        lastZeroCrossingTime = pendulumTime;
        
        // Sample for tidal frequency analysis
        // The period between zero crossings reflects the modulated frequency
        // We store the period deviation from the natural period
        const naturalFreq = getNaturalFrequency();
        const naturalPeriod = 1.0 / naturalFreq;
        const periodDeviation = (period - naturalPeriod) / naturalPeriod;
        
        // Store the period deviation (normalized)
        // This captures how tidal modulation affects the pendulum period
        tidalSignalHistory.push(periodDeviation);
        
        // Also store the actual period for calculating effective sampling frequency
        tidalPeriodHistory.push(period);
        
        // Maintain buffer at exactly 65536 samples (circular buffer)
        if (tidalSignalHistory.length > maxTidalHistory) {
            tidalSignalHistory.shift();
            tidalPeriodHistory.shift();
        }
        
        // Apply energy impulse (PLL feedback)
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
    
    // Update time (dt is already small and constant, speed is handled by number of steps per frame)
    pendulumTime += dt;
    
    // Sample for high-frequency FFT based on SIMULATED TIME, not real frames
    // This ensures consistent sampling rate regardless of simulation speed
    // Use a more robust approach: check if we've crossed a sample boundary
    const currentSampleIndex = Math.floor(pendulumTime / sampleInterval);
    const lastSampleIndex = Math.floor(lastSampleTime / sampleInterval);
    
    if (currentSampleIndex > lastSampleIndex) {
        // We've crossed at least one sample boundary
        // Update lastSampleTime to the exact sample time to avoid drift
        lastSampleTime = currentSampleIndex * sampleInterval;
        signalHistory.push(pendulumAngle);
        if (signalHistory.length > maxSignalHistory) {
            signalHistory.shift();
        }
    }
}

// Legacy function name for compatibility (now calls updatePendulumWithDt)
function updatePendulum() {
    const baseDt = 0.016; // ~60 fps base time step
    updatePendulumWithDt(baseDt);
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
    const naturalFreq = getNaturalFrequency();
    const currentAmp = getCurrentAmplitude();
    
    text(`Natural Freq: ${naturalFreq.toFixed(3)} Hz`, 20, 20);
    text(`VCO Freq: ${vcoOutput.frequency.toFixed(3)} Hz`, 20, 40);
    text(`Phase Error: ${(pll.phaseError * 180 / PI).toFixed(2)}°`, 20, 60);
    text(`Lock Status: ${pll.isLocked ? 'LOCKED' : 'ACQUIRING'}`, 20, 80);
    text(`Q Factor: ${pendulumParams.qFactor.toExponential(1)}`, 20, 100);
    text(`Length: ${pendulumParams.lengthCm} cm | Mass: ${pendulumParams.mass.toFixed(1)} kg`, 20, 120);
    text(`Amplitude: ${currentAmp.toFixed(2)}°`, 20, 140);
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
    
    const lockBarY = pendulumParams.energyImpulse > 0 ? 175 : 155;
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
    lastZeroCrossingTime = 0; // Reset zero crossing time tracker
    lastSampleTime = 0; // Reset sampling time tracker
    
    // Apply initial energy impulse if enabled
    if (pendulumParams.energyImpulse > 0) {
        const g = 9.81;
        const lengthM = pendulumParams.lengthCm / 100;
        const momentOfInertia = pendulumParams.mass * lengthM * lengthM;
        
        // Calculate initial velocity from energy impulse
        // E = 0.5 * I * ω², so ω = √(2E/I)
        const initialAngularVelocity = Math.sqrt(2 * pendulumParams.energyImpulse / momentOfInertia);
        
        // Ensure minimum visible velocity if impulse is very small
        // For very small impulses, give a small initial push to make it visible
        if (initialAngularVelocity < 0.001) {
            // Add a small initial velocity to make movement visible
            pendulumVelocity = 0.001; // Small but visible initial velocity
        } else {
            pendulumVelocity = initialAngularVelocity;
        }
    } else {
        // Even without impulse, give a tiny initial velocity from the small angle
        // This ensures the pendulum will start moving due to gravity
        const g = 9.81;
        const lengthM = pendulumParams.lengthCm / 100;
        const omega0 = Math.sqrt(g / lengthM);
        // Small initial velocity from potential energy: v ≈ √(2gh) where h = L(1-cos(θ))
        const smallAngle = radians(0.01);
        const height = lengthM * (1 - Math.cos(smallAngle));
        const initialVel = Math.sqrt(2 * g * height) / lengthM; // Convert to angular
        pendulumVelocity = initialVel * 0.1; // Scale down for very small angle
    }
}

// Reset entire simulation
function resetSimulation() {
    resetPendulum();
    
    // Reset PLL with current natural frequency
    const naturalFreq = getNaturalFrequency();
    pll.reset(naturalFreq);
    
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
// Frequency is now calculated from length, not user-controlled
function getNaturalFrequency() {
    const g = 9.81;
    const lengthM = pendulumParams.lengthCm / 100;
    return Math.sqrt(g / lengthM) / (2 * Math.PI);
}

// Amplitude is now a result, not a control parameter
function getCurrentAmplitude() {
    // Find maximum angle from recent history
    if (signalHistory.length === 0) return 0.01;
    const maxAngle = Math.max(...signalHistory.map(Math.abs));
    return degrees(maxAngle);
}

function updateQFactor(q) {
    pendulumParams.qFactor = q;
}

function updatePendulumLength(lengthCm) {
    pendulumParams.lengthCm = lengthCm;
    // Update PLL VCO frequency to match new natural frequency
    const naturalFreq = getNaturalFrequency();
    if (pll) {
        pll.setVCOFrequency(naturalFreq);
    }
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

// VCO frequency is now determined by PLL and natural frequency
// No user control needed

function updateLunarFrequency(freq) {
    pendulumParams.lunarFreq = freq;
}

function updateSimulationSpeed(speed) {
    // When simulation speed changes, reset tidal buffers to avoid mixing periods
    // measured at different speeds (though periods are in simulation time, so they should be consistent)
    const speedChanged = Math.abs(simulationSpeed - speed) > 0.01;
    simulationSpeed = speed;
    
    if (speedChanged) {
        // Clear tidal buffers when speed changes significantly
        // This ensures consistency in period measurements
        tidalSignalHistory = [];
        tidalPeriodHistory = [];
        lastZeroCrossingTime = 0; // Reset to force recalculation on next zero crossing
    }
}

// Get PLL data for graphing
function getPLLData() {
    if (!pll) return { phaseError: [], frequency: [], signal: [], tidalSignal: [], tidalPeriods: [] };
    return {
        phaseError: pll.phaseErrorHistory,
        frequency: pll.freqHistory,
        signal: signalHistory,
        tidalSignal: tidalSignalHistory,
        tidalPeriods: tidalPeriodHistory // Include period history for calculating effective sampling frequency
    };
}

// Make simulationPaused and pendulumParams accessible globally for UI
window.simulationPaused = simulationPaused;
window.pendulumParams = pendulumParams;
window.updateSimulationSpeed = updateSimulationSpeed;
window.simulationSpeed = () => simulationSpeed; // Expose current simulation speed

