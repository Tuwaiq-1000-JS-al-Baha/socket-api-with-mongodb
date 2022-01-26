const express = require("express")
const checkToken = require("../middleware/checkToken")
const validateId = require("../middleware/validateId")
const { Message } = require("../models/Message")
const router = express.Router()

router.get("/:receiverId", checkToken, validateId("receiverId"), async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.userId, receiver: req.params.receiverId },
      { receiver: req.userId, sender: req.params.receiverId },
    ],
  })
    .populate("sender")
    .populate("receiver")

  res.json(messages)
})

module.exports = router
