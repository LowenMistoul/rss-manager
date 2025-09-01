const http = require("http");
//const { Server } = require("socket.io");
const express = require('express');
const app = express();
const server = http.createServer(app);

const jwt = require('jsonwebtoken');

function socketInit(server, app) {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: { origin: '*' } // ⚠️ à restreindre en prod
  });

  app.use((req, _res, next) => {
    req.io = io;
    next();
  });

  // Auth par JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Auth token manquant'));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id };
      next();
    } catch {
      return next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    console.log(' Client connecté', socket.user);
    socket.on('collection:join', (collectionId) => {
      socket.join(`collection:${collectionId}`);
      console.log(`User ${socket.user.id} joined collection ${collectionId}`);
    });

    socket.on('collection:leave', (collectionId) => {
      socket.leave(`collection:${collectionId}`);
      console.log(`User ${socket.user.id} left collection ${collectionId}`);
    });

    // Indicateur "en train d’écrire"
    socket.on('typing', (collectionId) => {
      socket.to(`collection:${collectionId}`).emit('typing', { userId: socket.user.id });
    });

    socket.on('disconnect', () => {
      console.log(' Client déconnecté', socket.user.id);
    });
  });

  return io;
}

module.exports = { socketInit };
