// UI Controls and Event Handlers
// Manages all user interactions with sliders, buttons, and controls

// Initialize UI controls when DOM is ready
function initUI() {
    setupSliders();
    setupButtons();
    initializeGraphs();
}

// Update display-only values (frequency and amplitude)
function updateDisplayValues() {
    if (typeof window !== 'undefined' && window.pendulumParams) {
        const params = window.pendulumParams;
        
        // Calculate natural frequency from length
        const g = 9.81;
        const lengthM = params.lengthCm / 100;
        const naturalFreq = Math.sqrt(g / lengthM) / (2 * Math.PI);
        
        // Update frequency display
        const freqDisplay = document.getElementById('value-freq-display');
        if (freqDisplay) {
            freqDisplay.textContent = naturalFreq.toFixed(3) + ' Hz';
        }
        
        // Update amplitude display (will be updated continuously in animation loop)
        updateAmplitudeDisplay();
    }
}

// Update amplitude display from current pendulum state
function updateAmplitudeDisplay() {
    if (typeof window !== 'undefined' && window.pendulumParams) {
        // Get current amplitude from signal history if available
        // This will be updated by the animation loop
        const ampDisplay = document.getElementById('value-amplitude-display');
        if (ampDisplay && typeof getPLLData === 'function') {
            const data = getPLLData();
            if (data.signal && data.signal.length > 0) {
                const maxAngle = Math.max(...data.signal.map(Math.abs));
                const ampDegrees = maxAngle * 180 / Math.PI;
                ampDisplay.textContent = ampDegrees.toFixed(2) + '°';
            }
        }
    }
}

// Setup all slider controls
function setupSliders() {
    // VCO Initial Frequency Slider
    const vcoFreqSlider = document.getElementById('vco-frequency');
    const vcoFreqValue = document.getElementById('value-vco-freq');
    
    // Function to initialize VCO frequency from natural frequency
    function initializeVCOFrequency() {
        if (typeof window !== 'undefined' && window.pendulumParams) {
            const g = 9.81;
            const lengthM = window.pendulumParams.lengthCm / 100;
            const naturalFreq = Math.sqrt(g / lengthM) / (2 * Math.PI);
            vcoFreqSlider.value = naturalFreq.toFixed(3);
            vcoFreqValue.textContent = naturalFreq.toFixed(3) + ' Hz';
            if (typeof updateVCOFrequency === 'function') {
                updateVCOFrequency(naturalFreq);
            }
            return true;
        }
        return false;
    }
    
    // Try to initialize immediately, or wait a bit for sketch.js to load
    if (!initializeVCOFrequency()) {
        setTimeout(initializeVCOFrequency, 100);
    }
    
    vcoFreqSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        vcoFreqValue.textContent = value.toFixed(3) + ' Hz';
        if (typeof updateVCOFrequency === 'function') {
            updateVCOFrequency(value);
        }
    });
    
    // PLL Loop Gain Slider
    const gainSlider = document.getElementById('pll-gain');
    const gainValue = document.getElementById('value-gain');
    
    gainSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        gainValue.textContent = value;
        updatePLLGain(value);
    });
    
    // Quality Factor Q Slider (logarithmic scale)
    const qSlider = document.getElementById('q-factor');
    const qValue = document.getElementById('value-q');
    
    qSlider.addEventListener('input', (e) => {
        const exponent = parseFloat(e.target.value);
        const value = Math.pow(10, exponent);
        qValue.textContent = value.toExponential(1);
        updateQFactor(value);
    });
    
    // Lunar Modulation Frequency Slider (logarithmic scale)
    const lunarSlider = document.getElementById('lunar-freq');
    const lunarValue = document.getElementById('value-lunar');
    
    lunarSlider.addEventListener('input', (e) => {
        const exponent = parseFloat(e.target.value);
        const freqHz = Math.pow(10, exponent);
        
        // Display in appropriate units
        if (freqHz < 1e-3) {
            lunarValue.textContent = (freqHz * 1e6).toFixed(1) + ' µHz';
        } else if (freqHz < 1) {
            lunarValue.textContent = (freqHz * 1e3).toFixed(2) + ' mHz';
        } else {
            lunarValue.textContent = freqHz.toFixed(3) + ' Hz';
        }
        
        updateLunarFrequency(freqHz);
    });
    
    // Simulation Speed Slider (logarithmic scale: 1x to 100000x)
    const simSpeedSlider = document.getElementById('sim-speed');
    const simSpeedValue = document.getElementById('value-sim-speed');
    
    // Initialize to 1000x (exponent = 3, since 10^3 = 1000)
    const initialExponent = 3;
    const initialSpeed = Math.pow(10, initialExponent);
    simSpeedValue.textContent = Math.round(initialSpeed) + 'x';
    updateSimulationSpeed(initialSpeed);
    
    simSpeedSlider.addEventListener('input', (e) => {
        const exponent = parseFloat(e.target.value);
        const speed = Math.pow(10, exponent); // 10^0 = 1x, 10^5 = 100000x
        
        if (speed < 1.1) {
            simSpeedValue.textContent = speed.toFixed(2) + 'x';
        } else if (speed < 10) {
            simSpeedValue.textContent = speed.toFixed(1) + 'x';
        } else if (speed < 1000) {
            simSpeedValue.textContent = Math.round(speed) + 'x';
        } else {
            // For very large numbers, use scientific notation or abbreviated format
            if (speed >= 1000 && speed < 1000000) {
                simSpeedValue.textContent = (speed / 1000).toFixed(0) + 'Kx';
            } else {
                simSpeedValue.textContent = (speed / 1000).toFixed(0) + 'Kx';
            }
        }
        updateSimulationSpeed(speed);
    });
    
    // Pendulum Spectrum Center Frequency Slider
    const spectrumCenterSlider = document.getElementById('spectrum-center');
    const spectrumCenterValue = document.getElementById('value-spectrum-center');
    
    spectrumCenterSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        spectrumCenterValue.textContent = value.toFixed(1) + ' Hz';
        spectrumCenterFreq = value;
    });
    
    // Tidal Spectrum Center Frequency Slider (logarithmic scale)
    const tidalSpectrumCenterSlider = document.getElementById('tidal-spectrum-center');
    const tidalSpectrumCenterValue = document.getElementById('value-tidal-spectrum-center');
    
    tidalSpectrumCenterSlider.addEventListener('input', (e) => {
        const exponent = parseFloat(e.target.value);
        const freqHz = Math.pow(10, exponent);
        
        // Display in appropriate units
        if (freqHz < 1e-3) {
            tidalSpectrumCenterValue.textContent = (freqHz * 1e6).toFixed(1) + ' µHz';
        } else if (freqHz < 1) {
            tidalSpectrumCenterValue.textContent = (freqHz * 1e3).toFixed(2) + ' mHz';
        } else {
            tidalSpectrumCenterValue.textContent = freqHz.toFixed(3) + ' Hz';
        }
        
        tidalSpectrumCenterFreq = freqHz;
    });
    
    // Pendulum Length Slider
    const lengthSlider = document.getElementById('pendulum-length');
    const lengthValue = document.getElementById('value-length');
    
    lengthSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        lengthValue.textContent = value + ' cm';
        updatePendulumLength(value);
    });
    
    // Pendulum Mass Slider
    const massSlider = document.getElementById('pendulum-mass');
    const massValue = document.getElementById('value-mass');
    
    massSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        massValue.textContent = value.toFixed(1) + ' kg';
        updatePendulumMass(value);
    });
    
    // Energy Impulse Slider (logarithmic scale: 1 nJ to 5 J)
    const energySlider = document.getElementById('energy-impulse');
    const energyValue = document.getElementById('value-energy');
    
    energySlider.addEventListener('input', (e) => {
        const exponent = parseFloat(e.target.value);
        const energyJ = Math.pow(10, exponent);
        
        // Display in appropriate units
        if (energyJ < 1e-9) {
            // Shouldn't happen (min is 1 nJ), but handle it
            energyValue.textContent = (energyJ * 1e12).toFixed(1) + ' pJ';
        } else if (energyJ < 1e-6) {
            energyValue.textContent = (energyJ * 1e9).toFixed(1) + ' nJ';
        } else if (energyJ < 1e-3) {
            energyValue.textContent = (energyJ * 1e6).toFixed(1) + ' µJ';
        } else if (energyJ < 1) {
            energyValue.textContent = (energyJ * 1e3).toFixed(1) + ' mJ';
        } else {
            energyValue.textContent = energyJ.toFixed(2) + ' J';
        }
        
        updateEnergyImpulse(energyJ);
    });
    
    // Update display values periodically
    setInterval(updateDisplayValues, 100); // Update every 100ms
    setInterval(updateAmplitudeDisplay, 50); // Update amplitude more frequently
}

