/**
 * 원소와 주기율표 마스터 - Application Logic
 */

// ==========================================================================
// CONSTANTS & DATA POOLS
// ==========================================================================

const ELEMENT_POOL = [
    { number: 1, symbol: 'H', name: '수소', group: 1, period: 1 },
    { number: 2, symbol: 'He', name: '헬륨', group: 18, period: 1 },
    { number: 3, symbol: 'Li', name: '리튬', group: 1, period: 2 },
    { number: 4, symbol: 'Be', name: '베릴륨', group: 2, period: 2 },
    { number: 5, symbol: 'B', name: '붕소', group: 13, period: 2 },
    { number: 6, symbol: 'C', name: '탄소', group: 14, period: 2 },
    { number: 7, symbol: 'N', name: '질소', group: 15, period: 2 },
    { number: 8, symbol: 'O', name: '산소', group: 16, period: 2 },
    { number: 9, symbol: 'F', name: '플루오린', group: 17, period: 2 },
    { number: 10, symbol: 'Ne', name: '네온', group: 18, period: 2 },
    { number: 11, symbol: 'Na', name: '나트륨', group: 1, period: 3 },
    { number: 12, symbol: 'Mg', name: '마그네슘', group: 2, period: 3 },
    { number: 13, symbol: 'Al', name: '알루미늄', group: 13, period: 3 },
    { number: 14, symbol: 'Si', name: '규소', group: 14, period: 3 },
    { number: 15, symbol: 'P', name: '인', group: 15, period: 3 },
    { number: 16, symbol: 'S', name: '황', group: 16, period: 3 },
    { number: 17, symbol: 'Cl', name: '염소', group: 17, period: 3 },
    { number: 18, symbol: 'Ar', name: '아르곤', group: 18, period: 3 },
    { number: 19, symbol: 'K', name: '칼륨', group: 1, period: 4 },
    { number: 20, symbol: 'Ca', name: '칼슘', group: 2, period: 4 }
];

// 교사 모드 비밀번호 설정 (원하는 비밀번호로 자유롭게 변경하세요)
const TEACHER_PASSWORD = 'science2026';

const STAGE_1_ELEMENT_SELECTIONS = ['H', 'C', 'O', 'N', 'Na', 'Cl', 'Mg', 'He'];

const STAGE_3_MOLECULES = [
    { 
        name: '물', 
        formula: 'H2O', 
        formulaHtml: 'H<sub>2</sub>O', 
        desc: '수소 원자 2개와 산소 원자 1개가 결합한 분자', 
        atoms: { H: 2, O: 1 } 
    },
    { 
        name: '이산화 탄소', 
        formula: 'CO2', 
        formulaHtml: 'CO<sub>2</sub>', 
        desc: '탄소 원자 1개와 산소 원자 2개가 결합한 분자', 
        atoms: { C: 1, O: 2 } 
    },
    { 
        name: '암모니아', 
        formula: 'NH3', 
        formulaHtml: 'NH<sub>3</sub>', 
        desc: '질소 원자 1개와 수소 원자 3개가 결합한 분자', 
        atoms: { N: 1, H: 3 } 
    }
];

const ATOM_INFO = {
    H: { name: '수소', class: 'atom-H' },
    O: { name: '산소', class: 'atom-O' },
    C: { name: '탄소', class: 'atom-C' },
    N: { name: '질소', class: 'atom-N' },
    Cl: { name: '염소', class: 'atom-Cl' }
};

// ==========================================================================
// SOUND SYNTHESIZER (WEB AUDIO API)
// ==========================================================================

const SoundEffect = {
    ctx: null,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playCorrect() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // 1st note (C5)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);

        // 2nd note (E5)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(0.15, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.25);
    },

    playIncorrect() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.3);
    },

    playSuccess() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.1;
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.15, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.3);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(noteStart);
            osc.stop(noteStart + 0.3);
        });
    },

    playGameOver() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Final triumphant sound arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.08;
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteStart);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.15, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.5);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(noteStart);
            osc.stop(noteStart + 0.5);
        });
    }
};

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================

