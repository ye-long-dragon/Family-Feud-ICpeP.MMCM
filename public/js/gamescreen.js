const socket = io("http://localhost:4000"); // adjust port if needed

// Track last state to detect new reveals
let lastRevealedCount = 0;

// 🔹 Update the game state UI
function renderGameState(state) {
  console.log("✅ Rendering game state:", state);

  const { teams, question, answers } = state;

  // Update team names
  document.getElementById("team1-name").textContent = teams.team1.name;
  document.getElementById("team2-name").textContent = teams.team2.name;

  // Update team points
  document.getElementById("team-a-points").textContent = teams.team1.points;
  document.getElementById("team-b-points").textContent = teams.team2.points;

  // Update question
  document.getElementById("question").textContent = question || "Waiting for question...";

  // Count revealed answers to detect new ones
  let revealedCount = 0;

  // Update answers (supports up to 6)
  for (let i = 0; i < 6; i++) {
    const answerObj = answers[i];
    const answerElem = document.getElementById(`answer-${i}`);
    if (!answerElem) continue;

    if (answerObj) {
      if (answerObj.revealed) {
        answerElem.textContent = `${answerObj.answer} - ${answerObj.points}`;
        answerElem.classList.add("revealed");
        revealedCount++;
      } else {
        answerElem.textContent = "???";
        answerElem.classList.remove("revealed");
      }
    } else {
      answerElem.textContent = "";
      answerElem.classList.remove("revealed");
    }
  }

  // 🔔 Play ding if a new answer was revealed
  if (revealedCount > lastRevealedCount) {
    dingSound.currentTime = 0;
    dingSound.play().catch(err => console.warn("Ding sound blocked:", err));
  }
  lastRevealedCount = revealedCount;
}

// 🔹 Listen for full game state updates
socket.on("gameState", (state) => {
  renderGameState(state);
});

// 🔹 Wrong answer buzz
socket.on("showWrongX", () => {
  const overlay = document.getElementById("wrong-overlay");
  overlay.classList.add("active");

  buzzSound.currentTime = 0;
  buzzSound.play().catch(err => console.warn("Buzz sound blocked:", err));

  setTimeout(() => {
    overlay.classList.remove("active");
  }, 2000);
});

// 🔹 Debug: confirm when game screen is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("📺 Game screen ready, waiting for server updates...");
});
