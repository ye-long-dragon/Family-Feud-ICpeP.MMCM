



// Connect to socket server
const socket = io(`http://localhost:4000`);



// Listen for full game state updates from server
socket.on('gameState', (state) => {
  // Update local state from server
  questions = state.questions || questions;
  currentQuestionIndex = state.currentQuestionIndex ?? currentQuestionIndex;

  // Update points display
  document.getElementById('team1Points').textContent = state.team1Points ?? document.getElementById('team1Points').textContent;
  document.getElementById('team2Points').textContent = state.team2Points ?? document.getElementById('team2Points').textContent;

  // Display current question and answers
  displayQuestion(currentQuestionIndex);
  
});

let questions = [];
let currentQuestionIndex = 0;

function emitGameState() {
  const currentQuestion = questions[currentQuestionIndex];
  socket.emit('gameState', {
    questions,
    currentQuestionIndex,
    team1Points: parseInt(document.getElementById('team1Points').textContent) || 0,
    team2Points: parseInt(document.getElementById('team2Points').textContent) || 0,
  });
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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/questions');
    if (!response.ok) throw new Error('Failed to fetch questions');
    questions = await response.json();

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
      // You can emit a gameState update here if needed
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
