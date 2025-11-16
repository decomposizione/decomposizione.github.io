// UI Controls and Event Handlers
// Manages all user interactions with sliders, buttons, and controls

// Initialize UI controls when DOM is ready
function initUI() {
    setupSliders();
    setupButtons();
    initializeGraphs();
}

// Setup all slider controls
function setupSliders() {
    // Pendulum Frequency Slider
    const freqSlider = document.getElementById('pendulum-freq');
    const freqValue = document.getElementById('value-freq');
    
    freqSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        freqValue.textContent = value.toFixed(2) + ' Hz';
        updatePendulumFrequency(value);
    });
    
    // Pendulum Amplitude Slider
    const ampSlider = document.getElementById('pendulum-amplitude');
    const ampValue = document.getElementById('value-amplitude');
    
    ampSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        ampValue.textContent = value;
        updatePendulumAmplitude(value);
    });
    
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
    
    // VCO Initial Frequency Slider
    const vcoSlider = document.getElementById('vco-freq');
    const vcoValue = document.getElementById('value-vco');
    
    vcoSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        vcoValue.textContent = value.toFixed(2);
        updateVCOFrequency(value);
    });
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

// Initialize canvas contexts for graphs
function initializeGraphs() {
    const phaseCanvas = document.getElementById('phase-error-graph');
    const freqCanvas = document.getElementById('frequency-graph');
    const spectrumCanvas = document.getElementById('spectrum-graph');
    
    phaseErrorCtx = phaseCanvas.getContext('2d');
    frequencyCtx = freqCanvas.getContext('2d');
    spectrumCtx = spectrumCanvas.getContext('2d');
    
    // Set canvas dimensions
    resizeGraphCanvas(phaseCanvas);
    resizeGraphCanvas(freqCanvas);
    resizeGraphCanvas(spectrumCanvas);
    
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
    
    // Draw spectrum
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const freqRange = 3.0; // Hz, show up to 3 Hz
    const numBins = Math.min(n / 2, Math.floor(n / 2 * freqRange / (fs / 2)));
    
    for (let i = 1; i < numBins; i++) {
        const freq = i * fs / n;
        const x = (freq / freqRange) * width;
        const mag = magnitude[i] / maxMag;
        const y = height - 30 - (mag * (height - 50));
        
        if (i === 1) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw tidal frequency markers (converted to 1 Hz system)
    const tidalComponents = [
        { name: 'M2', period: 12.42, color: '#e74c3c' },  // Lunar semidiurnal
        { name: 'S2', period: 12.00, color: '#3498db' },  // Solar semidiurnal
        { name: 'K1', period: 23.93, color: '#2ecc71' },  // Lunisolar diurnal
        { name: 'O1', period: 25.82, color: '#f39c12' }   // Lunar diurnal
    ];
    
    // For simulation: scale to match our 1 Hz oscillator
    // Show harmonics and subharmonics of the fundamental
    const fundamentalFreq = 1.0; // Hz
    const harmonics = [0.5, 1.0, 1.5, 2.0, 2.5];
    
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    harmonics.forEach((harm, idx) => {
        if (harm <= freqRange) {
            const x = (harm / freqRange) * width;
            
            ctx.strokeStyle = '#95a5a6';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height - 30);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#7f8c8d';
            ctx.fillText(`${harm.toFixed(1)} Hz`, x, height - 15);
        }
    });
    
    // Add theoretical tidal markers (scaled for educational purposes)
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('Tidal components would appear', width / 2, 15);
    ctx.fillText('at much lower frequencies', width / 2, 28);
    
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

// Handle window resize
window.addEventListener('resize', () => {
    if (phaseErrorCtx && frequencyCtx && spectrumCtx) {
        resizeGraphCanvas(phaseErrorCtx.canvas);
        resizeGraphCanvas(frequencyCtx.canvas);
        resizeGraphCanvas(spectrumCtx.canvas);
    }
});

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}

