import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// TENOR CONFIG
const TENOR_API_KEY = process.env.TENOR_API_KEY || "L6V06SC3M06C";
const TENOR_CLIENT_KEY = "onuvuti_app";

app.get('/api/tenor/search', async (req, res) => {
  const { q, limit = 12 } = req.query;
  try {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${q}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=${limit}&contentfilter=medium`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Tenor' });
  }
});

app.get('/api/tenor/trending', async (req, res) => {
  const { limit = 12 } = req.query;
  try {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=${limit}&contentfilter=medium`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('👤 Connected:', socket.id);

  socket.on('join_resonance', (data) => {
    const { roomId, profile } = data;
    socket.join(roomId);
    socket.profile = profile;
    
    console.log(`🌌 ${socket.id} joined ${roomId}`);

    // Robust Pairing: Get all existing peers in the room
    const clients = io.sockets.adapter.rooms.get(roomId);
    if (clients) {
      clients.forEach((clientId) => {
        if (clientId !== socket.id) {
          const clientSocket = io.sockets.sockets.get(clientId);
          // Tell the newcomer about existing peer
          socket.emit('peer_joined', { id: clientId, profile: clientSocket?.profile });
          // Tell the existing peer about newcomer
          clientSocket?.emit('peer_joined', { id: socket.id, profile: socket.profile });
        }
      });
    }
  });

  socket.on('send_signal', (data) => {
    socket.to(data.roomId).emit('receive_signal', data);
  });

  socket.on('disconnect', () => {
    console.log('👤 Disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🌐 Resonance Server running on port ${PORT}`);
});
