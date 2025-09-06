import io from 'socket.io-client';
const socket = io();

const currentQuestionElem = document.getElementById('currentQuestion');
const currentQuestionIndexElem = document.getElementById('currentQuestionIndex');
const team1PointsElem = document.getElementById('team1Points');
const team2PointsElem = document.getElementById('team2Points');
const team1NameInput = document.getElementById('team1Name');
const team2NameInput = document.getElementById('team2Name');
const pointsToAddInput = document.getElementById('pointsToAdd');
const wrongXBtn = document.getElementById('wrongXBtn');
const revealAllBtn = document.getElementById('revealAllBtn');
const hideAllBtn = document.getElementById('hideAllBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const prevQuestionBtn = document.getElementById('prevQuestionBtn');

const answerBoxes = Array.from(document.querySelectorAll('.answer-box'));

let gameState = null;

// Render the game state received from the server
function renderGameState(state) {
  gameState = state;

  currentQuestionElem.textContent = state.question || '';
  currentQuestionIndexElem.textContent = `Question ${state.currentQuestionIndex + 1}`;

  // Update answers
  state.answers.forEach((answer, i) => {
    const box = answerBoxes[i];
    if (!box) return;

    const pointsElem = box.querySelector('.answer-points');
    const textElem = box.querySelector('.answer-text');
    const revealBtn = box.querySelector('.reveal-btn');

    pointsElem.textContent = answer.revealed ? answer.points : '';
    textElem.textContent = answer.revealed ? answer.answer : '???';

    if (answer.revealed) {
      box.classList.add('revealed');
    } else {
      box.classList.remove('revealed');
    }

    // Enable reveal button only if not revealed
    revealBtn.disabled = answer.revealed;
  });

  // Update team points and names
  team1PointsElem.textContent = state.teams.team1.points;
  team2PointsElem.textContent = state.teams.team2.points;
  if (team1NameInput.value !== state.teams.team1.name) {
    team1NameInput.value = state.teams.team1.name;
  }
  if (team2NameInput.value !== state.teams.team2.name) {
    team2NameInput.value = state.teams.team2.name;
  }
}

// Listen for gameState updates from server
socket.on('gameState', (state) => {
  renderGameState(state);
});

// Reveal a single answer by index
function revealAnswer(index) {
  socket.emit('revealAnswer', index);
}

// Add points to a team
function addPoints(team) {
  const points = parseInt(pointsToAddInput.value, 10);
  if (isNaN(points) || points <= 0) {
    alert('Please enter a valid positive number of points.');
    return;
  }
  socket.emit('updatePoints', { team, points });
}

// Update team name
function updateTeamName(team, name) {
  socket.emit('updateTeamName', { team, name });
}

// Reveal all answers
function revealAll() {
  socket.emit('revealAll');
}

// Hide all answers
function hideAll() {
  socket.emit('hideAll');
}

// Show wrong X overlay
function showWrongX() {
  socket.emit('showWrongX');
}

// Navigation
function nextQuestion() {
  socket.emit('nextQuestion');
}

function prevQuestion() {
  socket.emit('prevQuestion');
}

// Setup event listeners
answerBoxes.forEach(box => {
  const index = parseInt(box.getAttribute('data-index'), 10);
  const revealBtn = box.querySelector('.reveal-btn');
  revealBtn.addEventListener('click', () => revealAnswer(index));
});

team1NameInput.addEventListener('input', (e) => {
  updateTeamName('team1', e.target.value);
});

team2NameInput.addEventListener('input', (e) => {
  updateTeamName('team2', e.target.value);
});

document.getElementById('addPointsTeam1').addEventListener('click', () => addPoints('team1'));
document.getElementById('addPointsTeam2').addEventListener('click', () => addPoints('team2'));

revealAllBtn.addEventListener('click', revealAll);
hideAllBtn.addEventListener('click', hideAll);
wrongXBtn.addEventListener('click', showWrongX);
nextQuestionBtn.addEventListener('click', nextQuestion);
prevQuestionBtn.addEventListener('click', prevQuestion);

// Optional: listen for showWrongX event to show overlay on controller if needed
socket.on('showWrongX', () => {
  // You can implement a visual overlay here if desired
  // For example, flash the screen red or show a modal
  console.log('Wrong X shown');
});
