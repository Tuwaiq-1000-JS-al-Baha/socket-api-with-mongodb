const express = require("express")
const app = express()
const http = require("http")
const httpServer = http.createServer(app)
const socketio = require("socket.io")
const init = require("./utils/socket")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
const Joi = require("joi")
const JoiObjectId = require("joi-objectid")
Joi.objectid = JoiObjectId(Joi)
const users = require("./routes/users")
const messages = require("./routes/messages")

mongoose
  .connect(
    `mongodb+srv://user8465z:${process.env.MONGODB_PASSWORD}@cluster0.oxi8g.mongodb.net/socketDB?retryWrites=true&w=majority`
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.log("Error connecting to MongoDB", error))

const io = socketio(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
})

init(io)

app.use(express.json())
app.use(cors())

app.use("/api/auth", users)
app.use("/api/messages", messages)

httpServer.listen(5000, () => console.log("Websocket listening on port 5000"))

app.listen(4000, () => console.log("server listening on port 4000"))