let state = {
    class: '',
    number: 0,
    name: '',
    score: 0,
    currentStage: 1,
    timeLeft: 60,
    timerInterval: null,
    
    stageScores: {
        stage1: 0,
        stage2: 0,
        stage3: 0,
        bonus: 0
    },

    // Stage 1: Card Grid Matching
    s1Cards: [],
    s1Selected: [],
    s1Matches: 0,

    // Stage 2: Periodic Table Puzzle
    s2TargetBlanks: [], // 6 elements to be placed
    s2CorrectCount: 0,
    s2SelectedElement: null, // item chosen from bottom dock

    // Stage 3: Molecule Builder
    s3Index: 0,
    s3Atoms: [] // Atoms currently in workspace
};

// ==========================================================================
// APP INITIALIZATION & NAVIGATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Events
    document.getElementById('start-form').addEventListener('submit', startGame);
    document.getElementById('btn-view-rankings').addEventListener('click', () => showScreen('screen-rankings'));
    document.getElementById('btn-back-home').addEventListener('click', backToHome);

    // Ranking Tabs
    document.getElementById('tab-grade-rank').addEventListener('click', toggleRankingTab);
    document.getElementById('tab-class-rank').addEventListener('click', toggleRankingTab);
    document.getElementById('rank-class-select').addEventListener('change', renderRankings);

    // Stage 3 Events
    document.getElementById('btn-clear-workspace').addEventListener('click', clearMoleculeWorkspace);
    document.getElementById('btn-submit-molecule').addEventListener('click', submitMolecule);

    // Admin Panel Events
    document.getElementById('btn-admin-trigger').addEventListener('click', openAdminModal);
    document.getElementById('btn-close-admin-modal').addEventListener('click', closeAdminModal);
    document.getElementById('btn-auth-submit').addEventListener('click', submitAdminPassword);
    document.getElementById('btn-export-csv').addEventListener('click', exportToCSV);
    document.getElementById('btn-gen-demo').addEventListener('click', generateDemoData);
    document.getElementById('btn-reset-rankings').addEventListener('click', resetAllRankingsData);

    // Load initial ranking preview
    renderRankings();
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function backToHome() {
    stopTimer();
    document.getElementById('play-result-banner').classList.add('d-none');
    showScreen('screen-home');
}

// ==========================================================================
// TIMER FUNCTIONS
// ==========================================================================

