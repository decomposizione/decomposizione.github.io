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
        freqValue.textContent = value.toFixed(2);
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
    
    // Damping Factor Slider
    const dampingSlider = document.getElementById('damping');
    const dampingValue = document.getElementById('value-damping');
    
    dampingSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        dampingValue.textContent = value.toFixed(2);
        updateDamping(value);
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

// Initialize canvas contexts for graphs
function initializeGraphs() {
    const phaseCanvas = document.getElementById('phase-error-graph');
    const freqCanvas = document.getElementById('frequency-graph');
    
    phaseErrorCtx = phaseCanvas.getContext('2d');
    frequencyCtx = freqCanvas.getContext('2d');
    
    // Set canvas dimensions
    resizeGraphCanvas(phaseCanvas);
    resizeGraphCanvas(freqCanvas);
    
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
            label: 'Frequency (cycles/day)',
            min: 0.3,
            max: 2.5,
            showZeroLine: false
        });
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

// Handle window resize
window.addEventListener('resize', () => {
    if (phaseErrorCtx && frequencyCtx) {
        resizeGraphCanvas(phaseErrorCtx.canvas);
        resizeGraphCanvas(frequencyCtx.canvas);
    }
});

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}