// Setup button controls
function setupButtons() {
    // Reset Button
    document.getElementById('btn-reset').addEventListener('click', () => {
        resetSimulation();
    });
    
    // Pause/Resume Button
    document.getElementById('btn-pause').addEventListener('click', () => {
        togglePause();
        window.simulationPaused = simulationPaused;
        updatePauseButton();
    });
}

// Graph rendering contexts
let phaseErrorCtx = null;
let frequencyCtx = null;
let spectrumCtx = null;
let tidalSpectrumCtx = null;
let tidalSNRCtx = null;
let tidalPhaseCtx = null;

// User-controllable spectrum parameters
let spectrumCenterFreq = 1.5; // Hz for pendulum spectrum
let tidalSpectrumCenterFreq = 22.344e-6; // Hz for tidal spectrum

// Initialize canvas contexts for graphs
function initializeGraphs() {
    const phaseCanvas = document.getElementById('phase-error-graph');
    const freqCanvas = document.getElementById('frequency-graph');
    const spectrumCanvas = document.getElementById('spectrum-graph');
    const tidalSpectrumCanvas = document.getElementById('tidal-spectrum-graph');
    const tidalSNRCanvas = document.getElementById('tidal-snr-graph');
    const tidalPhaseCanvas = document.getElementById('tidal-phase-graph');
    
    phaseErrorCtx = phaseCanvas.getContext('2d');
    frequencyCtx = freqCanvas.getContext('2d');
    spectrumCtx = spectrumCanvas.getContext('2d');
    tidalSpectrumCtx = tidalSpectrumCanvas.getContext('2d');
    tidalSNRCtx = tidalSNRCanvas.getContext('2d');
    tidalPhaseCtx = tidalPhaseCanvas.getContext('2d');
    
    // Set canvas dimensions
    resizeGraphCanvas(phaseCanvas);
    resizeGraphCanvas(freqCanvas);
    resizeGraphCanvas(spectrumCanvas);
    resizeGraphCanvas(tidalSpectrumCanvas);
    resizeGraphCanvas(tidalSNRCanvas);
    resizeGraphCanvas(tidalPhaseCanvas);
    
    // Start animation loop for graphs
    requestAnimationFrame(updateGraphs);
}

// Resize canvas to match display size
function resizeGraphCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