function startTimer(duration, onTimeOut) {
    stopTimer();
    state.timeLeft = duration;
    updateTimerDisplay(duration);
    
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = 'var(--color-primary)';

    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay(state.timeLeft);
        
        // Update bar width
        const percentage = (state.timeLeft / duration) * 100;
        timerBar.style.width = `${percentage}%`;

        // Warning state
        if (state.timeLeft <= 10) {
            timerBar.style.backgroundColor = 'var(--color-danger)';
        }

        if (state.timeLeft <= 0) {
            stopTimer();
            onTimeOut();
        }
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function updateTimerDisplay(seconds) {
    document.getElementById('display-time').textContent = `${seconds}초`;
}

// ==========================================================================
// GAME PLAY ENTRY
// ==========================================================================

function startGame(e) {
    e.preventDefault();
    
    const code = document.getElementById('student-code').value.trim();

    if (!/^[0-9]{4}$/.test(code)) {
        alert('학번을 숫자 4자리로 입력해주세요 (예: 0315 -> 3반 15번).');
        return;
    }

    const parsedClass = String(parseInt(code.substring(0, 2)));
    const parsedNumber = parseInt(code.substring(2, 4));

    if (parseInt(parsedClass) === 0 || parsedNumber === 0) {
        alert('학급(반)과 번호는 01보다 큰 숫자여야 합니다.');
        return;
    }

    // Reset State
    state.class = parsedClass;
    state.number = parsedNumber;
    state.name = '';
    state.score = 0;
    state.stageScores = { stage1: 0, stage2: 0, stage3: 0, bonus: 0 };
    state.currentStage = 1;

    // Display info
    document.getElementById('display-student-info').textContent = `2학년 ${state.class}반 ${state.number}번`;
    document.getElementById('display-score').textContent = '0000';

    // UI stage panels
    document.getElementById('stage-1-container').classList.remove('d-none');
    document.getElementById('stage-2-container').classList.add('d-none');
    document.getElementById('stage-3-container').classList.add('d-none');

    // Show game board
    showScreen('screen-game');
    
    // Start Stage 1
    initStage1();
}

// ==========================================================================
// STAGE 1: CARD GRID MATCHING
// ==========================================================================

function initStage1() {
    state.currentStage = 1;
    document.getElementById('display-stage-title').textContent = 'STAGE 1: 원소 기호 매칭';
    state.s1Matches = 0;
    state.s1Selected = [];
    
    const cardGrid = document.getElementById('card-grid');
    cardGrid.innerHTML = '';

    // Collect 8 elements from pool
    const selectedElements = ELEMENT_POOL.filter(el => STAGE_1_ELEMENT_SELECTIONS.includes(el.symbol));

    // Create Name cards and Symbol cards
    let deck = [];
    selectedElements.forEach(el => {
        deck.push({ id: `name-${el.symbol}`, type: 'name', symbol: el.symbol, text: el.name });
        deck.push({ id: `sym-${el.symbol}`, type: 'symbol', symbol: el.symbol, text: el.symbol });
    });

    // Shuffle deck
    deck.sort(() => Math.random() - 0.5);
    state.s1Cards = deck;

    // Render Cards
    deck.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'game-card';
        cardElement.dataset.id = card.id;
        cardElement.dataset.symbol = card.symbol;
        cardElement.dataset.type = card.type;

        cardElement.innerHTML = `
            <div class="card-face card-back">?</div>
            <div class="card-face card-front ${card.type}-card">${card.text}</div>
        `;

        cardElement.addEventListener('click', () => onCardClicked(cardElement));
        cardGrid.appendChild(cardElement);
    });

    // 60 seconds timer
    startTimer(60, () => {
        SoundEffect.playIncorrect();
        alert('시간이 초과되었습니다! 다음 단계로 넘어갑니다.');
        state.stageScores.stage1 = state.s1Matches * 50; // 50pts per match
        goToStage2();
    });
}

function onCardClicked(cardEl) {
    // Prevent clicking matched, already flipped, or selecting more than 2
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched') || state.s1Selected.length >= 2) {
        return;
    }

    cardEl.classList.add('flipped');
    state.s1Selected.push(cardEl);

    if (state.s1Selected.length === 2) {
        const [card1, card2] = state.s1Selected;
        const sym1 = card1.dataset.symbol;
        const sym2 = card2.dataset.symbol;
        const type1 = card1.dataset.type;
        const type2 = card2.dataset.type;

        if (sym1 === sym2 && type1 !== type2) {
            // Match success!
            setTimeout(() => {
                SoundEffect.playCorrect();
                card1.classList.add('matched');
                card2.classList.add('matched');
                state.s1Matches++;
                
                // Add points: 100 points per match
                addScore(100);

                state.s1Selected = [];

                if (state.s1Matches === 8) {
                    stopTimer();
                    SoundEffect.playSuccess();
                    state.stageScores.stage1 = 800 + state.timeLeft * 10; // Extra speed points
                    addScore(state.timeLeft * 10);
                    alert(`1단계 클리어! 보너스 점수 ${state.timeLeft * 10}점 획득!`);
                    goToStage2();
                }
            }, 300);
        } else {
            // Match failed
            setTimeout(() => {
                SoundEffect.playIncorrect();
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                state.s1Selected = [];
            }, 1000);
        }
    }
}

function addScore(points) {
    state.score = Math.max(0, state.score + points);
    document.getElementById('display-score').textContent = String(state.score).padStart(4, '0');
}

// ==========================================================================
// STAGE 2: PERIODIC TABLE PUZZLE
// ==========================================================================

function goToStage2() {
    stopTimer();
    state.currentStage = 2;
    document.getElementById('display-stage-title').textContent = 'STAGE 2: 주기율표 완성하기';
    
    document.getElementById('stage-1-container').classList.add('d-none');
    document.getElementById('stage-2-container').classList.remove('d-none');

    initStage2();
}

