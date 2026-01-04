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


io.on("connection", (socket) => {
  console.log("Client Connected ", socket.id)

  socket.emit("send-id", { id: socket.id, createdAt: new Date() })


  // main funtionality 
  socket.on("call-user", ({ userId, signal, from, userName }) => {
    io.to(userId).emit("call-user", ({ signal, from, userName })) // only send to that specific user 
  })

  socket.on("answer-call", ({ to, signal }) => {
    io.to(to).emit("answer-call", signal)
  })

  // when user disconnected to the server 
  socket.on("disconnect", () => {
    socket.broadcast.emit("call-ended", { id: socket.id })
  })
})


server.listen(PORT, () => {
  console.log("Server listen on " + PORT)
})