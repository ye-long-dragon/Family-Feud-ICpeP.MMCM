import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const socketPORT = process.env.SOCKETPORT || 4000;   // dedicated Socket.IO server
const frontendPORT = process.env.PORT || 5000;       // where your frontend is served

// Create a bare HTTP server (no Express needed if you don't serve static files here)
const server = http.createServer();

// Create Socket.IO server attached to the HTTP server
const io = new Server(server, {
  cors: {
    origin: `http://localhost:${frontendPORT}`, // ✅ allow frontend origin, not socket
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`A user connected, Socket id: ${socket.id}`);

  // Listen for full game state updates from clients
  socket.on('gameState', (state) => {
    console.log('Received gameState update from client:', state);
    // Broadcast the updated game state to all other clients except sender
    socket.broadcast.emit('gameState', state);
    console.log('Broadcasted gameState to other clients');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected, Socket id: ${socket.id}`);
  });
});

// Start the server
server.listen(socketPORT, () => {
  console.log(`Socket.IO server listening on port ${socketPORT}`);
});

// Note: Ensure your frontend clients connect to this Socket.IO server using the correct port
// Example: const socket = io('http://localhost:4000');
// and that your frontend server (Express or static server) runs on a different port (e.g., 3000 or 5000).
// Also ensure CORS settings allow communication between the frontend and this Socket.IO server.
// This setup allows real-time communication between multiple clients via the Socket.IO server.
// Clients emit 'gameState' events with the full game state, and the server broadcasts it to all other clients.
// Clients listen for 'gameState' events to update their UI accordingly.