function initStage2() {
    state.s2CorrectCount = 0;
    state.s2SelectedElement = null;

    // Pick 6 random elements as targets for blank spots
    // Shuffle the elements, pick first 6
    const shuffledElements = [...ELEMENT_POOL].sort(() => Math.random() - 0.5);
    state.s2TargetBlanks = shuffledElements.slice(0, 6);

    // Build periodic table grid template
    // Periods 1 to 4, Groups 1 to 18
    const gridContainer = document.getElementById('periodic-table-grid');
    gridContainer.innerHTML = '';

    for (let p = 1; p <= 4; p++) {
        for (let g = 1; g <= 18; g++) {
            const cell = document.createElement('div');
            
            // Check if there is an element at (group, period)
            const element = ELEMENT_POOL.find(el => el.group === g && el.period === p);
            
            if (element) {
                // If it is in the target blanks
                const isTargetBlank = state.s2TargetBlanks.some(blank => blank.number === element.number);
                
                if (isTargetBlank) {
                    cell.className = 'pt-cell drop-zone';
                    cell.dataset.number = element.number;
                    cell.dataset.symbol = element.symbol;
                    cell.innerHTML = `
                        <span class="atomic-number">${element.number}</span>
                        <span class="element-symbol">?</span>
                        <span class="element-name">빈칸</span>
                    `;
                    cell.addEventListener('click', () => handleDropZoneClick(cell));
                } else {
                    cell.className = 'pt-cell filled';
                    cell.innerHTML = `
                        <span class="atomic-number">${element.number}</span>
                        <span class="element-symbol">${element.symbol}</span>
                        <span class="element-name">${element.name}</span>
                    `;
                }
            } else {
                cell.className = 'pt-cell empty';
            }
            gridContainer.appendChild(cell);
        }
    }

    // Populate bottom element dock
    const dockContainer = document.getElementById('element-dock');
    dockContainer.innerHTML = '';

    // Shuffle the target blanks to list in dock
    const dockItems = [...state.s2TargetBlanks].sort(() => Math.random() - 0.5);
    
    dockItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'dock-item';
        itemEl.dataset.number = item.number;
        itemEl.dataset.symbol = item.symbol;
        itemEl.innerHTML = `<span class="symbol">${item.symbol}</span><span class="name">${item.name}</span>`;
        
        itemEl.addEventListener('click', () => {
            // Toggle selection
            document.querySelectorAll('.dock-item').forEach(el => el.classList.remove('selected'));
            
            if (state.s2SelectedElement === itemEl) {
                state.s2SelectedElement = null;
            } else {
                state.s2SelectedElement = itemEl;
                itemEl.classList.add('selected');
                
                // Highlight corresponding drop zones
                document.querySelectorAll('.pt-cell.drop-zone').forEach(zone => {
                    if (!zone.classList.contains('correct')) {
                        zone.classList.add('active-zone');
                    }
                });
            }
        });
        
        dockContainer.appendChild(itemEl);
    });

    // 80 seconds timer
    startTimer(80, () => {
        SoundEffect.playIncorrect();
        alert('시간이 초과되었습니다! 다음 단계로 넘어갑니다.');
        state.stageScores.stage2 = state.s2CorrectCount * 100;
        goToStage3();
    });
}

