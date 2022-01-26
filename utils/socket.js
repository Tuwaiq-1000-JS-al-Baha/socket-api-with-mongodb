const jwt = require("jsonwebtoken")
const { Message } = require("../models/Message")
const { User } = require("../models/User")

let users = []

const init = io => {
  io.on("connection", socket => {
    console.log("someone is connected", socket.id)

    socket.on("sendMessageChat", message => {
      console.log("someone sent message in chat:", message)
      // socket.emit("receiveMessage", message)
      // socket.broadcast.emit("receiveMessage", message)
      const senderUser = users.find(user => user.id === socket.id)
      io.emit("receiveMessageChat", senderUser.username, message)
    })

    socket.on("sendDirectMessage", async (receiverId, message) => {
      const receiverUser = users.find(user => user.user._id == receiverId)
      const senderUser = users.find(user => user.socketId == socket.id)

      io.to(receiverUser.socketId).emit("receiveDirectMessage", senderUser.user, message)
      socket.emit("receiveDirectMessage", senderUser.user, message)

      const newMessage = new Message({
        sender: senderUser.user._id,
        receiver: receiverUser.user._id,
        message: message,
      })
      await newMessage.save()
    })

    socket.on("start", async token => {
      if (!token) return

      const decryptedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
      const userId = decryptedToken.id

      const user = await User.findById(userId)
      if (!user) return

      delete user._doc.password

      const newUser = {
        socketId: socket.id,
        user: user,
      }
      users.push(newUser)
      console.log("new user added:", userId)
      //   console.log("users:", users)

      const usersObject = users.map(user => user.user)
      io.emit("updateUsers", usersObject)
    })

    socket.on("disconnect", () => {
      console.log("someone disconnected")
      users = users.filter(user => user.socketId !== socket.id)
      //   console.log("users after disconnect:", users)

      const usersObject = users.map(user => user.user)
      io.emit("updateUsers", usersObject)
    })

    socket.on("stop", () => {
      console.log("someone disconnected")
      users = users.filter(user => user.socketId !== socket.id)
      //   console.log("users after disconnect:", users)

      const usersObject = users.map(user => user.user)
      io.emit("updateUsers", usersObject)
    })
  })
}

module.exports = init