// Clear all graphs
function clearGraphs() {
    // Clear SNR history when graphs are cleared
    clearSNRHistory();
    if (phaseErrorCtx) {
        const canvas = phaseErrorCtx.canvas;
        phaseErrorCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (frequencyCtx) {
        const canvas = frequencyCtx.canvas;
        frequencyCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (spectrumCtx) {
        const canvas = spectrumCtx.canvas;
        spectrumCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (tidalSpectrumCtx) {
        const canvas = tidalSpectrumCtx.canvas;
        tidalSpectrumCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (tidalSNRCtx) {
        const canvas = tidalSNRCtx.canvas;
        tidalSNRCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (tidalPhaseCtx) {
        const canvas = tidalPhaseCtx.canvas;
        tidalPhaseCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Update graphs with current PLL data
function updateGraphs() {
    if (typeof getPLLData === 'function') {
        const data = getPLLData();
        
        // Update phase error graph
        drawGraph(phaseErrorCtx, data.phaseError, {
            color: '#e74c3c',
            label: 'Phase Error (rad)',
            min: -Math.PI,
            max: Math.PI,
            showZeroLine: true
        });
        
        // Update frequency graph with autoscaling
        if (data.frequency && data.frequency.length > 0) {
            // Find min/max frequency values for autoscaling
            const minFreq = Math.min(...data.frequency);
            const maxFreq = Math.max(...data.frequency);
            
            // Add margin (10% on each side)
            const freqRange = maxFreq - minFreq;
            const margin = Math.max(freqRange * 0.1, 0.05); // At least 0.05 Hz margin
            const scaledMin = Math.max(0.1, minFreq - margin);
            const scaledMax = maxFreq + margin;
            
            drawGraph(frequencyCtx, data.frequency, {
                color: '#3498db',
                label: 'Frequency (Hz)',
                min: scaledMin,
                max: scaledMax,
                showZeroLine: false
            });
        } else {
            // Default range if no data
            drawGraph(frequencyCtx, data.frequency, {
                color: '#3498db',
                label: 'Frequency (Hz)',
                min: 0.3,
                max: 2.5,
                showZeroLine: false
            });
        }
        
        // Update spectrum graph
        if (data.signal && data.signal.length > 0) {
            drawSpectrum(spectrumCtx, data.signal);
        }
        
        // Update tidal spectrum graph (calculates FFT)
        if (data.tidalSignal && data.tidalSignal.length > 0) {
            drawTidalSpectrum(tidalSpectrumCtx, data.tidalSignal);
            // Draw SNR graph using the same FFT results
            drawTidalSNR(tidalSNRCtx);
            // Draw phase using the same FFT results
            drawTidalPhase(tidalPhaseCtx);
        }
    }
    
    // Continue animation loop
    requestAnimationFrame(updateGraphs);
}

// Generic graph drawing function
function drawGraph(ctx, dataArray, options = {}) {
    const canvas = ctx.canvas;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Zero line (if enabled)
    if (options.showZeroLine) {
        const zeroY = mapValue(0, options.min, options.max, height - 10, 10);
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, zeroY);
        ctx.lineTo(width, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw data
    if (dataArray && dataArray.length > 0) {
        ctx.strokeStyle = options.color || '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const maxPoints = 200;
        const step = width / maxPoints;
        
        for (let i = 0; i < dataArray.length; i++) {
            const x = (i / maxPoints) * width;
            const y = mapValue(dataArray[i], options.min, options.max, height - 10, 10);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw current value indicator
        if (dataArray.length > 0) {
            const lastValue = dataArray[dataArray.length - 1];
            const lastY = mapValue(lastValue, options.min, options.max, height - 10, 10);
            
            ctx.fillStyle = options.color;
            ctx.beginPath();
            ctx.arc(width - 5, lastY, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Value label
            ctx.fillStyle = '#2c3e50';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(lastValue.toFixed(3), width - 10, lastY - 8);
        }
    }
    
    // Y-axis labels
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    
    ctx.fillText(options.max.toFixed(2), 5, 15);
    ctx.fillText(options.min.toFixed(2), 5, height - 5);
}

// Map value from one range to another
function mapValue(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Simple FFT implementation (Cooley-Tukey algorithm)
function fft(real, imag) {
    const n = real.length;
    if (n <= 1) return;
    
    // Bit-reversal permutation
    let j = 0;
    for (let i = 0; i < n; i++) {
        if (i < j) {
            [real[i], real[j]] = [real[j], real[i]];
            [imag[i], imag[j]] = [imag[j], imag[i]];
        }
        let k = n / 2;
        while (k <= j) {
            j -= k;
            k /= 2;
        }
        j += k;
    }
    
    // FFT computation
    for (let len = 2; len <= n; len *= 2) {
        const angle = -2 * Math.PI / len;
        const wlen_r = Math.cos(angle);
        const wlen_i = Math.sin(angle);
        
        for (let i = 0; i < n; i += len) {
            let w_r = 1;
            let w_i = 0;
            
            for (let j = 0; j < len / 2; j++) {
                const u_r = real[i + j];
                const u_i = imag[i + j];
                const v_r = real[i + j + len / 2] * w_r - imag[i + j + len / 2] * w_i;
                const v_i = real[i + j + len / 2] * w_i + imag[i + j + len / 2] * w_r;
                
                real[i + j] = u_r + v_r;
                imag[i + j] = u_i + v_i;
                real[i + j + len / 2] = u_r - v_r;
                imag[i + j + len / 2] = u_i - v_i;
                
                const temp_r = w_r;
                w_r = w_r * wlen_r - w_i * wlen_i;
                w_i = temp_r * wlen_i + w_i * wlen_r;
            }
        }
    }
}

// Draw frequency spectrum with tidal component markers
function drawSpectrum(ctx, signal) {
    const canvas = ctx.canvas;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Prepare signal for FFT
    const n = 512; // Power of 2
    const real = new Array(n).fill(0);
    const imag = new Array(n).fill(0);
    
    // Apply Hanning window and copy signal
    for (let i = 0; i < Math.min(signal.length, n); i++) {
        const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / n));
        real[i] = signal[i] * window;
    }
    
    // Perform FFT
    fft(real, imag);
    
    // Calculate magnitude
    const magnitude = new Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
        magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / n;
    }
    
    // Find max for normalization
    const maxMag = Math.max(...magnitude.slice(1, n / 4));
    
    // Sampling parameters
    const dt = 0.016; // seconds per sample
    const fs = 1 / dt; // sampling frequency
    
    // User-defined frequency range centered on spectrumCenterFreq
    const freqRange = 3.0; // Hz, display range width
    const minFreq = Math.max(0, spectrumCenterFreq - freqRange / 2);
    const maxFreq = spectrumCenterFreq + freqRange / 2;
    
    // Draw spectrum
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const minBin = Math.floor(minFreq * n / fs);
    const maxBin = Math.min(n / 2, Math.ceil(maxFreq * n / fs));
    
    let firstPoint = true;
    for (let i = minBin; i < maxBin; i++) {
        const freq = i * fs / n;
        const x = ((freq - minFreq) / (maxFreq - minFreq)) * width;
        const mag = magnitude[i] / maxMag;
        const y = height - 30 - (mag * (height - 50));
        
        if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Get actual pendulum frequency from simulation
    // Access via window.pendulumParams (exposed from sketch.js)
    let actualPendulumFreq = 1.0; // Default
    if (typeof window !== 'undefined' && window.pendulumParams) {
        const params = window.pendulumParams;
        actualPendulumFreq = params.frequency;
        
        // Calculate natural frequency from physical length
        // T = 2π√(L/g), so f = 1/T = √(g/L)/(2π)
        const g = 9.81;
        const lengthM = params.lengthCm / 100;
        const naturalFreq = Math.sqrt(g / lengthM) / (2 * Math.PI);
        
        // Use natural frequency for harmonics (more physically accurate)
        // This shows the relationship between length and frequency
        actualPendulumFreq = naturalFreq;
    }
    
    // Calculate harmonics based on actual pendulum frequency
    const harmonics = [
        actualPendulumFreq * 0.5,  // Subharmonic
        actualPendulumFreq,        // Fundamental
        actualPendulumFreq * 1.5,  // 3/2 harmonic
        actualPendulumFreq * 2.0,  // 2nd harmonic
        actualPendulumFreq * 2.5,  // 5/2 harmonic
        actualPendulumFreq * 3.0   // 3rd harmonic
    ];
    
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    // Draw fundamental frequency marker (highlighted)
    if (actualPendulumFreq >= minFreq && actualPendulumFreq <= maxFreq) {
        const fundX = ((actualPendulumFreq - minFreq) / (maxFreq - minFreq)) * width;
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(fundX, 0);
        ctx.lineTo(fundX, height - 30);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`${actualPendulumFreq.toFixed(3)} Hz`, fundX, 25);
        ctx.font = '10px sans-serif';
        ctx.fillText('Fundamental', fundX, 38);
    }
    
    // Draw other harmonics
    harmonics.forEach((harm, idx) => {
        // Skip fundamental (already drawn)
        if (Math.abs(harm - actualPendulumFreq) < 0.01) return;
        
        if (harm >= minFreq && harm <= maxFreq) {
            const x = ((harm - minFreq) / (maxFreq - minFreq)) * width;
            
            ctx.strokeStyle = '#95a5a6';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height - 30);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#7f8c8d';
            ctx.font = '10px sans-serif';
            ctx.fillText(`${harm.toFixed(2)} Hz`, x, height - 15);
        }
    });
    
    // Title with actual frequency
    ctx.fillStyle = '#2c3e50';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Pendulum spectrum (f₀ = ${actualPendulumFreq.toFixed(3)} Hz)`, width / 2, 15);
    
    // Center marker (user-defined center frequency)
    if (spectrumCenterFreq >= minFreq && spectrumCenterFreq <= maxFreq) {
        const centerX = ((spectrumCenterFreq - minFreq) / (maxFreq - minFreq)) * width;
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height - 30);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#9b59b6';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('CENTER', centerX, height - 45);
    }
    
    // Axes
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 30);
    ctx.lineTo(width, height - 30);
    ctx.stroke();
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Magnitude', 0, 0);
    ctx.restore();
}

// Global variables to store FFT results for tidal analysis
let tidalFFTReal = null;
let tidalFFTImag = null;
let tidalFFTParams = null;

// Draw tidal frequency spectrum (20-25 µHz range)
function drawTidalSpectrum(ctx, signal) {
    const canvas = ctx.canvas;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Update every 64 samples, but use buffer of 65536 samples
    if (signal.length < 64) {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Accumulating data for tidal analysis...', width / 2, height / 2);
        ctx.font = '12px sans-serif';
        ctx.fillText(`${signal.length} / 64 samples (updates every 64, buffer: 65536)`, width / 2, height / 2 + 20);
        
        // Clear FFT results if not enough data
        tidalFFTReal = null;
        tidalFFTImag = null;
        tidalFFTParams = null;
        return;
    }
    
    // Prepare signal for FFT - use up to 65536 samples from buffer
    // Use largest power of 2 that fits: 65536 = 2^16
    const n = 65536; // FFT size matching buffer size
    const real = new Array(n).fill(0);
    const imag = new Array(n).fill(0);
    
    // Apply Hanning window and copy signal (use most recent 65536 samples)
    const signalLength = signal.length;
    const actualLength = Math.min(signalLength, n);
    const startIdx = signalLength > n ? signalLength - n : 0; // Start index for samples used in FFT
    
    for (let i = 0; i < actualLength; i++) {
        const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / n)); // Use n for window length, not actualLength
        // Use most recent samples if buffer is full, otherwise from start
        const signalIdx = startIdx + i;
        real[i] = signal[signalIdx] * window;
    }
    // Zero-pad if buffer not yet full
    for (let i = actualLength; i < n; i++) {
        real[i] = 0;
    }
    
    // Perform FFT
    fft(real, imag);
    
    // Calculate magnitude first
    const magnitude = new Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
        magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / n;
    }
    
    // Store FFT results globally for phase plot (including magnitude)
    tidalFFTReal = real.slice(); // Copy arrays
    tidalFFTImag = imag.slice();
    
    // Sampling parameters for tidal signal
    // Sampling happens at zero crossings (when electromagnet impulse is applied)
    // The effective sampling frequency is calculated from ALL periods from first to last sample
    // Starting from the 4th sample (skip first 3 which may be less accurate)
    let fs = 0.4; // Default fallback
    if (typeof getPLLData === 'function') {
        const data = getPLLData();
        if (data.tidalPeriods && data.tidalPeriods.length > 3) {
            // Use all periods from 4th sample onwards (index 3) to the last
            const periodsToUse = data.tidalPeriods.slice(3);
            const avgPeriod = periodsToUse.reduce((a, b) => a + b, 0) / periodsToUse.length;
            // Effective sampling frequency = 1 / average period
            fs = 1.0 / avgPeriod;
        } else if (data.tidalPeriods && data.tidalPeriods.length > 0) {
            // If we have less than 4 samples, use all available (but this is less accurate)
            const avgPeriod = data.tidalPeriods.reduce((a, b) => a + b, 0) / data.tidalPeriods.length;
            fs = 1.0 / avgPeriod;
        } else {
            // Fallback to natural frequency if no periods measured yet
            if (typeof window !== 'undefined' && window.pendulumParams) {
                const params = window.pendulumParams;
                const g = 9.81;
                const lengthM = params.lengthCm / 100;
                fs = Math.sqrt(g / lengthM) / (2 * Math.PI);
            }
        }
    }
    
    // Tidal frequency range (in Hz)
    const simulationTimeScale = 1000; // Must match the scale in sketch.js
    
    // Use user-defined center frequency
    const centerFreq = tidalSpectrumCenterFreq * simulationTimeScale;
    const freqRange = 20e-6 * simulationTimeScale; // Display range width
    const displayMinFreq = Math.max(1e-6 * simulationTimeScale, centerFreq - freqRange / 2);
    const displayMaxFreq = centerFreq + freqRange / 2;
    
    // Find indices corresponding to display range
    const displayMinBin = Math.floor(displayMinFreq * n / fs);
    const displayMaxBin = Math.ceil(displayMaxFreq * n / fs);
    
    // Find max in tidal range for normalization
    const tidalMagnitudes = magnitude.slice(displayMinBin, displayMaxBin);
    const maxMag = Math.max(...tidalMagnitudes, 1e-10);
    
    // Draw spectrum in tidal range
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let firstPoint = true;
    for (let i = displayMinBin; i < displayMaxBin; i++) {
        const freq = i * fs / n;
        const freqMicroHz = freq / simulationTimeScale * 1e6; // Convert to real µHz
        const x = ((freq - displayMinFreq) / (displayMaxFreq - displayMinFreq)) * width;
        const mag = magnitude[i] / maxMag;
        const y = height - 40 - (mag * (height - 60));
        
        if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw tidal component markers
    const actualLunarFreq = (typeof pendulumParams !== 'undefined') ? pendulumParams.lunarFreq : 22.344e-6;
    const tidalComponents = [
        { name: 'K1', freq: 11.607e-6, period: 23.93, color: '#2ecc71' },
        { name: 'O1', freq: 11.381e-6, period: 25.82, color: '#f39c12' },
        { name: 'M2', freq: actualLunarFreq, period: 1/(actualLunarFreq * 3600), color: '#e74c3c', userSet: true },
        { name: 'S2', freq: 23.148e-6, period: 12.00, color: '#3498db' }
    ];
    
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    tidalComponents.forEach(component => {
        const scaledFreq = component.freq * simulationTimeScale;
        if (scaledFreq >= displayMinFreq && scaledFreq <= displayMaxFreq) {
            const x = ((scaledFreq - displayMinFreq) / (displayMaxFreq - displayMinFreq)) * width;
            
            // Vertical line
            ctx.strokeStyle = component.color;
            ctx.setLineDash([5, 3]);
            ctx.lineWidth = component.userSet ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(x, 30);
            ctx.lineTo(x, height - 40);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Label
            ctx.fillStyle = component.color;
            ctx.font = component.userSet ? 'bold 14px sans-serif' : 'bold 12px sans-serif';
            ctx.fillText(component.name, x, 20);
            ctx.font = '10px sans-serif';
            
            // Format frequency display
            const displayFreq = component.freq * 1e6;
            if (displayFreq < 1000) {
                ctx.fillText(`${displayFreq.toFixed(1)} µHz`, x, height - 25);
            } else {
                ctx.fillText(`${(displayFreq / 1000).toFixed(2)} mHz`, x, height - 25);
            }
            
            const periodHours = component.period;
            if (periodHours < 48) {
                ctx.fillText(`T=${periodHours.toFixed(2)}h`, x, height - 12);
            } else {
                ctx.fillText(`T=${(periodHours / 24).toFixed(1)}d`, x, height - 12);
            }
        }
    });
    
    // Center marker (user-defined center)
    const centerX = ((tidalSpectrumCenterFreq * simulationTimeScale - displayMinFreq) / (displayMaxFreq - displayMinFreq)) * width;
    if (centerX >= 0 && centerX <= width) {
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, 30);
        ctx.lineTo(centerX, height - 40);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#9b59b6';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('CENTER', centerX, 45);
    }
    
    // Title with buffer status
    ctx.fillStyle = '#2c3e50';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Real tidal frequencies (M2, S2, K1, O1)', 10, 15);
    
    // Show buffer status
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#7f8c8d';
    const bufferStatus = signal.length >= 65536 ? 'Buffer: 65536/65536 (full)' : `Buffer: ${signal.length}/65536`;
    ctx.fillText(bufferStatus, width - 180, 15);
    
    // Axes
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 40);
    ctx.lineTo(width, height - 40);
    ctx.stroke();
    
    // X-axis labels - dynamically adjust based on display range
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    // Calculate appropriate tick marks
    const rangeUHz = (displayMaxFreq - displayMinFreq) / simulationTimeScale * 1e6;
    const numTicks = 5;
    const tickSpacing = rangeUHz / (numTicks - 1);
    
    for (let i = 0; i < numTicks; i++) {
        const freq_uHz = (displayMinFreq / simulationTimeScale * 1e6) + (i * tickSpacing);
        const scaledFreq = freq_uHz * 1e-6 * simulationTimeScale;
        const x = ((scaledFreq - displayMinFreq) / (displayMaxFreq - displayMinFreq)) * width;
        
        if (freq_uHz < 1000) {
            ctx.fillText(`${freq_uHz.toFixed(0)}`, x, height - 3);
        } else {
            ctx.fillText(`${(freq_uHz / 1000).toFixed(1)}`, x, height - 3);
        }
    }
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Power', 0, 0);
    ctx.restore();
    
    // Store FFT parameters for phase plot (including magnitude for threshold)
    tidalFFTParams = {
        n: n,
        fs: fs,
        simulationTimeScale: simulationTimeScale,
        displayMinFreq: displayMinFreq,
        displayMaxFreq: displayMaxFreq,
        displayMinBin: displayMinBin,
        displayMaxBin: displayMaxBin,
        magnitude: magnitude.slice() // Store magnitude for phase plot threshold
    };
}

// Storage for SNR history
let snrHistory = {
    m2: [],
    s2: [],
    maxLength: 500 // Keep last 500 samples
};

// Clear SNR history
function clearSNRHistory() {
    snrHistory.m2 = [];
    snrHistory.s2 = [];
}

// Draw M2 & S2 Signal-to-Noise Ratio over time
function drawTidalSNR(ctx) {
    const canvas = ctx.canvas;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Check if FFT results are available
    if (!tidalFFTReal || !tidalFFTImag || !tidalFFTParams) {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Accumulating data for SNR analysis...', width / 2, height / 2);
        ctx.font = '12px sans-serif';
        ctx.fillText('(waiting for FFT calculation)', width / 2, height / 2 + 20);
        return;
    }
    
    // Use stored FFT results
    const n = tidalFFTParams.n;
    const fs = tidalFFTParams.fs;
    const simulationTimeScale = tidalFFTParams.simulationTimeScale;
    const magnitude = tidalFFTParams.magnitude;
    const freqResolution = fs / n;
    
    // M2 and S2 tidal frequencies
    const actualLunarFreq = (typeof pendulumParams !== 'undefined') ? pendulumParams.lunarFreq : 22.344e-6;
    const M2_FREQ = actualLunarFreq; // Hz
    const S2_FREQ = 23.148e-6; // Hz
    
    // Find bins for M2 and S2 (scaled by simulationTimeScale)
    const m2Bin = Math.max(0, Math.min(n / 2 - 1, Math.round(M2_FREQ * simulationTimeScale / freqResolution)));
    const s2Bin = Math.max(0, Math.min(n / 2 - 1, Math.round(S2_FREQ * simulationTimeScale / freqResolution)));
    
    // Calculate SNR for M2 and S2
    // SNR = signal_power / noise_power
    // Use a 3-bin window for signal (peak ± 1 bin)
    // Use side bins for noise estimation
    const windowSize = 3;
    const noiseWindowSize = 10;
    
    function calculateSNR(peakBin) {
        // Signal: sum power in peak ± 1 bin
        let signalPower = 0;
        for (let i = -1; i <= 1; i++) {
            const bin = Math.max(0, Math.min(n / 2 - 1, peakBin + i));
            signalPower += magnitude[bin] * magnitude[bin];
        }
        
        // Noise: average power from bins away from peak
        let noisePower = 0;
        let noiseCount = 0;
        for (let i = -noiseWindowSize; i <= noiseWindowSize; i++) {
            if (Math.abs(i) >= windowSize) { // Skip signal bins
                const bin = Math.max(0, Math.min(n / 2 - 1, peakBin + i));
                noisePower += magnitude[bin] * magnitude[bin];
                noiseCount++;
            }
        }
        noisePower = noiseCount > 0 ? noisePower / noiseCount : 1e-10;
        
        // SNR in dB
        const snr = noisePower > 0 ? 10 * Math.log10(signalPower / noisePower) : 0;
        return snr;
    }
    
    const m2SNR = calculateSNR(m2Bin);
    const s2SNR = calculateSNR(s2Bin);
    
    // Add to history
    snrHistory.m2.push(m2SNR);
    snrHistory.s2.push(s2SNR);
    
    // Trim history if too long
    if (snrHistory.m2.length > snrHistory.maxLength) {
        snrHistory.m2.shift();
    }
    if (snrHistory.s2.length > snrHistory.maxLength) {
        snrHistory.s2.shift();
    }
    
    // Draw SNR history
    if (snrHistory.m2.length < 2) {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Building SNR history...', width / 2, height / 2);
        return;
    }
    
    // Find min/max for autoscaling
    const allSNR = [...snrHistory.m2, ...snrHistory.s2];
    const minSNR = Math.min(...allSNR);
    const maxSNR = Math.max(...allSNR);
    const snrRange = maxSNR - minSNR;
    const margin = Math.max(snrRange * 0.1, 5); // At least 5 dB margin
    const scaledMin = minSNR - margin;
    const scaledMax = maxSNR + margin;
    
    // Grid
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw M2 SNR
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < snrHistory.m2.length; i++) {
        const x = (i / (snrHistory.maxLength - 1)) * width;
        const y = height - 10 - ((snrHistory.m2[i] - scaledMin) / (scaledMax - scaledMin)) * (height - 20);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw S2 SNR
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < snrHistory.s2.length; i++) {
        const x = (i / (snrHistory.maxLength - 1)) * width;
        const y = height - 10 - ((snrHistory.s2[i] - scaledMin) / (scaledMax - scaledMin)) * (height - 20);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    
    // Y-axis labels
    for (let i = 0; i <= 4; i++) {
        const value = scaledMin + (scaledMax - scaledMin) * (i / 4);
        const y = height - 10 - (i / 4) * (height - 20);
        ctx.fillText(value.toFixed(1) + ' dB', 5, y + 4);
    }
    
    // Legend
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('M2: ' + m2SNR.toFixed(1) + ' dB', width - 10, 20);
    ctx.fillStyle = '#3498db';
    ctx.fillText('S2: ' + s2SNR.toFixed(1) + ' dB', width - 10, 40);
    
    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Signal-to-Noise Ratio Over Time', width / 2, 15);
    
    // X-axis label
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (samples)', width / 2, height - 3);
}

// Draw tidal frequency phase (20-25 µHz range) - uses FFT results from drawTidalSpectrum
function drawTidalPhase(ctx) {
    const canvas = ctx.canvas;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Check if FFT results are available
    if (!tidalFFTReal || !tidalFFTImag || !tidalFFTParams) {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Accumulating data for phase analysis...', width / 2, height / 2);
        ctx.font = '12px sans-serif';
        ctx.fillText('(waiting for FFT calculation)', width / 2, height / 2 + 20);
        return;
    }
    
    // Use stored FFT results
    const real = tidalFFTReal;
    const imag = tidalFFTImag;
    const n = tidalFFTParams.n;
    const fs = tidalFFTParams.fs;
    const simulationTimeScale = tidalFFTParams.simulationTimeScale;
    const displayMinFreq = tidalFFTParams.displayMinFreq;
    const displayMaxFreq = tidalFFTParams.displayMaxFreq;
    const displayMinBin = tidalFFTParams.displayMinBin;
    const displayMaxBin = tidalFFTParams.displayMaxBin;
    const magnitude = tidalFFTParams.magnitude;
    
    // Find max magnitude in display range for threshold
    const displayMagnitudes = magnitude.slice(displayMinBin, displayMaxBin);
    const maxMag = Math.max(...displayMagnitudes, 1e-10);
    const threshold = maxMag * 0.05; // 5% of max magnitude
    
    // Calculate phase: atan2(imag, real) - no unwrapping for better visibility
    const phase = new Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
        phase[i] = Math.atan2(imag[i], real[i]);
    }
    
    // Find min/max phase values where magnitude is significant for autoscaling
    let minPhase = Infinity;
    let maxPhase = -Infinity;
    let hasSignificantPhase = false;
    
    for (let i = displayMinBin; i < displayMaxBin; i++) {
        if (magnitude[i] > threshold) {
            minPhase = Math.min(minPhase, phase[i]);
            maxPhase = Math.max(maxPhase, phase[i]);
            hasSignificantPhase = true;
        }
    }
    
    // Default to [-π, π] if no significant phase found
    if (!hasSignificantPhase) {
        minPhase = -Math.PI;
        maxPhase = Math.PI;
    }
    
    // Add some margin
    const phaseMargin = (maxPhase - minPhase) * 0.1;
    minPhase -= phaseMargin;
    maxPhase += phaseMargin;
    
    // Find local maxima (peaks) in the magnitude spectrum
    const peaks = [];
    const minPeakDistance = 10; // Minimum bins between peaks
    
    for (let i = displayMinBin + 1; i < displayMaxBin - 1; i++) {
        if (magnitude[i] > threshold) {
            // Check if it's a local maximum
            if (magnitude[i] > magnitude[i-1] && magnitude[i] > magnitude[i+1]) {
                // Check distance from previous peaks
                let tooClose = false;
                for (const peak of peaks) {
                    if (Math.abs(i - peak.bin) < minPeakDistance) {
                        tooClose = true;
                        // Keep the higher peak
                        if (magnitude[i] > magnitude[peak.bin]) {
                            peak.bin = i;
                            peak.freq = i * fs / n;
                            peak.phase = phase[i];
                            peak.magnitude = magnitude[i];
                        }
                        break;
                    }
                }
                
                if (!tooClose) {
                    peaks.push({
                        bin: i,
                        freq: i * fs / n,
                        phase: phase[i],
                        magnitude: magnitude[i]
                    });
                }
            }
        }
    }
    
    // Find max magnitude for normalization
    const maxPeakMagnitude = peaks.length > 0 ? Math.max(...peaks.map(p => p.magnitude)) : 1;
    
    // Draw phase as power-weighted points/markers at peaks
    for (const peak of peaks) {
        const x = ((peak.freq - displayMinFreq) / (displayMaxFreq - displayMinFreq)) * width;
        const y = height - 40 - ((peak.phase - minPhase) / (maxPhase - minPhase)) * (height - 70);
        
        // Calculate power weight (normalized magnitude)
        const powerWeight = peak.magnitude / maxPeakMagnitude;
        
        // Size of marker proportional to power (min 3px, max 12px)
        const markerSize = 3 + (powerWeight * 9);
        
        // Opacity proportional to power (min 0.4, max 1.0)
        const opacity = 0.4 + (powerWeight * 0.6);
        
        // Draw a circle at the peak with size and opacity based on power
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#9b59b6';
        ctx.strokeStyle = '#7b3fa0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, markerSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        
        // Draw a vertical line to show the phase value (thickness based on power)
        ctx.globalAlpha = opacity * 0.5;
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 1 + (powerWeight * 2);
        ctx.beginPath();
        ctx.moveTo(x, height - 40);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        
        // Draw phase value label (only for significant peaks)
        if (powerWeight > 0.3) {
            ctx.fillStyle = '#7f8c8d';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(peak.phase.toFixed(2), x, y - markerSize - 5);
        }
    }
    
    // Draw zero phase line if it's in range
    if (0 >= minPhase && 0 <= maxPhase) {
        const zeroPhaseY = height - 40 - ((0 - minPhase) / (maxPhase - minPhase)) * (height - 70);
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, zeroPhaseY);
        ctx.lineTo(width, zeroPhaseY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw reference grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    
    // Draw π line if in range
    if (Math.PI >= minPhase && Math.PI <= maxPhase) {
        const piY = height - 40 - ((Math.PI - minPhase) / (maxPhase - minPhase)) * (height - 70);
        ctx.beginPath();
        ctx.moveTo(0, piY);
        ctx.lineTo(width, piY);
        ctx.stroke();
    }
    
    // Draw -π line if in range
    if (-Math.PI >= minPhase && -Math.PI <= maxPhase) {
        const minusPiY = height - 40 - ((-Math.PI - minPhase) / (maxPhase - minPhase)) * (height - 70);
        ctx.beginPath();
        ctx.moveTo(0, minusPiY);
        ctx.lineTo(width, minusPiY);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
    
    // Draw tidal component markers
    const actualLunarFreq = (typeof pendulumParams !== 'undefined') ? pendulumParams.lunarFreq : 22.344e-6;
    const tidalComponents = [
        { name: 'K1', freq: 11.607e-6, period: 23.93, color: '#2ecc71' },
        { name: 'O1', freq: 11.381e-6, period: 25.82, color: '#f39c12' },
        { name: 'M2', freq: actualLunarFreq, period: 1/(actualLunarFreq * 3600), color: '#e74c3c', userSet: true },
        { name: 'S2', freq: 23.148e-6, period: 12.00, color: '#3498db' }
    ];
    
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    tidalComponents.forEach(component => {
        const scaledFreq = component.freq * simulationTimeScale;
        if (scaledFreq >= displayMinFreq && scaledFreq <= displayMaxFreq) {
            const x = ((scaledFreq - displayMinFreq) / (displayMaxFreq - displayMinFreq)) * width;
            
            // Vertical line
            ctx.strokeStyle = component.color;
            ctx.setLineDash([5, 3]);
            ctx.lineWidth = component.userSet ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(x, 30);
            ctx.lineTo(x, height - 40);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Label
            ctx.fillStyle = component.color;
            ctx.font = component.userSet ? 'bold 14px sans-serif' : 'bold 12px sans-serif';
            ctx.fillText(component.name, x, 20);
        }
    });
    
    // Center marker (user-defined center)
    const centerX = ((tidalSpectrumCenterFreq * simulationTimeScale - displayMinFreq) / (displayMaxFreq - displayMinFreq)) * width;
    if (centerX >= 0 && centerX <= width) {
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, 30);
        ctx.lineTo(centerX, height - 40);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#9b59b6';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('CENTER', centerX, 45);
    }
    
    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Phase of tidal frequencies (M2, S2, K1, O1)', 10, 15);
    
    // Axes
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 40);
    ctx.lineTo(width, height - 40);
    ctx.stroke();
    
    // X-axis labels - dynamically adjust based on display range
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    // Calculate appropriate tick marks
    const rangeUHz = (displayMaxFreq - displayMinFreq) / simulationTimeScale * 1e6;
    const numTicks = 5;
    const tickSpacing = rangeUHz / (numTicks - 1);
    
    for (let i = 0; i < numTicks; i++) {
        const freq_uHz = (displayMinFreq / simulationTimeScale * 1e6) + (i * tickSpacing);
        const scaledFreq = freq_uHz * 1e-6 * simulationTimeScale;
        const x = ((scaledFreq - displayMinFreq) / (displayMaxFreq - displayMinFreq)) * width;
        
        if (freq_uHz < 1000) {
            ctx.fillText(`${freq_uHz.toFixed(0)}`, x, height - 3);
        } else {
            ctx.fillText(`${(freq_uHz / 1000).toFixed(1)}`, x, height - 3);
        }
    }
    
    // Y-axis labels
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    
    // Show max and min phase values
    ctx.fillText(maxPhase.toFixed(2), 5, 35);
    ctx.fillText(minPhase.toFixed(2), 5, height - 45);
    
    // Show 0 if in range
    if (0 >= minPhase && 0 <= maxPhase) {
        const zeroY = height - 40 - ((0 - minPhase) / (maxPhase - minPhase)) * (height - 70);
        ctx.fillText('0', 5, zeroY + 3);
    }
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Phase (rad)', 0, 0);
    ctx.restore();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (phaseErrorCtx && frequencyCtx && spectrumCtx && tidalSpectrumCtx && tidalSNRCtx && tidalPhaseCtx) {
        resizeGraphCanvas(phaseErrorCtx.canvas);
        resizeGraphCanvas(frequencyCtx.canvas);
        resizeGraphCanvas(spectrumCtx.canvas);
        resizeGraphCanvas(tidalSpectrumCtx.canvas);
        resizeGraphCanvas(tidalSNRCtx.canvas);
        resizeGraphCanvas(tidalPhaseCtx.canvas);
    }
});

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}

