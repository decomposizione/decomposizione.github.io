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
    // PLL Loop Gain Slider
    const gainSlider = document.getElementById('pll-gain');
    const gainValue = document.getElementById('value-gain');
    
    gainSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        gainValue.textContent = value.toFixed(2);
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
    
    // Simulation Speed Slider (logarithmic scale: 1x to 1000x)
    const simSpeedSlider = document.getElementById('sim-speed');
    const simSpeedValue = document.getElementById('value-sim-speed');
    
    simSpeedSlider.addEventListener('input', (e) => {
        const exponent = parseFloat(e.target.value);
        const speed = Math.pow(10, exponent); // 10^0 = 1x, 10^3 = 1000x
        
        if (speed < 1.1) {
            simSpeedValue.textContent = speed.toFixed(2) + 'x';
        } else if (speed < 10) {
            simSpeedValue.textContent = speed.toFixed(1) + 'x';
        } else {
            simSpeedValue.textContent = Math.round(speed) + 'x';
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

// User-controllable spectrum parameters
let spectrumCenterFreq = 1.5; // Hz for pendulum spectrum
let tidalSpectrumCenterFreq = 22.344e-6; // Hz for tidal spectrum

// Initialize canvas contexts for graphs
function initializeGraphs() {
    const phaseCanvas = document.getElementById('phase-error-graph');
    const freqCanvas = document.getElementById('frequency-graph');
    const spectrumCanvas = document.getElementById('spectrum-graph');
    const tidalSpectrumCanvas = document.getElementById('tidal-spectrum-graph');
    
    phaseErrorCtx = phaseCanvas.getContext('2d');
    frequencyCtx = freqCanvas.getContext('2d');
    spectrumCtx = spectrumCanvas.getContext('2d');
    tidalSpectrumCtx = tidalSpectrumCanvas.getContext('2d');
    
    // Set canvas dimensions
    resizeGraphCanvas(phaseCanvas);
    resizeGraphCanvas(freqCanvas);
    resizeGraphCanvas(spectrumCanvas);
    resizeGraphCanvas(tidalSpectrumCanvas);
    
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
        
        // Update frequency graph
        drawGraph(frequencyCtx, data.frequency, {
            color: '#3498db',
            label: 'Frequency (Hz)',
            min: 0.3,
            max: 2.5,
            showZeroLine: false
        });
        
        // Update spectrum graph
        if (data.signal && data.signal.length > 0) {
            drawSpectrum(spectrumCtx, data.signal);
        }
        
        // Update tidal spectrum graph
        if (data.tidalSignal && data.tidalSignal.length > 0) {
            drawTidalSpectrum(tidalSpectrumCtx, data.tidalSignal);
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
    
    // Calculate magnitude
    const magnitude = new Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
        magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / n;
    }
    
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
}

// Handle window resize
window.addEventListener('resize', () => {
    if (phaseErrorCtx && frequencyCtx && spectrumCtx && tidalSpectrumCtx) {
        resizeGraphCanvas(phaseErrorCtx.canvas);
        resizeGraphCanvas(frequencyCtx.canvas);
        resizeGraphCanvas(spectrumCtx.canvas);
        resizeGraphCanvas(tidalSpectrumCtx.canvas);
    }
});

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}

