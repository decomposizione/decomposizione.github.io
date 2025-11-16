// Phase-Locked Loop (PLL) Implementation
// Components: Phase Detector, Loop Filter, VCO (Voltage Controlled Oscillator)

class PLL {
    constructor(initialFreq = 1.0, loopGain = 1.0) {
        // VCO (Voltage Controlled Oscillator) state
        this.vcoFreq = initialFreq;  // Current VCO frequency (cycles/day)
        this.vcoPhase = 0;            // Current VCO phase (radians)
        
        // Loop parameters
        this.loopGain = loopGain;     // Overall loop gain (Kp)
        this.integralGain = 0.1;      // Integral gain for type-2 loop (Ki)
        
        // Filter state
        this.filteredError = 0;        // Output of loop filter
        this.integratorState = 0;      // Integrator state for PI filter
        
        // Phase detector output
        this.phaseError = 0;           // Current phase error (radians)
        
        // Lock detection
        this.lockThreshold = 0.3;      // Radians - threshold for declaring lock
        this.lockCounter = 0;          // Frames in lock
        this.lockCountThreshold = 30;  // Frames needed to declare lock
        this.isLocked = false;
        
        // History for analysis
        this.phaseErrorHistory = [];
        this.freqHistory = [];
        this.maxHistoryLength = 200;
        
        // Time tracking
        this.time = 0;
        this.dt = 0.016; // Time step (~60 fps, scaled for visualization)
    }
    
    // Phase Detector: compares input phase with VCO phase
    // Returns phase difference wrapped to [-PI, PI]
    phaseDetector(inputPhase) {
        // Calculate phase difference
        let diff = inputPhase - this.vcoPhase;
        
        // Wrap to [-PI, PI]
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        
        this.phaseError = diff;
        return diff;
    }
    
    // Loop Filter: PI (Proportional-Integral) filter
    // Smooths the phase error and provides better tracking
    loopFilter(phaseError) {
        // Proportional term
        let proportional = this.loopGain * phaseError;
        
        // Integral term (accumulator)
        this.integratorState += this.integralGain * phaseError * this.dt;
        
        // Limit integrator to prevent windup
        const integratorLimit = 2.0;
        this.integratorState = Math.max(-integratorLimit, 
                                       Math.min(integratorLimit, this.integratorState));
        
        // Combine proportional and integral
        this.filteredError = proportional + this.integratorState;
        
        return this.filteredError;
    }
    
    // VCO (Voltage Controlled Oscillator)
    // Updates frequency and phase based on control voltage (filtered error)
    updateVCO(controlVoltage) {
        // VCO gain (Hz per volt)
        const vcoGain = 0.5;
        
        // Update frequency based on control voltage
        this.vcoFreq += vcoGain * controlVoltage * this.dt;
        
        // Limit frequency to reasonable range
        this.vcoFreq = Math.max(0.1, Math.min(3.0, this.vcoFreq));
        
        // Update phase (integrate frequency)
        // Convert frequency from cycles/day to radians/frame
        const omega = 2 * Math.PI * this.vcoFreq * this.dt / 10; // Scale for visualization
        this.vcoPhase += omega;
        
        // Wrap phase to [0, 2*PI]
        while (this.vcoPhase > 2 * Math.PI) this.vcoPhase -= 2 * Math.PI;
        while (this.vcoPhase < 0) this.vcoPhase += 2 * Math.PI;
    }
    
    // Main PLL update function
    // Call this each frame with the current input phase
    update(inputPhase) {
        // 1. Phase Detector
        const phaseErr = this.phaseDetector(inputPhase);
        
        // 2. Loop Filter
        const controlVoltage = this.loopFilter(phaseErr);
        
        // 3. VCO Update
        this.updateVCO(controlVoltage);
        
        // 4. Lock Detection
        this.updateLockStatus();
        
        // 5. Update history
        this.updateHistory();
        
        // 6. Increment time
        this.time += this.dt;
    }
    
    // Lock detection algorithm
    // Declares lock when phase error is consistently small
    updateLockStatus() {
        if (Math.abs(this.phaseError) < this.lockThreshold) {
            this.lockCounter++;
            if (this.lockCounter >= this.lockCountThreshold) {
                this.isLocked = true;
            }
        } else {
            this.lockCounter = Math.max(0, this.lockCounter - 2);
            if (this.lockCounter === 0) {
                this.isLocked = false;
            }
        }
    }
    
    // Update history buffers for graphing
    updateHistory() {
        this.phaseErrorHistory.push(this.phaseError);
        this.freqHistory.push(this.vcoFreq);
        
        // Limit history length
        if (this.phaseErrorHistory.length > this.maxHistoryLength) {
            this.phaseErrorHistory.shift();
        }
        if (this.freqHistory.length > this.maxHistoryLength) {
            this.freqHistory.shift();
        }
    }
    
    // Get current VCO output (for visualization)
    getVCOOutput() {
        return {
            frequency: this.vcoFreq,
            phase: this.vcoPhase,
            amplitude: 1.0
        };
    }
    
    // Get lock status
    getLockStatus() {
        return {
            isLocked: this.isLocked,
            phaseError: this.phaseError,
            lockQuality: this.lockCounter / this.lockCountThreshold
        };
    }
    
    // Reset PLL to initial state
    reset(initialFreq) {
        this.vcoFreq = initialFreq || this.vcoFreq;
        this.vcoPhase = 0;
        this.filteredError = 0;
        this.integratorState = 0;
        this.phaseError = 0;
        this.lockCounter = 0;
        this.isLocked = false;
        this.phaseErrorHistory = [];
        this.freqHistory = [];
        this.time = 0;
    }
    
    // Update loop gain (when user adjusts slider)
    setLoopGain(gain) {
        this.loopGain = gain;
    }
    
    // Set VCO frequency (for initial conditions)
    setVCOFrequency(freq) {
        this.vcoFreq = freq;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PLL;
}

