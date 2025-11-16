// Internationalization system for IT/EN support

const translations = {
    en: {
        // Header
        mainTitle: "Phase-Locked Loop Pendulum Simulator",
        
        // Controls
        controlsTitle: "Controls",
        labelFreqDisplay: "Natural Frequency (Hz)",
        labelAmplitudeDisplay: "Current Amplitude (degrees)",
        labelGain: "PLL Loop Gain",
        labelQ: "Quality Factor Q",
        labelLunar: "Lunar Modulation Frequency",
        labelSimSpeed: "Simulation Speed",
        labelSpectrumCenter: "Pendulum Spectrum Center (Hz)",
        labelTidalSpectrumCenter: "Tidal Spectrum Center (µHz)",
        labelLength: "Pendulum Length (cm)",
        labelMass: "Pendulum Mass (kg)",
        labelEnergy: "Energy Impulse at Zero (J)",
        
        // Tooltips
        tooltipFreqDisplay: "Calculated from pendulum length: f = √(g/L)/(2π). Not user-controllable.",
        tooltipAmplitudeDisplay: "Resulting amplitude from energy impulse and Q factor. Not user-controllable.",
        tooltipGain: "How fast the PLL locks to the signal",
        tooltipQ: "Oscillator quality factor (higher = less damping, longer oscillations)",
        tooltipLunar: "Frequency of tidal modulation (M2 lunar component). Range: 200 µHz to 0.1 Hz",
        tooltipSimSpeed: "Speed multiplier for simulation. 1x = real-time, 1000x = 1000x faster. Range: 1x to 1000x",
        tooltipSpectrumCenter: "Center frequency for pendulum spectrum display. Adjust to zoom into specific frequency ranges",
        tooltipTidalSpectrumCenter: "Center frequency for tidal spectrum display. Adjust to explore different tidal components",
        tooltipLength: "Physical length of the pendulum rod. Affects natural frequency: T = 2π√(L/g)",
        tooltipMass: "Mass of the pendulum bob. Affects moment of inertia and energy calculations",
        tooltipEnergy: "Energy added to the pendulum each time it passes through zero (vertical position). Range: 1 nJ to 5 J. Simulates external driving force",
        
        // Buttons
        btnReset: "Reset Simulation",
        btnPause: "Pause",
        btnResume: "Resume",
        
        // Status
        statusTitle: "PLL Status",
        statusAcquiring: "Acquiring...",
        statusLocked: "Locked",
        statusUnlocked: "Unlocked",
        
        // Graphs
        graphPhaseLabel: "Phase Error Over Time",
        graphFreqLabel: "PLL Locked Frequency",
        graphSpectrumLabel: "Pendulum Spectrum (0-3 Hz)",
        graphTidalSpectrumLabel: "Tidal Frequency Spectrum (20-25 µHz)",
        graphTidalPhaseLabel: "Tidal Frequency Phase (20-25 µHz)",
        
        // Info Panel
        infoTitle: "About Phase-Locked Loops and Tidal Frequencies",
        infoContent: `
            <p>
                A Phase-Locked Loop (PLL) is a control system that generates an output signal whose phase is related to the phase of an input signal. 
                In this simulation, the pendulum represents a natural oscillator whose frequency is modulated by tidal forces, and the PLL tracks these variations.
            </p>
            <h3>How it works:</h3>
            <ul>
                <li><strong>Phase Detector:</strong> Compares the pendulum's phase with the VCO output, generating a phase error signal</li>
                <li><strong>Loop Filter (PI Controller):</strong> Smooths and integrates the phase error to provide stable control</li>
                <li><strong>VCO (Voltage Controlled Oscillator):</strong> Adjusts its frequency based on the filtered error, attempting to match the input frequency</li>
            </ul>
            <h3>Tidal Frequency Components:</h3>
            <p>
                Ocean tides are the result of gravitational forces from the Moon and Sun. The four main tidal constituents are:
            </p>
            <ul>
                <li><strong>M2 (22.344 µHz, 12.42h):</strong> Principal lunar semidiurnal - the strongest tidal component, caused by the Moon. Creates two high tides per day.</li>
                <li><strong>S2 (23.148 µHz, 12.00h):</strong> Principal solar semidiurnal - caused by the Sun, about 46% of M2's amplitude.</li>
                <li><strong>K1 (11.607 µHz, 23.93h):</strong> Lunisolar diurnal - combined Moon-Sun effect, one cycle per day.</li>
                <li><strong>O1 (11.381 µHz, 25.82h):</strong> Lunar diurnal - lunar effect with one cycle per day.</li>
            </ul>
            <p>
                When M2 and S2 are in phase (full/new moon), you get <strong>spring tides</strong> (highest). When in opposition (quarter moon), you get <strong>neap tides</strong> (lowest).
            </p>
            <h3>Understanding the Simulation:</h3>
            <p>
                The pendulum's natural frequency is modulated by tidal-like forces at M2, S2, and K1 frequencies. 
                The PLL tracks the pendulum's period variations, which are sampled at each zero crossing (when the electromagnet provides an energy impulse).
                The FFT analyzes these period deviations to extract the tidal frequency components and their phases.
            </p>
            <p>
                The <strong>spectrum</strong> shows the power of each tidal component, while the <strong>phase</strong> reveals the timing relationships between them - 
                crucial information for understanding tidal dynamics and predicting high/low tide times.
            </p>
        `,
        
        // Footer
        footerText: "Educational simulation for understanding Phase-Locked Loops | Built with p5.js"
    },
    
    it: {
        // Header
        mainTitle: "Simulatore di Pendolo con PLL (Phase-Locked Loop)",
        
        // Controls
        controlsTitle: "Controlli",
        labelFreqDisplay: "Frequenza Naturale (Hz)",
        labelAmplitudeDisplay: "Ampiezza Corrente (gradi)",
        labelGain: "Guadagno del Loop PLL",
        labelQ: "Fattore di Qualità Q",
        labelLunar: "Frequenza Modulazione Lunare",
        labelSimSpeed: "Velocità Simulazione",
        labelSpectrumCenter: "Centro Spettro Pendolo (Hz)",
        labelTidalSpectrumCenter: "Centro Spettro Mareale (µHz)",
        labelLength: "Lunghezza Pendolo (cm)",
        labelMass: "Massa Pendolo (kg)",
        labelEnergy: "Impulso Energia allo Zero (J)",
        
        // Tooltips
        tooltipFreqDisplay: "Calcolata dalla lunghezza del pendolo: f = √(g/L)/(2π). Non controllabile dall'utente.",
        tooltipAmplitudeDisplay: "Ampiezza risultante dall'impulso di energia e dal fattore Q. Non controllabile dall'utente.",
        tooltipGain: "Velocità con cui il PLL si aggancia al segnale",
        tooltipQ: "Fattore di qualità dell'oscillatore (più alto = meno smorzamento, oscillazioni più lunghe)",
        tooltipLunar: "Frequenza della modulazione mareale (componente lunare M2). Range: 200 µHz a 0.1 Hz",
        tooltipSimSpeed: "Moltiplicatore di velocità per la simulazione. 1x = tempo reale, 1000x = 1000 volte più veloce. Range: 1x a 1000x",
        tooltipSpectrumCenter: "Frequenza centrale per visualizzazione spettro pendolo. Regola per ingrandire specifici range di frequenza",
        tooltipTidalSpectrumCenter: "Frequenza centrale per visualizzazione spettro mareale. Regola per esplorare diverse componenti mareali",
        tooltipLength: "Lunghezza fisica dell'asta del pendolo. Influenza la frequenza naturale: T = 2π√(L/g)",
        tooltipMass: "Massa del peso del pendolo. Influenza il momento d'inerzia e i calcoli dell'energia",
        tooltipEnergy: "Energia aggiunta al pendolo ogni volta che passa per lo zero (posizione verticale). Range: 1 nJ a 5 J. Simula una forza esterna di guida",
        
        // Buttons
        btnReset: "Riavvia Simulazione",
        btnPause: "Pausa",
        btnResume: "Riprendi",
        
        // Status
        statusTitle: "Stato del PLL",
        statusAcquiring: "Acquisizione...",
        statusLocked: "Agganciato",
        statusUnlocked: "Non Agganciato",
        
        // Graphs
        graphPhaseLabel: "Errore di Fase nel Tempo",
        graphFreqLabel: "Frequenza Agganciata del PLL",
        graphSpectrumLabel: "Spettro del Pendolo (0-3 Hz)",
        graphTidalSpectrumLabel: "Spettro Frequenze Mareali (20-25 µHz)",
        graphTidalPhaseLabel: "Fase Frequenze Mareali (20-25 µHz)",
        
        // Info Panel
        infoTitle: "Il Phase-Locked Loop e le Frequenze Mareali",
        infoContent: `
            <p>
                Un Phase-Locked Loop (PLL) è un sistema di controllo che genera un segnale di uscita la cui fase è correlata 
                alla fase di un segnale di ingresso. In questa simulazione, il pendolo rappresenta un oscillatore naturale la cui frequenza 
                è modulata da forze mareali, e il PLL traccia queste variazioni.
            </p>
            <h3>Come funziona:</h3>
            <ul>
                <li><strong>Rilevatore di Fase:</strong> Confronta la fase del pendolo con l'uscita del VCO, generando un segnale di errore di fase</li>
                <li><strong>Filtro di Loop (Controllore PI):</strong> Leviga e integra l'errore di fase per fornire un controllo stabile</li>
                <li><strong>VCO (Oscillatore Controllato in Tensione):</strong> Regola la sua frequenza in base all'errore filtrato, cercando di eguagliare la frequenza di ingresso</li>
            </ul>
            <h3>Componenti Mareali Principali:</h3>
            <p>
                Le maree oceaniche sono il risultato delle forze gravitazionali della Luna e del Sole. Le quattro componenti mareali principali sono:
            </p>
            <ul>
                <li><strong>M2 (22.344 µHz, 12.42h):</strong> Marea lunare semidiurna principale - la componente più forte, causata dalla Luna. Crea due alte maree al giorno.</li>
                <li><strong>S2 (23.148 µHz, 12.00h):</strong> Marea solare semidiurna principale - causata dal Sole, circa il 46% dell'ampiezza di M2.</li>
                <li><strong>K1 (11.607 µHz, 23.93h):</strong> Marea diurna lunisolre - effetto combinato Luna-Sole, un ciclo al giorno.</li>
                <li><strong>O1 (11.381 µHz, 25.82h):</strong> Marea diurna lunare - effetto lunare con un ciclo al giorno.</li>
            </ul>
            <p>
                Quando M2 e S2 sono in fase (luna piena/nuova), si hanno le <strong>maree sigiziali</strong> (le più alte). Quando sono in opposizione (quarti di luna), si hanno le <strong>maree di quadratura</strong> (le più basse).
            </p>
            <h3>Comprendere la Simulazione:</h3>
            <p>
                La frequenza naturale del pendolo è modulata da forze simil-mareali alle frequenze M2, S2 e K1. 
                Il PLL traccia le variazioni del periodo del pendolo, che vengono campionate ad ogni passaggio per lo zero (quando l'elettromagnete fornisce un impulso di energia).
                La FFT analizza queste deviazioni di periodo per estrarre le componenti di frequenza mareale e le loro fasi.
            </p>
            <p>
                Lo <strong>spettro</strong> mostra la potenza di ciascuna componente mareale, mentre la <strong>fase</strong> rivela le relazioni temporali tra di esse - 
                informazioni cruciali per comprendere le dinamiche delle maree e prevedere i tempi di alta/bassa marea.
            </p>
        `,
        
        // Footer
        footerText: "Simulazione educativa per comprendere i Phase-Locked Loop | Realizzata con p5.js"
    }
};

