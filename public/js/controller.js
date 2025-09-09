// Connect to socket server
const socket = io(`http://localhost:4000`);
// Preload sounds
const correctSound = new Audio('/audio/correct.mp3');
const wrongSound = new Audio('/audio/wrong.mp3');

let lastRevealedAnswers = new Set();  // Track which answers were revealed last time to avoid repeated sounds

let questions = [];
let answers = [];
let answerStatus = []; // Track revealed status of answers
let currentQuestionIndex = 0;
let showX = 0;  // Track showX locally

const team1NameElem = document.getElementById('team1Name');
const team2NameElem = document.getElementById('team2Name');

let team1Name = team1NameElem.value || 'Team 1';
let team2Name = team2NameElem.value || 'Team 2';

// Listen for full game state updates from server
socket.on('gameState', (state) => {
  questions = state.questions || questions;
  currentQuestionIndex = state.currentQuestionIndex ?? currentQuestionIndex;
  showX = Number(state.showX) || 0;

  // Update team names if provided
  if (state.team1Name) {
    team1Name = state.team1Name;
    team1NameElem.value = team1Name;
    document.getElementById('team1Label').textContent = team1Name;
  }
  if (state.team2Name) {
    team2Name = state.team2Name;
    team2NameElem.value = team2Name;
    document.getElementById('team2Label').textContent = team2Name;
  }

  // Update points display
  document.getElementById('team1Points').textContent = state.team1Points ?? document.getElementById('team1Points').textContent;
  document.getElementById('team2Points').textContent = state.team2Points ?? document.getElementById('team2Points').textContent;

  if (showX > 0) {
    showXOverlay(showX);
  }

  displayQuestion(currentQuestionIndex);

  updateGameStateInfo({
    showX,
    questions,
    currentQuestionIndex
  });
});




function showXOverlay(count) {
  wrongSound.currentTime = 0;
  wrongSound.play();

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
  overlay.textContent = 'X'.repeat(count);
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

  infoDiv.textContent = `Show X count: ${state.showX} | Answers: ${answersStatus}`;
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
      if (answer.answer === '-') {
        answer.revealed = true;
      } else if (answer.revealed === undefined) {
        answer.revealed = false;
      }

      answerText.textContent = answer.answer;
      answerPoints.textContent = answer.revealed ? answer.points : '';

      if (answer.revealed) {
        box.classList.add('revealed');
        revealBtn.style.display = 'none';

        // Play correct sound only if this answer was not revealed before
        if (!lastRevealedAnswers.has(i)) {
          correctSound.currentTime = 0;
          correctSound.play();
          lastRevealedAnswers.add(i);
        }
      } else {
        box.classList.remove('revealed');
        revealBtn.style.display = 'inline-block';

        // Remove from tracking if answer hidden again
        if (lastRevealedAnswers.has(i)) {
          lastRevealedAnswers.delete(i);
        }
      }
    } else {
      answerText.textContent = '';
      answerPoints.textContent = '';
      box.classList.remove('revealed');
      revealBtn.style.display = 'none';
      lastRevealedAnswers.delete(i);
    }
  });

  currentQuestionIndex = index;
  document.getElementById('currentQuestionIndex').textContent = `Question ${index + 1} of ${questions.length}`;

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
    showX: showX || 0,
    currentQuestionIndex,
    team1Points: parseInt(document.getElementById('team1Points').textContent) || 0,
    team2Points: parseInt(document.getElementById('team2Points').textContent) || 0,
    team1Name,
    team2Name,
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
      showX = (showX || 0) + 1;  // increment showX count
      showXOverlay(showX);

      socket.emit('gameState', {
        questions,
        showX,
        currentQuestionIndex,
        team1Points: parseInt(document.getElementById('team1Points').textContent) || 0,
        team2Points: parseInt(document.getElementById('team2Points').textContent) || 0,
        team1Name,
        team2Name,
      });
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
  
  document.getElementById('team1Name').addEventListener('change', (e) => {
    team1Name = e.target.value || 'Team 1';
    document.getElementById('team1Label').textContent = team1Name;
  });
  document.getElementById('team2Name').addEventListener('change', (e) => {
    team2Name = e.target.value || 'Team 2';
    document.getElementById('team2Label').textContent = team2Name;
  });
});
