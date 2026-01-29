const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require("dotenv").config()

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server Socket Application is running succesfully 👾")
})

const MEETING_STATUS = {
  CREATED: "created",
  DISCONNECTED: "disconnected",
  CONNECTED: "connected",
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const meetings = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {

    let meeting = {}

    if (meetings.get(roomId)) {
      meeting = meetings.get(roomId)
      socket.join(roomId) // Room 

      meeting.participants.push({
        id: socket.id,
        name: username,
        joinedAt: new Date()
      })

      if (meeting.participants.length >= 2) {
        meeting.status = MEETING_STATUS.CONNECTED
      }
      socket.to(roomId).emit('user-joined', { userId: socket.id, username });
      console.log(`User ${socket.id} joined room ${roomId}`);
      console.log(meeting)
      return
    }

    meeting = {
      roomId,
      id: socket.id,
      creator: username,
      createdAt: new Date(),
      status: MEETING_STATUS.CREATED,
      participants: []
    }

    meeting.participants.push({
      id: socket.id,
      name: username,
      joinedAt: new Date()
    })

    meetings.set(roomId, meeting)

    socket.join(roomId); // Room
    socket.emit("meeting-creted", { meeting })

    console.log("meeting created by ", username)
    console.log(meeting)
  });


  socket.on('offer', ({ sender, offer, to }) => {
    console.log(`Sending offer from ${socket.id} to ${to}`);
    io.to(to).emit('offer', { offer, from: socket.id, sender });
  });

  socket.on('answer', ({ answer, to, sender }) => {
    console.log(`Sending answer from ${socket.id} to ${to}`);
    io.to(to).emit('answer', { answer, from: socket.id, sender });
  });

  socket.on('ice-candidate', ({ candidate, to, sender }) => {
    console.log(`Sending ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit('ice-candidate', { candidate, from: socket.id, sender });
  });

  socket.on('disconnect', (reason) => {
    console.log("User Disconnected -> " + socket.id)
    console.log("Reason:", reason);

    meetings.forEach((meeting, meetingId) => {
      const indexOfParticipantLeft = meeting.participants.findIndex(p => p.id === socket.id);

      if (indexOfParticipantLeft !== -1) {

        const username = meeting.participants[indexOfParticipantLeft].name
        meeting.participants.splice(indexOfParticipantLeft, 1);

        io.to(meetingId).emit("participant-left", {
          participantId: socket.id,
          participants: meeting.participants.length,
          username
        })

        if (meeting.participants.length === 0) {
          setTimeout(() => {
            if (meetings.get(meetingId)?.participants.length === 0) {
              meetings.delete(meetingId)
              console.log('Meeting cleaned up:', meetingId);
            }
          }, 300000) // 300000 -> five minutes 
        }
      }
    })

  });


});

const PORT = process.env.SERVER_PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});