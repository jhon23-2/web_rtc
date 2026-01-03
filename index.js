const app = require("express")()
const server = require("http").createServer(app)
const cors = require("cors")
const socketIO = require("socket.io")
require("dotenv").config()

const PORT = process.env.SERVER_PORT || 5001


const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.get("/", (req, res) => {
  res.send("Server Application is running succesfully 🥳")
})
// app.use(express.json()) -> in case any issue keep in mind this over here

//handle memory storage for meetings 
const meetings = new Map()


io.on("connection", (socket) => {
  console.log("User connecte -> " + socket.id)

  // channel to create meeting   
  socket.on("create-meeting", (data) => {
    const { scheduledTime, creatorName } = data
    const meetingId = generateMeetingId()

    const meeting = {
      id: meetingId,
      scheduledTime,
      creatorName,
      createAt: new Date(),
      participants: [],
      status: "scheduled"
    }

    meetings.set(meetingId, meeting)
    socket.join(meetingId) // room 

    meeting.participants.push({
      id: socket.id,
      name: creatorName,
      joinedAt: new Date()
    })

    socket.emit("meeting-created", { meetingId, meeting })
    console.log("Meeting created ->  " + meetingId)
  })

  // channel to join meeting 
  socket.on("join-meeting", (data) => {
    const { meetingId, userName } = data
    const meeting = meetings.get(meetingId)

    if (!meeting) {
      socket.emit("meeting-not-found")
      return
    }

    // Check if meeting is still valid
    const now = new Date();
    const scheduledTime = new Date(meeting.scheduledTime);
    const timeDiff = Math.abs(now - scheduledTime);
    const minutesDiff = Math.floor(timeDiff / 60000);

    // Allow 5 minutes flexibility around scheduled time
    if (minutesDiff > 5 && meeting.status === 'scheduled') {
      socket.emit('meeting-expired');
      return;
    }

    socket.join(meetingId) // join to the room 

    meeting.participants.push({
      id: socket.id,
      name: userName,
      joinedAt: new Date()
    })

    if (meeting.participants.length >= 2) {
      meeting.status = "active"
    }

    // io.on emit to all user in a room even the event person generator 
    io.to(meetingId).emit("participant-joined", {
      participant: { id: socket.id, name: userName },
      participants: meeting.participants
    })

    socket.emit("meeting-joined", { meeting }) // emit only to the event person generator 

  })


  // WebRTC signaling
  socket.on('offer', (data) => {
    const { meetingId, offer, sender } = data;
    socket.to(meetingId).emit('offer', { offer, sender });
  });

  socket.on('answer', (data) => {
    const { meetingId, answer, sender } = data;
    socket.to(meetingId).emit('answer', { answer, sender });
  });

  socket.on('ice-candidate', (data) => {
    const { meetingId, candidate, sender } = data;
    socket.to(meetingId).emit('ice-candidate', { candidate, sender });
  });


  socket.on("disconnect", () => {
    console.log("User Disconnected -> " + socket.id)

    meetings.forEach((meeting, meetingId) => {
      const indexOfParticipant = meeting.participants.findIndex(p => p.id === socket.id);

      if (indexOfParticipant !== -1) {
        meeting.participants.splice(indexOfParticipant, 1); // remove the participant into the participants array 

        // notify all user in the room that one use is leave the meeting 
        io.to(meetingId).emit("participant-left", {
          participantId: socket.id,
          participants: meeting.participants.length
        })

        // if everybody letf the room or the meeting, clean up the meeting room 

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
  })

})


function generateMeetingId() {
  return Math.random().toString(30).substring(2).toUpperCase();
}

server.listen(PORT, () => {
  console.log("Server listen on " + PORT)
})