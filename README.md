# 🌊 PLL Pendulum Simulator / Simulatore di Pendolo PLL

[🇬🇧 English](#english) | [🇮🇹 Italiano](#italiano)

---

## English

### Overview

An interactive educational web application that demonstrates how Phase-Locked Loops (PLLs) work by simulating a pendulum as a natural oscillator. The simulation shows how PLLs can track and measure frequencies, with applications to tidal frequency analysis.

**Live Demo:** [Your GitHub Pages URL will go here]

### Features

- **Real-time Pendulum Simulation**: Physics-based pendulum with adjustable parameters
- **Phase-Locked Loop Implementation**: Complete PLL with phase detector, loop filter, and VCO
- **Interactive Controls**: Real-time parameter adjustment via sliders
- **Live Graphs**: Phase error and frequency tracking visualization
- **Bilingual Interface**: Switch between English and Italian
- **Educational Content**: Detailed explanations of PLL theory and tidal applications

### What is a Phase-Locked Loop?

A Phase-Locked Loop (PLL) is a control system that generates an output signal whose phase is locked to the phase of an input signal. It consists of three main components:

1. **Phase Detector**: Compares the input signal phase with the VCO output phase
2. **Loop Filter**: Smooths the phase error signal (typically a low-pass filter)
3. **VCO (Voltage Controlled Oscillator)**: Generates an output whose frequency is controlled by the filtered error signal

### Application to Tidal Analysis

Tidal measurements contain multiple frequency components corresponding to astronomical forcing:

- **M2** (Principal lunar semidiurnal): Period ~12.42 hours
- **S2** (Principal solar semidiurnal): Period ~12.00 hours
- **K1** (Lunisolar diurnal): Period ~23.93 hours
- **O1** (Lunar diurnal): Period ~25.82 hours

PLLs can lock onto these specific frequencies even in the presence of noise, making them valuable for:
- Real-time tidal frequency extraction
- Harmonic analysis of sea level data
- Prediction of tidal components
- Quality control of tidal gauge measurements

### How to Use

1. **Adjust Pendulum Parameters**:
   - **Frequency**: Natural oscillation frequency (cycles per day)
   - **Amplitude**: Maximum swing angle
   - **Damping**: Energy dissipation rate

2. **Configure PLL**:
   - **Loop Gain**: Controls how quickly the PLL locks (higher = faster but less stable)
   - **VCO Initial Frequency**: Starting frequency of the PLL's oscillator

3. **Observe the Simulation**:
   - **Blue pendulum**: Physical system (simulated tidal signal)
   - **Red reference**: PLL's VCO output attempting to track the pendulum
   - **Phase Error Graph**: Shows how well the PLL is tracking (should approach zero when locked)
   - **Frequency Graph**: Shows the VCO frequency converging to the pendulum frequency

4. **Experiment**:
   - Try different loop gains to see the stability/speed tradeoff
   - Start with a large frequency mismatch and watch the PLL acquire lock
   - Add damping to see how it affects the pendulum behavior

### Technical Implementation

- **Frontend**: Pure JavaScript with p5.js for visualization
- **PLL Algorithm**: Type-2 loop with proportional-integral (PI) filter
- **Physics**: Nonlinear pendulum equation with damping
- **Graphs**: HTML5 Canvas for real-time plotting

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/PendoloPLL.git

# Navigate to the directory
cd PendoloPLL

# Open in browser (no build step required)
# Simply open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

### Project Structure

```
PendoloPLL/
├── index.html          # Main HTML structure
├── style.css           # Styling and layout
├── sketch.js           # p5.js simulation (pendulum animation)
├── pll.js              # PLL implementation
├── ui.js               # UI controls and graph rendering
├── i18n.js             # Internationalization (EN/IT)
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

### Educational Resources

#### Recommended Reading

- **PLLs**: "Phase-Locked Loops: Design, Simulation, and Applications" by Roland E. Best
- **Tidal Analysis**: "Tidal Analysis and Prediction" by NOAA
- **Signal Processing**: "Understanding Digital Signal Processing" by Richard G. Lyons

#### Key Concepts

- **Lock Acquisition**: Process by which PLL achieves phase lock
- **Pull-in Range**: Frequency range over which PLL can acquire lock
- **Hold-in Range**: Frequency range over which PLL maintains lock
- **Loop Bandwidth**: Determines tracking speed and noise rejection

### Contributing

Contributions are welcome! This is an educational project. Feel free to:
- Suggest improvements to the physics model
- Add more visualizations
- Improve the educational content
- Add support for more languages
- Report bugs or issues

### License

This project is released under the MIT License. Feel free to use it for educational purposes.

### Credits

- Built with [p5.js](https://p5js.org/)
- Inspired by oceanographic instrumentation and tidal analysis techniques
- Educational content based on control systems theory and signal processing

---

## Italiano

### Panoramica

Un'applicazione web educativa interattiva che dimostra come funzionano i Phase-Locked Loop (PLL) simulando un pendolo come oscillatore naturale. La simulazione mostra come i PLL possono tracciare e misurare frequenze, con applicazioni all'analisi delle frequenze mareali.

**Demo dal vivo:** [Il tuo URL GitHub Pages andrà qui]

### Caratteristiche

- **Simulazione del Pendolo in Tempo Reale**: Pendolo basato su fisica con parametri regolabili
- **Implementazione del Phase-Locked Loop**: PLL completo con rilevatore di fase, filtro di loop e VCO
- **Controlli Interattivi**: Regolazione dei parametri in tempo reale tramite slider
- **Grafici in Tempo Reale**: Visualizzazione dell'errore di fase e del tracciamento della frequenza
- **Interfaccia Bilingue**: Passa tra inglese e italiano
- **Contenuti Educativi**: Spiegazioni dettagliate della teoria PLL e applicazioni mareali

### Cos'è un Phase-Locked Loop?

Un Phase-Locked Loop (PLL) è un sistema di controllo che genera un segnale di uscita la cui fase è agganciata alla fase di un segnale di ingresso. È composto da tre componenti principali:

1. **Rilevatore di Fase**: Confronta la fase del segnale di ingresso con la fase di uscita del VCO
2. **Filtro di Loop**: Leviga il segnale di errore di fase (tipicamente un filtro passa-basso)
3. **VCO (Oscillatore Controllato in Tensione)**: Genera un'uscita la cui frequenza è controllata dal segnale di errore filtrato

### Applicazione all'Analisi Mareale

Le misurazioni delle maree contengono molteplici componenti di frequenza corrispondenti alle forzanti astronomiche:

- **M2** (Marea lunare semidiurna principale): Periodo ~12.42 ore
- **S2** (Marea solare semidiurna principale): Periodo ~12.00 ore
- **K1** (Marea diurna lunisolaire): Periodo ~23.93 ore
- **O1** (Marea lunare diurna): Periodo ~25.82 ore

I PLL possono agganciarsi a queste frequenze specifiche anche in presenza di rumore, rendendoli preziosi per:
- Estrazione in tempo reale delle frequenze di marea
- Analisi armonica dei dati del livello del mare
- Previsione delle componenti di marea
- Controllo qualità delle misurazioni dei mareografi

### Come Usare l'Applicazione

1. **Regola i Parametri del Pendolo**:
   - **Frequenza**: Frequenza di oscillazione naturale (cicli per giorno)
   - **Ampiezza**: Angolo massimo di oscillazione
   - **Smorzamento**: Tasso di dissipazione dell'energia

2. **Configura il PLL**:
   - **Guadagno del Loop**: Controlla la velocità di aggancio del PLL (più alto = più veloce ma meno stabile)
   - **Frequenza Iniziale VCO**: Frequenza di partenza dell'oscillatore del PLL

3. **Osserva la Simulazione**:
   - **Pendolo blu**: Sistema fisico (segnale di marea simulato)
   - **Riferimento rosso**: Uscita del VCO del PLL che tenta di tracciare il pendolo
   - **Grafico Errore di Fase**: Mostra quanto bene il PLL sta tracciando (dovrebbe avvicinarsi a zero quando agganciato)
   - **Grafico Frequenza**: Mostra la frequenza del VCO che converge verso la frequenza del pendolo

4. **Sperimenta**:
   - Prova diversi guadagni di loop per vedere il compromesso stabilità/velocità
   - Inizia con una grande discrepanza di frequenza e osserva il PLL acquisire l'aggancio
   - Aggiungi smorzamento per vedere come influisce sul comportamento del pendolo

### Implementazione Tecnica

- **Frontend**: JavaScript puro con p5.js per la visualizzazione
- **Algoritmo PLL**: Loop di tipo 2 con filtro proporzionale-integrale (PI)
- **Fisica**: Equazione del pendolo non lineare con smorzamento
- **Grafici**: Canvas HTML5 per il plotting in tempo reale

### Sviluppo Locale

```bash
# Clona il repository
git clone https://github.com/tuousername/PendoloPLL.git

# Naviga nella directory
cd PendoloPLL

# Apri nel browser (non richiede build)
# Semplicemente apri index.html nel tuo browser
# Oppure usa un server locale:
python -m http.server 8000
# Poi visita http://localhost:8000
```

### Struttura del Progetto

```
PendoloPLL/
├── index.html          # Struttura HTML principale
├── style.css           # Stili e layout
├── sketch.js           # Simulazione p5.js (animazione pendolo)
├── pll.js              # Implementazione PLL
├── ui.js               # Controlli UI e rendering grafici
├── i18n.js             # Internazionalizzazione (EN/IT)
├── README.md           # Questo file
└── .gitignore          # Regole Git ignore
```

### Risorse Educative

#### Letture Consigliate

- **PLL**: "Phase-Locked Loops: Design, Simulation, and Applications" di Roland E. Best
- **Analisi Mareale**: "Tidal Analysis and Prediction" di NOAA
- **Elaborazione dei Segnali**: "Understanding Digital Signal Processing" di Richard G. Lyons

#### Concetti Chiave

- **Acquisizione dell'Aggancio**: Processo con cui il PLL raggiunge l'aggancio di fase
- **Pull-in Range**: Intervallo di frequenza in cui il PLL può acquisire l'aggancio
- **Hold-in Range**: Intervallo di frequenza in cui il PLL mantiene l'aggancio
- **Banda del Loop**: Determina la velocità di tracciamento e la reiezione del rumore

### Contribuire

I contributi sono benvenuti! Questo è un progetto educativo. Sentiti libero di:
- Suggerire miglioramenti al modello fisico
- Aggiungere più visualizzazioni
- Migliorare il contenuto educativo
- Aggiungere supporto per più lingue
- Segnalare bug o problemi

### Licenza

Questo progetto è rilasciato sotto la Licenza MIT. Sentiti libero di usarlo per scopi educativi.

### Crediti

- Realizzato con [p5.js](https://p5js.org/)
- Ispirato dalla strumentazione oceanografica e dalle tecniche di analisi mareale
- Contenuti educativi basati sulla teoria dei sistemi di controllo e l'elaborazione dei segnali

---

## Screenshots / Schermate

![Simulation View](docs/images/simulation.png)
*The main simulation showing the pendulum (blue) and PLL reference (red)*

![Graphs](docs/images/graphs.png)
*Real-time phase error and frequency tracking graphs*

---

### Quick Start / Avvio Rapido

1. Clone this repository / Clona questo repository
2. Open `index.html` in a modern web browser / Apri `index.html` in un browser moderno
3. Adjust parameters and observe the PLL in action / Regola i parametri e osserva il PLL in azione

### Publishing to GitHub Pages / Pubblicazione su GitHub Pages

1. Create a new repository on GitHub / Crea un nuovo repository su GitHub
2. Push this code to your repository / Carica questo codice nel tuo repository
3. Go to repository Settings > Pages / Vai su Impostazioni repository > Pages
4. Select "Deploy from branch" and choose "main" branch, "/" (root) / Seleziona "Deploy from branch" e scegli il branch "main", "/" (root)
5. Save and wait for deployment / Salva e attendi il deployment
6. Your site will be live at `https://yourusername.github.io/PendoloPLL/`

---

**Made with ❤️ for education and science**

