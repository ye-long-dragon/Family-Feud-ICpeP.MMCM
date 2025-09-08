// Connect to socket server
const socket = io(`http://localhost:4000`);

let questions = [];
let answers = [];
let answerStatus = []; // Track revealed status of answers
let currentQuestionIndex = 0;
let showX = false;  // Track showX locally

// Listen for full game state updates from server
socket.on('gameState', (state) => {
  // Update local state from server
  questions = state.questions || questions;
  currentQuestionIndex = state.currentQuestionIndex ?? currentQuestionIndex;
  showX = !!state.showX;

  // If you want to keep separate answers and answerStatus arrays, update them here:
  answers = questions.map(q => q.answers || []);
  // answerStatus can be derived from answers' revealed flags, so usually not needed separately

  // Update points display
  document.getElementById('team1Points').textContent = state.team1Points ?? document.getElementById('team1Points').textContent;
  document.getElementById('team2Points').textContent = state.team2Points ?? document.getElementById('team2Points').textContent;

  // ShowX overlay if needed
  if (showX) {
    showXOverlay();
  }

  // Display current question and answers
  displayQuestion(currentQuestionIndex);

  // Update game state info display
  updateGameStateInfo({
    showX,
    questions,
    currentQuestionIndex
  });
});


function showXOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'largeXOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(255,0,0,0.9)';
  overlay.style.color = 'white';
  overlay.style.fontSize = '20vh';
  overlay.style.fontWeight = 'bold';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = 1050;
  overlay.textContent = 'X';
  document.body.appendChild(overlay);
  setTimeout(() => {
    document.body.removeChild(overlay);
  }, 3000);
}

function updateGameStateInfo(state) {
  const infoDiv = document.getElementById('gameStateInfo');
  if (!infoDiv) return;

  const question = state.questions && state.questions[state.currentQuestionIndex];
  let answersStatus = 'No question loaded';
  if (question && question.answers) {
    const allRevealed = question.answers.every(a => a.revealed);
    const noneRevealed = question.answers.every(a => !a.revealed);
    if (allRevealed) {
      answersStatus = 'All answers revealed';
    } else if (noneRevealed) {
      answersStatus = 'All answers hidden';
    } else {
      answersStatus = 'Some answers revealed';
    }
  }

  infoDiv.textContent = `Show X: ${state.showX ? 'Yes' : 'No'} | Answers: ${answersStatus}`;
}

function displayQuestion(index) {
  if (index < 0 || index >= questions.length) {
    console.error('Invalid question index:', index);
    return;
  }
  const question = questions[index];
  document.getElementById('currentQuestion').textContent = question.question;

  const answerBoxes = document.querySelectorAll('.answer-box');
  answerBoxes.forEach((box, i) => {
    const answerText = box.querySelector('.answer-text');
    const answerPoints = box.querySelector('.answer-points');
    const revealBtn = box.querySelector('.reveal-btn');
    const answer = question.answers[i];

    if (answer) {
      if (answer.revealed === undefined) answer.revealed = false;

      answerText.textContent = answer.answer;
      answerPoints.textContent = answer.revealed ? answer.points : '';

      if (answer.revealed) {
        box.classList.add('revealed');
        revealBtn.style.display = 'none';
      } else {
        box.classList.remove('revealed');
        revealBtn.style.display = 'inline-block';
      }
    } else {
      answerText.textContent = '';
      answerPoints.textContent = '';
      box.classList.remove('revealed');
      revealBtn.style.display = 'none';
    }
  });

  currentQuestionIndex = index;
  document.getElementById('currentQuestionIndex').textContent = `Question ${index + 1} of ${questions.length}`;

  // Update game state info display with local state
  updateGameStateInfo({
    showX,
    questions,
    currentQuestionIndex: index
  });
}

function revealAnswer(index) {
  const question = questions[currentQuestionIndex];
  if (question.answers && question.answers[index]) {
    question.answers[index].revealed = true;
    displayQuestion(currentQuestionIndex);
    emitGameState();
  }
}


function revealAllAnswers() {
  const question = questions[currentQuestionIndex];
  question.answers.forEach(answer => answer.revealed = true);
  displayQuestion(currentQuestionIndex);
  emitGameState();
}

function hideAllAnswers() {
  const question = questions[currentQuestionIndex];
  question.answers.forEach(answer => answer.revealed = false);
  displayQuestion(currentQuestionIndex);
  emitGameState();
}

function emitGameState() {
  socket.emit('gameState', {
    questions,
    showX,
    currentQuestionIndex,
    team1Points: parseInt(document.getElementById('team1Points').textContent) || 0,
    team2Points: parseInt(document.getElementById('team2Points').textContent) || 0,
  });
}


document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/questions');
    if (!response.ok) throw new Error('Failed to fetch questions');
    questions = await response.json();
    // Initialize revealed flags if missing
    questions.forEach(q => {
      q.answers.forEach(a => {
        if (a.revealed === undefined) a.revealed = false;
      });
    });
    if (questions.length === 0) {
      alert('No questions found');
      return;
    }
    socket.on('connect', () => {
      alert(`Connected to server with ID: ${socket.id}`);
    });
    displayQuestion(0);
    emitGameState();
    document.querySelectorAll('.answer-box').forEach((box, index) => {
      const btn = box.querySelector('.reveal-btn');
      btn.addEventListener('click', () => revealAnswer(index));
    });

    document.getElementById('nextQuestionBtn').addEventListener('click', () => {
      if (currentQuestionIndex < questions.length - 1) {
        displayQuestion(currentQuestionIndex + 1);
        emitGameState();
      } else {
        alert('No more questions available.');
      }
    });

    document.getElementById('prevQuestionBtn').addEventListener('click', () => {
      if (currentQuestionIndex > 0) {
        displayQuestion(currentQuestionIndex - 1);
        emitGameState();
      } else {
        alert('This is the first question.');
      }
    });

    document.getElementById('revealAllBtn').addEventListener('click', revealAllAnswers);
    document.getElementById('hideAllBtn').addEventListener('click', hideAllAnswers);

    document.getElementById('wrongXBtn').addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.id = 'largeXOverlay';
      overlay.style.position = 'fixed';
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(255,0,0,0.9)';
      overlay.style.color = 'white';
      overlay.style.fontSize = '20vh';
      overlay.style.fontWeight = 'bold';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.zIndex = 1050;
      overlay.textContent = 'X';
      document.body.appendChild(overlay);
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 3000);
      // Emit gameState update with showX true
      socket.emit('gameState', { showX: true });
    });

    document.getElementById('addPointsTeam1').addEventListener('click', () => {
      const pointsToAdd = parseInt(document.getElementById('pointsToAdd').value) || 0;
      const team1PointsElem = document.getElementById('team1Points');
      team1PointsElem.textContent = (parseInt(team1PointsElem.textContent) || 0) + pointsToAdd;
      emitGameState();
    });

    document.getElementById('addPointsTeam2').addEventListener('click', () => {
      const pointsToAdd = parseInt(document.getElementById('pointsToAdd').value) || 0;
      const team2PointsElem = document.getElementById('team2Points');
      team2PointsElem.textContent = (parseInt(team2PointsElem.textContent) || 0) + pointsToAdd;
      emitGameState();
    });

  } catch (error) {
    console.error('Error loading questions:', error);
  }
});