// Current language state
let currentLanguage = 'en';

// Initialize i18n system
function initI18n() {
    // Check browser language preference
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('it')) {
        currentLanguage = 'it';
    }
    
    // Apply initial translations
    applyTranslations();
    
    // Setup language toggle buttons
    setupLanguageToggle();
}

// Apply translations to all elements
function applyTranslations() {
    const t = translations[currentLanguage];
    
    // Update all text elements
    document.getElementById('main-title').textContent = t.mainTitle;
    document.getElementById('controls-title').textContent = t.controlsTitle;
    
    // Display-only labels (frequency and amplitude are calculated, not controlled)
    const freqDisplayLabel = document.getElementById('label-freq-display');
    if (freqDisplayLabel) {
        const labelText = freqDisplayLabel.childNodes[0];
        if (labelText) labelText.textContent = t.labelFreqDisplay + ' ';
        const infoIcon = freqDisplayLabel.querySelector('.info-icon');
        if (infoIcon) infoIcon.title = t.tooltipFreqDisplay;
    }
    
    const ampDisplayLabel = document.getElementById('label-amplitude-display');
    if (ampDisplayLabel) {
        const labelText = ampDisplayLabel.childNodes[0];
        if (labelText) labelText.textContent = t.labelAmplitudeDisplay + ' ';
        const infoIcon = ampDisplayLabel.querySelector('.info-icon');
        if (infoIcon) infoIcon.title = t.tooltipAmplitudeDisplay;
    }
    
    // Control labels
    updateLabelText('label-gain', t.labelGain, t.tooltipGain);
    updateLabelText('label-q', t.labelQ, t.tooltipQ);
    updateLabelText('label-lunar', t.labelLunar, t.tooltipLunar);
    updateLabelText('label-sim-speed', t.labelSimSpeed, t.tooltipSimSpeed);
    updateLabelText('label-spectrum-center', t.labelSpectrumCenter, t.tooltipSpectrumCenter);
    updateLabelText('label-tidal-spectrum-center', t.labelTidalSpectrumCenter, t.tooltipTidalSpectrumCenter);
    updateLabelText('label-length', t.labelLength, t.tooltipLength);
    updateLabelText('label-mass', t.labelMass, t.tooltipMass);
    updateLabelText('label-energy', t.labelEnergy, t.tooltipEnergy);
    
    // Buttons
    document.getElementById('btn-reset').textContent = t.btnReset;
    updatePauseButton();
    
    // Status
    document.getElementById('status-title').textContent = t.statusTitle;
    
    // Graphs
    document.getElementById('graph-phase-label').textContent = t.graphPhaseLabel;
    document.getElementById('graph-freq-label').textContent = t.graphFreqLabel;
    document.getElementById('graph-spectrum-label').textContent = t.graphSpectrumLabel;
    document.getElementById('graph-tidal-spectrum-label').textContent = t.graphTidalSpectrumLabel;
    document.getElementById('graph-tidal-phase-label').textContent = t.graphTidalPhaseLabel;
    
    // Info panel
    document.getElementById('info-title').textContent = t.infoTitle;
    document.getElementById('info-content').innerHTML = t.infoContent;
    
    // Footer
    document.getElementById('footer-text').textContent = t.footerText;
    
    // Update language button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${currentLanguage}`).classList.add('active');
}

