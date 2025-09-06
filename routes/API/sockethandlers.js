// socketHandlers.js
import fetch from 'node-fetch'; 
import dotenv from 'dotenv';
dotenv.config();

let questions = [];
let currentQuestionIndex = 0;

let gameState = {
  currentQuestionIndex: 0,
  question: null,
  answers: [],
  teams: {
    team1: { name: 'Team 1', points: 0 },
    team2: { name: 'Team 2', points: 0 }
  }
};

// 🔹 Load questions from API
async function loadQuestions() {
  try {
    const baseUrl = process.env.API_URL || 'http://localhost:3000'; // fallback
    const response = await fetch(`${baseUrl}/api/questions`);
    if (!response.ok) throw new Error(`Failed to fetch questions: ${response.status}`);

    questions = await response.json();

    if (questions.length > 0) {
      setCurrentQuestion(0);
    } else {
      console.warn('⚠️ No questions found in the database');
    }
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

function setCurrentQuestion(index) {
  if (index < 0 || index >= questions.length) return false;

  currentQuestionIndex = index;
  const q = questions[index];

  gameState.currentQuestionIndex = index;
  gameState.question = q.question;
  gameState.answers = q.answers.map(a => ({ ...a, revealed: false }));
  return true;
}

export default function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    socket.emit('gameState', gameState);

    socket.on('revealAnswer', (index) => {
      if (gameState.answers[index]) {
        gameState.answers[index].revealed = true;
        io.emit('gameState', gameState);
      }
    });

    socket.on('updatePoints', ({ team, points }) => {
      if (gameState.teams[team]) {
        gameState.teams[team].points += points;
        io.emit('gameState', gameState);
      }
    });

    socket.on('updateTeamName', ({ team, name }) => {
      if (gameState.teams[team]) {
        gameState.teams[team].name = name;
        io.emit('gameState', gameState);
      }
    });

    socket.on('nextQuestion', () => {
      if (setCurrentQuestion(currentQuestionIndex + 1)) {
        io.emit('gameState', gameState);
      }
    });

    socket.on('prevQuestion', () => {
      if (setCurrentQuestion(currentQuestionIndex - 1)) {
        io.emit('gameState', gameState);
      }
    });

    socket.on('revealAll', () => {
      gameState.answers.forEach(a => (a.revealed = true));
      io.emit('gameState', gameState);
    });

    socket.on('hideAll', () => {
      gameState.answers.forEach(a => (a.revealed = false));
      io.emit('gameState', gameState);
    });

    socket.on('showWrongX', () => {
      io.emit('showWrongX');
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
}

loadQuestions().catch(console.error);
