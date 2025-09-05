export default function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    // Send current game state to new client
    socket.emit('gameState', gameState);
    // Listen for controller commands
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
        // TODO: implement question navigation logic
        io.emit('gameState', gameState);
    });
    socket.on('prevQuestion', () => {
        // TODO: implement question navigation logic
        io.emit('gameState', gameState);
    });
    socket.on('revealAll', () => {
        gameState.answers.forEach(a => a.revealed = true);
        io.emit('gameState', gameState);
    });
    socket.on('hideAll', () => {
        gameState.answers.forEach(a => a.revealed = false);
        io.emit('gameState', gameState);
    });
    socket.on('showWrongX', () => {
        io.emit('showWrongX');
    });
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });
    });
}