function handleDropZoneClick(zoneEl) {
    if (!state.s2SelectedElement) {
        alert('먼저 아래 원소 목록에서 배치할 원소를 선택하세요!');
        return;
    }

    const selectedNum = parseInt(state.s2SelectedElement.dataset.number);
    const zoneNum = parseInt(zoneEl.dataset.number);

    // Remove zone highlight
    document.querySelectorAll('.pt-cell.drop-zone').forEach(zone => {
        zone.classList.remove('active-zone');
    });

    if (selectedNum === zoneNum) {
        // Correct placement
        SoundEffect.playCorrect();
        zoneEl.classList.remove('active-zone');
        zoneEl.classList.add('correct');
        
        // Reveal inside cell
        const elInfo = ELEMENT_POOL.find(el => el.number === selectedNum);
        zoneEl.querySelector('.element-symbol').textContent = elInfo.symbol;
        zoneEl.querySelector('.element-name').textContent = elInfo.name;

        // Hide element in dock
        state.s2SelectedElement.remove();
        state.s2SelectedElement = null;
        state.s2CorrectCount++;
        
        addScore(150); // 150pts for correct placing

        if (state.s2CorrectCount === 6) {
            stopTimer();
            SoundEffect.playSuccess();
            state.stageScores.stage2 = 900 + state.timeLeft * 10;
            addScore(state.timeLeft * 10);
            alert(`2단계 완성! 보너스 점수 ${state.timeLeft * 10}점 획득!`);
            goToStage3();
        }
    } else {
        // Incorrect placement
        SoundEffect.playIncorrect();
        zoneEl.style.animation = 'none';
        zoneEl.offsetHeight; /* trigger reflow */
        zoneEl.style.animation = 'shake 0.3s ease-in-out';
        
        // Remove selection
        state.s2SelectedElement.classList.remove('selected');
        state.s2SelectedElement = null;
        
        // Subtract score penalty
        addScore(-30);
    }
}

