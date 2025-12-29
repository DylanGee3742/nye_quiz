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
    io.to(gameId).emit("quiz:start", { gameId })
    sendQuestion(gameId)
  })


  // Phone submits answer
  socket.on("player:answer", ({ gameId, answerIndex }) => {
    const game = games.get(gameId)
    if (!game) return
    const player = game.players.find(p => p.id === socket.id)
    checkAnswer(answerIndex, game, player)
    io.to(gameId).emit("player:answer", { player: player.name })
  })

  // Move to next question
  socket.on("quiz:next", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game) return
    game.currentQuestion++
    if (game.currentQuestion < questions.length) {
      sendQuestion(gameId)
    } else {
      io.to(gameId).emit("quiz:finished")
    }
  })

  socket.on("quiz:scores", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game) return
    io.to(gameId).emit("player:scores", { scores: game.answers })
  })

  socket.on("quiz:random_task", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game) return
    pickRandomPlayer(gameId)
  })

  socket.on("quiz:show_leaderboard", ({ gameId }) => {
    const game = games.get(gameId)
    const leaderboard = []
    for (const player of game.players) {
      if (game.answers[player.id]) {
        leaderboard.push({
          player: player.name,
          score: game.answers[player.id]
        })
      }
    }
    io.to(gameId).emit("leaderboard:players", leaderboard)
  })


  socket.on("quiz:get-current-question", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game) return
    if (game.currentQuestion < questions.length) {
      sendQuestion(gameId)
    } else {
      io.to(gameId).emit("quiz:finished")
    }
  })

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

const checkAnswer = (userIndex, game, player) => {
  try {
    if (!game.answers[player.id]) {
      game.answers[player.id] = 0
    }
    for (let question of questions) {
      if (game.currentQuestion == question.id) {
        if (question.correctIndex === userIndex) {
          game.answers[player.id] += 1
        } else {
          return
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
}

function pickRandomPlayer(gameId) {
  const game = games.get(gameId)
  const player =
    game.players[Math.floor(Math.random() * game.players.length)]

  io.to(player.id).emit("private:prompt", {
    message: "You’ve been chosen 👀"
  })
}

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})