// Helper function to update label with tooltip
function updateLabelText(elementId, text, tooltip) {
    const label = document.getElementById(elementId);
    const infoIcon = label.querySelector('.info-icon');
    label.childNodes[0].textContent = text + ' ';
    if (infoIcon) {
        infoIcon.title = tooltip;
    }
}

// Setup language toggle buttons
function setupLanguageToggle() {
    document.getElementById('lang-en').addEventListener('click', () => {
        currentLanguage = 'en';
        applyTranslations();
    });
    
    document.getElementById('lang-it').addEventListener('click', () => {
        currentLanguage = 'it';
        applyTranslations();
    });
}

// Get translation for a key
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Update pause button text based on state
function updatePauseButton() {
    const pauseBtn = document.getElementById('btn-pause');
    if (window.simulationPaused) {
        pauseBtn.textContent = t('btnResume');
    } else {
        pauseBtn.textContent = t('btnPause');
    }
}

// Update lock status text
function updateLockStatus(isLocked) {
    const statusLabel = document.getElementById('lock-status');
    const lockLed = document.getElementById('lock-led');
    
    if (isLocked) {
        statusLabel.textContent = t('statusLocked');
        lockLed.classList.add('locked');
    } else {
        statusLabel.textContent = t('statusAcquiring');
        lockLed.classList.remove('locked');
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}