// Add shake animation style dynamically if not covered in style
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
}
`;
document.head.appendChild(styleSheet);

// ==========================================================================
// STAGE 3: MOLECULE BUILDER
// ==========================================================================

function goToStage3() {
    stopTimer();
    state.currentStage = 3;
    document.getElementById('display-stage-title').textContent = 'STAGE 3: 분자 조립하기';
    
    document.getElementById('stage-2-container').classList.add('d-none');
    document.getElementById('stage-3-container').classList.remove('d-none');

    state.s3Index = 0;
    initStage3Molecule();
}

function initStage3Molecule() {
    state.s3Atoms = [];
    
    const mol = STAGE_3_MOLECULES[state.s3Index];
    
    // Update target displays
    document.getElementById('molecule-name').textContent = mol.name;
    document.getElementById('molecule-formula').innerHTML = mol.formulaHtml;
    document.getElementById('molecule-desc').textContent = mol.desc;
    document.getElementById('molecule-progress').textContent = `${state.s3Index + 1} / ${STAGE_3_MOLECULES.length}`;
    
    // Refresh workspace
    renderWorkspace();

    // Populate Atom drawer based on atoms in this molecule (plus a few distractions)
    const drawer = document.getElementById('atoms-drawer');
    drawer.innerHTML = '';
    
    // Show H, O, C, N, Cl to choose from
    const availableAtoms = ['H', 'O', 'C', 'N', 'Cl'];
    
    availableAtoms.forEach(symbol => {
        const info = ATOM_INFO[symbol];
        const btn = document.createElement('div');
        btn.className = `drawer-atom ${info.class}`;
        btn.innerHTML = `${symbol}<span>${info.name}</span>`;
        btn.addEventListener('click', () => addAtomToWorkspace(symbol));
        drawer.appendChild(btn);
    });

    // 70 seconds timer per molecule
    startTimer(70, () => {
        SoundEffect.playIncorrect();
        alert('시간이 초과되었습니다! 다음 분자로 이동합니다.');
        nextMolecule(false);
    });
}

function addAtomToWorkspace(symbol) {
    SoundEffect.init();
    state.s3Atoms.push(symbol);
    renderWorkspace();
}

function renderWorkspace() {
    const ws = document.getElementById('molecule-workspace');
    const emptyMsg = document.getElementById('workspace-empty-msg');
    
    // Clear all atom-ball elements
    ws.querySelectorAll('.atom-ball').forEach(el => el.remove());

    if (state.s3Atoms.length === 0) {
        emptyMsg.classList.remove('d-none');
        document.getElementById('molecule-current-formula').textContent = '원자 없음';
        return;
    }

    emptyMsg.classList.add('d-none');

    // Create atom balls
    state.s3Atoms.forEach((symbol, index) => {
        const info = ATOM_INFO[symbol];
        const ball = document.createElement('div');
        ball.className = `atom-ball ${info.class}`;
        ball.textContent = symbol;
        
        // Remove atom when clicked
        ball.addEventListener('click', () => {
            state.s3Atoms.splice(index, 1);
            renderWorkspace();
        });

        ws.appendChild(ball);
    });

    // Render formula string status
    // Count frequencies of elements
    const counts = {};
    state.s3Atoms.forEach(sym => counts[sym] = (counts[sym] || 0) + 1);
    
    let formulaStr = '';
    // Format carbon first, then hydrogen, then others
    const sortOrder = ['C', 'H', 'N', 'O', 'Cl'];
    const activeSymbols = Object.keys(counts).sort((a,b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));
    
    activeSymbols.forEach(sym => {
        const count = counts[sym];
        formulaStr += sym + (count > 1 ? count : '');
    });

    document.getElementById('molecule-current-formula').textContent = formulaStr;
}

function clearMoleculeWorkspace() {
    state.s3Atoms = [];
    renderWorkspace();
}

function submitMolecule() {
    const target = STAGE_3_MOLECULES[state.s3Index];
    
    // Calculate workspace counts
    const wsCounts = {};
    state.s3Atoms.forEach(sym => wsCounts[sym] = (wsCounts[sym] || 0) + 1);
    
    // Validate counts against target formula
    let isCorrect = true;
    
    // Check all required atoms
    for (const [sym, reqCount] of Object.entries(target.atoms)) {
        if ((wsCounts[sym] || 0) !== reqCount) {
            isCorrect = false;
            break;
        }
    }

    // Check if there are unwanted extra atoms
    for (const sym of Object.keys(wsCounts)) {
        if (!target.atoms[sym]) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        SoundEffect.playSuccess();
        
        // Score: 300 points for correct formula + time bonus
        const roundScore = 300 + state.timeLeft * 5;
        state.stageScores.stage3 += roundScore;
        addScore(roundScore);

        alert(`분자 완성 성공! 정답 점수 300점 + 시간 보너스 ${state.timeLeft * 5}점 획득!`);
        nextMolecule(true);
    } else {
        SoundEffect.playIncorrect();
        alert('분자 조립 설계가 화학식과 일치하지 않습니다. 다시 확인해보세요!');
        addScore(-50); // Penalty
    }
}

function nextMolecule(isSuccess) {
    stopTimer();
    state.s3Index++;
    
    if (state.s3Index < STAGE_3_MOLECULES.length) {
        initStage3Molecule();
    } else {
        finishGame();
    }
}

// ==========================================================================
// GAME COMPLETION & SCORE RECORDING
// ==========================================================================

function finishGame() {
    stopTimer();
    SoundEffect.playGameOver();
    
    // Add final score time bonus
    // Let's add extra 100 points for finishing the entire course
    const finishBonus = 200;
    state.stageScores.bonus = finishBonus;
    addScore(finishBonus);

    // Save score to local rankings
    saveScoreToLocalStorage();

    // Prepare Play Result Banner
    document.getElementById('play-result-banner').classList.remove('d-none');
    document.getElementById('player-final-score').textContent = `${state.score}점`;
    document.getElementById('breakdown-s1').textContent = state.stageScores.stage1;
    document.getElementById('breakdown-s2').textContent = state.stageScores.stage2;
    document.getElementById('breakdown-s3').textContent = state.stageScores.stage3;
    document.getElementById('breakdown-bonus').textContent = state.stageScores.bonus;

    // View rankings
    renderRankings();
    showScreen('screen-rankings');
}

function saveScoreToLocalStorage() {
    let rankings = JSON.parse(localStorage.getItem('science_game_rankings') || '[]');
    
    // Create new record
    const dateObj = new Date();
    const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    
    const newRecord = {
        class: state.class,
        number: state.number,
        score: state.score,
        stageScores: state.stageScores,
        date: formattedDate
    };

    // Find duplicate (same class + number)
    const duplicateIndex = rankings.findIndex(r => r.class === state.class && r.number === state.number);
    
    if (duplicateIndex !== -1) {
        // Keep highest score
        if (state.score > rankings[duplicateIndex].score) {
            rankings[duplicateIndex] = newRecord;
        }
    } else {
        rankings.push(newRecord);
    }

    localStorage.setItem('science_game_rankings', JSON.stringify(rankings));
}

// ==========================================================================
// LEADERBOARD & RANKINGS RENDER
// ==========================================================================

function toggleRankingTab(e) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');

    const filterContainer = document.getElementById('class-filter-container');
    if (e.currentTarget.id === 'tab-class-rank') {
        filterContainer.classList.remove('d-none');
    } else {
        filterContainer.classList.add('d-none');
    }

    renderRankings();
}

function renderRankings() {
    const isClassTab = document.getElementById('tab-class-rank').classList.contains('active');
    const tableBody = document.getElementById('leaderboard-body');
    const noRankMsg = document.getElementById('no-rank-message');
    
    tableBody.innerHTML = '';
    
    let rankings = JSON.parse(localStorage.getItem('science_game_rankings') || '[]');
    
    // Filter by class if needed
    if (isClassTab) {
        const selectedClass = document.getElementById('rank-class-select').value;
        rankings = rankings.filter(r => r.class === selectedClass);
    }
    
    // Sort: Score Descending
    rankings.sort((a, b) => b.score - a.score);

    if (rankings.length === 0) {
        noRankMsg.classList.remove('d-none');
        document.getElementById('leaderboard-table').classList.add('d-none');
        return;
    }

    noRankMsg.classList.add('d-none');
    document.getElementById('leaderboard-table').classList.remove('d-none');

    // Slice top 20 for grade-wide, or all for class ranking
    const displayList = isClassTab ? rankings : rankings.slice(0, 20);

    displayList.forEach((record, index) => {
        const rank = index + 1;
        const row = document.createElement('tr');
        
        let rankClass = 'rank-normal';
        if (rank === 1) rankClass = 'rank-1';
        else if (rank === 2) rankClass = 'rank-2';
        else if (rank === 3) rankClass = 'rank-3';
        
        row.className = rankClass;
        row.innerHTML = `
            <td><span class="rank-badge">${rank}</span></td>
            <td>2학년 ${record.class}반</td>
            <td>${record.number}번</td>
            <td><span style="color:var(--color-primary-dark); font-weight:800;">${record.score}점</span></td>
            <td><span style="font-size:12px; color:var(--text-muted);">${record.date}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// ==========================================================================
