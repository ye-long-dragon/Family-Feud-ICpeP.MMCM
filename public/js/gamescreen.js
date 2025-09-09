const socket = io('http://localhost:4000');

let questions = [];
let currentQuestionIndex = 0;
let team1Points = 0;
let team2Points = 0;
let team1Name = 'Team A';  // default names matching your EJS initial text
let team2Name = 'Team B';
let showX = 0;  // Initialize showX to 0

socket.on('gameState', (gameState) => {
  questions = gameState.questions || [];
  currentQuestionIndex = gameState.currentQuestionIndex ?? 0;
  team1Points = gameState.team1Points ?? 0;
  team2Points = gameState.team2Points ?? 0;

  // Update team names if provided
  if (gameState.team1Name) {
    team1Name = gameState.team1Name;
  }
  if (gameState.team2Name) {
    team2Name = gameState.team2Name;
  }

  // Check if showX changed
  let newShowX = gameState.showX ?? 0;
  if (newShowX !== showX) {
    if (newShowX > 0) {
      showXOverlay(newShowX);
      if (newShowX > 3) {
        newShowX = 0;
      }
    }
    showX = newShowX;
  }

  updateUI();
});

function updateUI() {
  // Update team points
  document.getElementById('team-a-points').textContent = team1Points;
  document.getElementById('team-b-points').textContent = team2Points;

  // Update team names (match your EJS IDs)
  document.getElementById('team1-name').textContent = team1Name;
  document.getElementById('team2-name').textContent = team2Name;

  // Update question text
  const currentQuestion = questions[currentQuestionIndex];
  document.getElementById('question').textContent = currentQuestion?.question || 'Waiting for question...';

  // Update answers
  for (let i = 0; i < 6; i++) {
    const answerBox = document.getElementById(`answer-${i}`);
    if (!answerBox) continue;

    const answer = currentQuestion?.answers[i];
    if (answer && answer.revealed) {
      answerBox.textContent = `${answer.answer} - ${answer.points}`;
      answerBox.classList.add('revealed');
      answerBox.classList.remove('answer-hidden');
    } else {
      answerBox.textContent = '-----';
      answerBox.classList.remove('revealed');
      answerBox.classList.add('answer-hidden');
    }
  }
}

// showXOverlay function that shows 'X' count times for 3 seconds
function showXOverlay(count) {
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
