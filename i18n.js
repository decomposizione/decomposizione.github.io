// Internationalization system for IT/EN support

const translations = {
    en: {
        // Header
        mainTitle: "Phase-Locked Loop Pendulum Simulator",
        
        // Controls
        controlsTitle: "Controls",
        labelFreq: "Pendulum Frequency (cycles/day)",
        labelAmplitude: "Amplitude (degrees)",
        labelGain: "PLL Loop Gain",
        labelDamping: "Damping Factor",
        labelVco: "VCO Initial Frequency",
        
        // Tooltips
        tooltipFreq: "Natural frequency of the pendulum",
        tooltipAmplitude: "Maximum swing angle",
        tooltipGain: "How fast the PLL locks to the signal",
        tooltipDamping: "Energy dissipation rate",
        tooltipVco: "Starting frequency of the Voltage Controlled Oscillator",
        
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
        
        // Info Panel
        infoTitle: "About Phase-Locked Loops and Tidal Frequencies",
        infoContent: `
            <p>
                A Phase-Locked Loop (PLL) is a control system that generates an output signal whose phase is related to the phase of an input signal. 
                In this simulation, the pendulum represents a natural oscillator (like tidal forces), and the PLL attempts to lock onto its frequency.
            </p>
            <h3>How it works:</h3>
            <ul>
                <li><strong>Phase Detector:</strong> Compares the pendulum's phase with the VCO output</li>
                <li><strong>Loop Filter:</strong> Smooths the phase error signal</li>
                <li><strong>VCO (Voltage Controlled Oscillator):</strong> Adjusts its frequency based on the filtered error</li>
            </ul>
            <h3>Application to Tidal Analysis:</h3>
            <p>
                Tidal frequencies are extremely stable and can be measured using PLL techniques. The main tidal constituents 
                (M2, S2, K1, O1) have known periods, and PLLs can extract these specific frequency components from noisy tidal gauge data.
                The semidiurnal lunar tide (M2) has a period of approximately 12.42 hours, making it ideal for PLL-based analysis.
            </p>
            <h3>Understanding the Simulation:</h3>
            <p>
                The pendulum oscillates at a frequency analogous to tidal cycles (scaled to cycles per day for visualization).
                The PLL attempts to track this frequency, demonstrating how real-time frequency measurement systems work.
                When the PLL is "locked," the phase error stabilizes near zero, and the VCO frequency matches the pendulum frequency.
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
        labelFreq: "Frequenza del Pendolo (cicli/giorno)",
        labelAmplitude: "Ampiezza (gradi)",
        labelGain: "Guadagno del Loop PLL",
        labelDamping: "Fattore di Smorzamento",
        labelVco: "Frequenza Iniziale VCO",
        
        // Tooltips
        tooltipFreq: "Frequenza naturale del pendolo",
        tooltipAmplitude: "Angolo massimo di oscillazione",
        tooltipGain: "Velocità con cui il PLL si aggancia al segnale",
        tooltipDamping: "Tasso di dissipazione dell'energia",
        tooltipVco: "Frequenza di partenza dell'Oscillatore Controllato in Tensione",
        
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
        
        // Info Panel
        infoTitle: "Il Phase-Locked Loop e le Frequenze Mareali",
        infoContent: `
            <p>
                Un Phase-Locked Loop (PLL) è un sistema di controllo che genera un segnale di uscita la cui fase è correlata 
                alla fase di un segnale di ingresso. In questa simulazione, il pendolo rappresenta un oscillatore naturale 
                (come le forze mareali), e il PLL cerca di agganciarsi alla sua frequenza.
            </p>
            <h3>Come funziona:</h3>
            <ul>
                <li><strong>Rilevatore di Fase:</strong> Confronta la fase del pendolo con l'uscita del VCO</li>
                <li><strong>Filtro di Loop:</strong> Leviga il segnale di errore di fase</li>
                <li><strong>VCO (Oscillatore Controllato in Tensione):</strong> Regola la sua frequenza in base all'errore filtrato</li>
            </ul>
            <h3>Applicazione all'Analisi Mareale:</h3>
            <p>
                Le frequenze mareali sono estremamente stabili e possono essere misurate usando tecniche PLL. Le principali 
                componenti mareali (M2, S2, K1, O1) hanno periodi noti, e i PLL possono estrarre queste specifiche componenti 
                di frequenza dai dati rumorosi dei mareografi. La marea lunare semidiurna (M2) ha un periodo di circa 12.42 ore, 
                rendendola ideale per l'analisi basata su PLL.
            </p>
            <h3>Comprendere la Simulazione:</h3>
            <p>
                Il pendolo oscilla a una frequenza analoga ai cicli di marea (scalata in cicli per giorno per la visualizzazione).
                Il PLL tenta di tracciare questa frequenza, dimostrando come funzionano i sistemi di misurazione della frequenza in tempo reale.
                Quando il PLL è "agganciato", l'errore di fase si stabilizza vicino allo zero, e la frequenza del VCO corrisponde 
                alla frequenza del pendolo.
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
    
    // Labels
    updateLabelText('label-freq', t.labelFreq, t.tooltipFreq);
    updateLabelText('label-amplitude', t.labelAmplitude, t.tooltipAmplitude);
    updateLabelText('label-gain', t.labelGain, t.tooltipGain);
    updateLabelText('label-damping', t.labelDamping, t.tooltipDamping);
    updateLabelText('label-vco', t.labelVco, t.tooltipVco);
    
    // Buttons
    document.getElementById('btn-reset').textContent = t.btnReset;
    updatePauseButton();
    
    // Status
    document.getElementById('status-title').textContent = t.statusTitle;
    
    // Graphs
    document.getElementById('graph-phase-label').textContent = t.graphPhaseLabel;
    document.getElementById('graph-freq-label').textContent = t.graphFreqLabel;
    
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

