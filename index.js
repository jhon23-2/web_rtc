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



server.listen(PORT, () => {
  console.log("Server listen on " + PORT)
})