// TEACHER ADMIN MODAL LOGIC
// ==========================================================================

let adminAuthenticated = false;

function openAdminModal() {
    document.getElementById('admin-modal').classList.add('active');
    
    if (adminAuthenticated) {
        showAdminContent();
    } else {
        document.getElementById('admin-auth-section').classList.remove('d-none');
        document.getElementById('admin-content-section').classList.add('d-none');
        document.getElementById('admin-password').value = '';
        document.getElementById('auth-error-msg').classList.add('d-none');
    }
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.remove('active');
}

function submitAdminPassword() {
    const pw = document.getElementById('admin-password').value;
    
    // 비밀번호 검증 (상단의 TEACHER_PASSWORD 상수를 참조합니다)
    if (pw === TEACHER_PASSWORD) {
        adminAuthenticated = true;
        showAdminContent();
    } else {
        document.getElementById('auth-error-msg').classList.remove('d-none');
        SoundEffect.playIncorrect();
    }
}

function showAdminContent() {
    document.getElementById('admin-auth-section').classList.add('d-none');
    const contentSec = document.getElementById('admin-content-section');
    contentSec.classList.remove('d-none');
    
    renderAdminTable();
}

function renderAdminTable() {
    const rankings = JSON.parse(localStorage.getItem('science_game_rankings') || '[]');
    
    // Calculate stats
    document.getElementById('admin-total-count').textContent = `${rankings.length}명`;
    
    let maxScore = 0;
    const classCount = {};
    
    rankings.forEach(r => {
        if (r.score > maxScore) maxScore = r.score;
        classCount[r.class] = (classCount[r.class] || 0) + 1;
    });

    document.getElementById('admin-top-score').textContent = `${maxScore}점`;
    
    let topClass = '-';
    let topClassCount = 0;
    for (const [cls, count] of Object.entries(classCount)) {
        if (count > topClassCount) {
            topClassCount = count;
            topClass = `2학년 ${cls}반`;
        }
    }
    document.getElementById('admin-top-class').textContent = topClass;

    // Render entries table
    const tableBody = document.getElementById('admin-table-body');
    tableBody.innerHTML = '';

    // Sort by class and number for easy inspection
    const sorted = [...rankings].sort((a,b) => {
        if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class);
        return a.number - b.number;
    });

    sorted.forEach((record) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>2학년 ${record.class}반</td>
            <td>${record.number}번</td>
            <td><strong>${record.score}점</strong></td>
            <td>${record.stageScores.stage1}</td>
            <td>${record.stageScores.stage2}</td>
            <td>${record.stageScores.stage3}</td>
            <td>${record.stageScores.bonus}</td>
            <td>
                <button class="btn-delete-row" onclick="deleteRankRecord('${record.class}', ${record.number})">
                    <i class="fa-solid fa-trash-can"></i> 삭제
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Expose delete action globally for onclick attribute
window.deleteRankRecord = function(cls, num) {
    if (confirm(`학급: 2학년 ${cls}반, 번호: ${num}번\n해당 기록을 삭제하시겠습니까?`)) {
        let rankings = JSON.parse(localStorage.getItem('science_game_rankings') || '[]');
        
        // Remove matching
        rankings = rankings.filter(r => !(r.class === cls && r.number === num));
        
        localStorage.setItem('science_game_rankings', JSON.stringify(rankings));
        renderAdminTable();
        renderRankings();
    }
};

function exportToCSV() {
    const rankings = JSON.parse(localStorage.getItem('science_game_rankings') || '[]');
    if (rankings.length === 0) {
        alert('내보낼 데이터가 없습니다.');
        return;
    }

    // Sort: Class -> Number
    const sorted = [...rankings].sort((a,b) => {
        if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class);
        return a.number - b.number;
    });

    // CSV header with UTF-8 BOM
    let csvContent = "\uFEFF"; // UTF-8 BOM to prevent Excel display corruption
    csvContent += "학급,번호,총점,1단계(기호매칭),2단계(주기율표),3단계(분자조립),보너스점수,기록일시\n";

    sorted.forEach(r => {
        csvContent += `2학년 ${r.class}반,${r.number}번,${r.score},${r.stageScores.stage1},${r.stageScores.stage2},${r.stageScores.stage3},${r.stageScores.bonus},${r.date}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "science_game_rankings_2026.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function resetAllRankingsData() {
    if (confirm('주의: 모든 학생의 플레이 데이터와 랭킹 기록이 완전히 삭제됩니다. 진행하시겠습니까?')) {
        localStorage.removeItem('science_game_rankings');
        renderAdminTable();
        renderRankings();
        alert('모든 데이터가 초기화되었습니다.');
    }
}

function generateDemoData() {
    if (confirm('랭킹 기능 확인을 위한 테스트용 가상 학생 기록 15건을 생성하시겠습니까?')) {
        const rankings = JSON.parse(localStorage.getItem('science_game_rankings') || '[]');
        
        const dateObj = new Date();
        const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

        let addedCount = 0;
        let attempts = 0;
        while (addedCount < 15 && attempts < 100) {
            attempts++;
            const mockClass = String(Math.floor(Math.random() * 8) + 1);
            const mockNum = Math.floor(Math.random() * 30) + 1;
            
            // Check duplicate
            const duplicate = rankings.some(r => r.class === mockClass && r.number === mockNum);
            if (duplicate) continue;
            
            // Random scores
            const s1 = Math.floor(Math.random() * 5 + 4) * 100; // 400 - 800
            const s2 = Math.floor(Math.random() * 4 + 3) * 150; // 450 - 900
            const s3 = Math.floor(Math.random() * 3 + 1) * 300; // 300 - 900
            const bonus = Math.floor(Math.random() * 150) + 100;
            const total = s1 + s2 + s3 + bonus;

            rankings.push({
                class: mockClass,
                number: mockNum,
                score: total,
                stageScores: { stage1: s1, stage2: s2, stage3: s3, bonus: bonus },
                date: formattedDate
            });
            addedCount++;
        }

        localStorage.setItem('science_game_rankings', JSON.stringify(rankings));
        renderAdminTable();
        renderRankings();
        alert('테스트 데이터 10건이 생성되었습니다.');
    }
}
