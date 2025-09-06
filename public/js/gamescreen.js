import io from 'socket.io-client';
const socket = io();

const questionElem = document.getElementById('question');
const answerBoxes = [
  document.getElementById('answer-0'),
  document.getElementById('answer-1'),
  document.getElementById('answer-2'),
  document.getElementById('answer-3'),
  document.getElementById('answer-4'),
  document.getElementById('answer-5'),
];
const teamAPointsElem = document.getElementById('team-a-points');
const teamBPointsElem = document.getElementById('team-b-points');
const wrongOverlay = document.getElementById('wrong-overlay');

let gameState = null;

// Render the game state received from the server
function renderGameState(state) {
  gameState = state;

  questionElem.textContent = state.question || '';

  state.answers.forEach((answer, i) => {
    const box = answerBoxes[i];
    if (!box) return;
    if (answer.revealed) {
      box.textContent = `${answer.answer} - ${answer.points}`;
      box.classList.add('revealed');
    } else {
      box.textContent = '';
      box.classList.remove('revealed');
    }
  });

  teamAPointsElem.textContent = state.teams.team1.points;
  teamBPointsElem.textContent = state.teams.team2.points;
}

// Listen for gameState updates from server
socket.on('gameState', (state) => {
  renderGameState(state);
});

// Reveal next unrevealed answer and award points to selected team
function revealNext() {
  if (!gameState) return;

  const nextIndex = gameState.answers.findIndex(a => !a.revealed);
  if (nextIndex === -1) return; // all revealed

  // Emit revealAnswer event to server
  socket.emit('revealAnswer', nextIndex);

  // Award points to selected team
  const team = parseInt(document.getElementById('team-select')?.value, 10);
  if (team === 1) {
    socket.emit('updatePoints', { team: 'team1', points: gameState.answers[nextIndex].points });
  } else if (team === 2) {
    socket.emit('updatePoints', { team: 'team2', points: gameState.answers[nextIndex].points });
  }
}

// Show red X overlay for wrong answer
function showWrongOverlay() {
  wrongOverlay.classList.add('active');
  setTimeout(() => {
    wrongOverlay.classList.remove('active');
  }, 2000);
  // Notify server to broadcast wrong answer event
  socket.emit('showWrongX');
}

// Event listeners
document.getElementById('reveal-btn').addEventListener('click', revealNext);
document.getElementById('wrong-btn').addEventListener('click', showWrongOverlay);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    revealNext();
  }
});

// Listen for showWrongX event from server to show overlay on all clients
socket.on('showWrongX', () => {
  wrongOverlay.classList.add('active');
  setTimeout(() => {
    wrongOverlay.classList.remove('active');
  }, 2000);
});
