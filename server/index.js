import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import { questions } from "../client/src/data/questions.js" // adjust path if needed

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: "*" }
})

// In-memory game storage
const games = new Map() // key: gameId, value: { players, currentQuestion, answers }

io.on("connection", (socket) => {
  console.log("Connected:", socket.id)

  socket.on("host:join", ({ gameId }) => {
    socket.join(gameId)
  })

  // Player joins a game
  socket.on("player:join", ({ name, gameId }) => {
    if (!games.has(gameId)) {
      games.set(gameId, { players: [], currentQuestion: 0, answers: {} })
    }
    const game = games.get(gameId)
    game.players.push({ id: socket.id, name })
    socket.join(gameId)

    // Notify host and all players
    io.to(gameId).emit("player:joined", game.players)
  })

  // Host starts quiz
  socket.on("quiz:start", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game) return
    sendQuestion(gameId)
  })

  // Phone submits answer
  socket.on("player:answer", ({ gameId, answerIndex }) => {
    const game = games.get(gameId)
    if (!game) return
    const player = game.players.find(p => p.id === socket.id)
    game.answers[player.name] = answerIndex
    io.to(gameId).emit("player:answer", { player: player.name })
  })

//   // Move to next question
//   socket.on("quiz:next", ({ gameId }) => {
//     const game = games.get(gameId)
//     if (!game) return
//     game.currentQuestion++
//     if (game.currentQuestion < questions.length) {
//       sendQuestion(gameId)
//     } else {
//       io.to(gameId).emit("quiz:finished")
//     }
//   })

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id)
    // Optionally remove player from any game
  })
})

// Helper to send question
function sendQuestion(gameId) {
  const game = games.get(gameId)
  const question = questions[game.currentQuestion]
  io.to(gameId).emit("quiz:question", {
    question: question.question,
    options: question.options,
    index: game.currentQuestion
  })
}

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})
