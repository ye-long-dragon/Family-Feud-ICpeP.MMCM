const socket = io('http://localhost:4000');

let questions = [];
let currentQuestionIndex = 0;
let team1Points = 0;
let team2Points = 0;

socket.on('gameState', (gameState) => {
  questions = gameState.questions || [];
  currentQuestionIndex = gameState.currentQuestionIndex ?? 0;
  team1Points = gameState.team1Points ?? 0;
  team2Points = gameState.team2Points ?? 0;

  updateUI();
});

function updateUI() {
  // Update team points
  document.getElementById('team-a-points').textContent = team1Points;
  document.getElementById('team-b-points').textContent = team2Points;

  // Update question text
  const currentQuestion = questions[currentQuestionIndex];
  document.getElementById('question').textContent = currentQuestion?.question || 'Waiting for question...';

  // Update answers
  for (let i = 0; i < 6; i++) {
    const answerBox = document.getElementById(`answer-${i}`);
    if (!answerBox) continue;

    const answer = currentQuestion?.answers[i];
    if (answer) {
      answerBox.textContent = `${answer.answer} - ${answer.points}`;
      answerBox.classList.add('revealed');
    } else {
      answerBox.textContent = '';
      answerBox.classList.remove('revealed');
    }
  }
}

