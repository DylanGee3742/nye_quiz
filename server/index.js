import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import { questions } from "../client/src/data/questions.js"

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: "*" }
})

// In-memory game storage
const games = new Map()

io.on("connection", (socket) => {
  console.log("Connected:", socket.id)

  // HOST EVENTS
  socket.on("host:join", ({ gameId }) => {
    socket.join(gameId)
    console.log(`Host joined game: ${gameId}`)
  })

  socket.on("quiz:start", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game) return

    console.log(`Quiz started for game: ${gameId}`)
    io.to(gameId).emit("quiz:start")
    sendQuestion(gameId)
  })

  socket.on("quiz:next", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game) return

    game.currentQuestion++

    if (game.currentQuestion < questions.length) {
      sendQuestion(gameId)
    } else {
      console.log(`Quiz finished for game: ${gameId}`)
      io.to(gameId).emit("show_leaderboard")
      io.to(gameId).emit("quiz:finished")
    }
  })

  socket.on("quiz:show_leaderboard", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game) return

    const leaderboard = game.players
      .map(player => ({
        player: player.name,
        score: game.answers[player.id] || 0
      }))
      .sort((a, b) => b.score - a.score) // Sort by score descending

    io.to(gameId).emit("leaderboard:players", leaderboard)
  })

  socket.on("quiz:random_task", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game || game.players.length === 0) return

    const randomPlayer = game.players[Math.floor(Math.random() * game.players.length)]
    io.to(randomPlayer.id).emit("private:prompt", {
      message: "You've been chosen 👀"
    })
  })

  // PLAYER EVENTS
  socket.on("player:join", ({ name, gameId }) => {
    // Initialize game if doesn't exist
    if (!games.has(gameId)) {
      games.set(gameId, {
        players: [],
        currentQuestion: 0,
        answers: {}
      })
    }

    const game = games.get(gameId)

    // Prevent duplicate joins
    if (!game.players.some(p => p.id === socket.id)) {
      game.players.push({ id: socket.id, name })
      console.log(`Player ${name} joined game: ${gameId}`)
    }

    socket.join(gameId)
    io.to(gameId).emit("player:joined", game.players)
  })

  socket.on("player:answer", ({ gameId, answerIndex }) => {
    const game = games.get(gameId)
    if (!game) return

    const player = game.players.find(p => p.id === socket.id)
    if (!player) return

    checkAnswer(answerIndex, game, player)
    io.to(gameId).emit("player:answer", { player: player.name })
  })

  socket.on("quiz:get-current-question", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game) return

    if (game.currentQuestion < questions.length) {
      // Send only to requesting phone
      socket.emit("quiz:question", {
        question: questions[game.currentQuestion].question,
        options: questions[game.currentQuestion].options,
        index: game.currentQuestion
      })
    } else {
      socket.emit("quiz:finished")
    }
  })

  // Add to your server.js

  // POLLING EVENTS
  socket.on("polling:submit-prompt", ({ gameId, prompt }) => {
    const game = games.get(gameId)
    if (!game) return

    const player = game.players.find(p => p.id === socket.id)
    if (!player) return

    // Initialize polling data if needed
    if (!game.polling) {
      game.polling = {
        prompts: [],
        currentPromptIndex: 0,
        votes: {}
      }
    }

    game.polling.prompts.push({
      id: game.polling.prompts.length,
      prompt,
      submittedBy: player.name
    })

    console.log(`${player.name} submitted prompt: ${prompt}`)
    io.to(gameId).emit("polling:prompt-submitted", {
      player: player.name,
      prompt
    })
  })

  socket.on("polling:start-voting", ({ gameId }) => {
    console.log('start voting')
    const game = games.get(gameId)
    if (!game || !game.polling) return

    // Send first prompt
    sendCurrentPrompt(gameId)
  })

  socket.on("polling:cast-vote", ({ gameId, promptId, votedFor }) => {
    const game = games.get(gameId)
    if (!game || !game.polling) return

    const player = game.players.find(p => p.id === socket.id)
    if (!player) return

    // Initialize votes for this prompt
    if (!game.polling.votes[promptId]) {
      game.polling.votes[promptId] = []
    }

    // Record vote
    game.polling.votes[promptId].push({
      voter: player.name,
      votedFor: votedFor
    })

    console.log(`${player.name} voted for ${votedFor}`)
    io.to(gameId).emit("polling:vote-cast", { player: player.name })
  })

  socket.on("polling:next-prompt", ({ gameId }) => {
    const game = games.get(gameId)
    if (!game || !game.polling) return

    // Calculate points for current prompt
    calculatePollingPoints(gameId)

    game.polling.currentPromptIndex++

    if (game.polling.currentPromptIndex < game.polling.prompts.length) {
      sendCurrentPrompt(gameId)
    } else {
      console.log(`Polling finished for game: ${gameId}`)
      io.to(gameId).emit("polling:finished")
    }
  })

  // CLEANUP
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id)

    // Remove player from all games
    for (const [gameId, game] of games.entries()) {
      const playerIndex = game.players.findIndex(p => p.id === socket.id)
      if (playerIndex !== -1) {
        const player = game.players[playerIndex]
        game.players.splice(playerIndex, 1)
        console.log(`Player ${player.name} left game: ${gameId}`)

        // Notify remaining players
        io.to(gameId).emit("player:joined", game.players)

        // Clean up empty games
        if (game.players.length === 0) {
          games.delete(gameId)
          console.log(`Game ${gameId} deleted (no players)`)
        }
      }
    }
  })
})

// HELPER FUNCTIONS
function sendQuestion(gameId) {
  const game = games.get(gameId)
  if (!game) return

  const question = questions[game.currentQuestion]
  io.to(gameId).emit("quiz:question", {
    question: question.question,
    options: question.options,
    index: game.currentQuestion
  })
}

function checkAnswer(userIndex, game, player) {
  try {
    // Initialize player score
    if (!game.answers[player.id]) {
      game.answers[player.id] = 0
    }

    // Find current question and check answer
    const currentQuestion = questions.find(q => q.id === game.currentQuestion)

    if (currentQuestion && currentQuestion.correctIndex === userIndex) {
      game.answers[player.id] += 1
      console.log(`${player.name} answered correctly!`)
    }
  } catch (e) {
    console.error("Error checking answer:", e)
  }
}

  // Helper functions
  function sendCurrentPrompt(gameId) {
    const game = games.get(gameId)
    if (!game || !game.polling) return

    const prompt = game.polling.prompts[game.polling.currentPromptIndex]
    console.log(prompt)
    io.to(gameId).emit("polling:current-prompt", prompt)
  }

  function calculatePollingPoints(gameId) {
    const game = games.get(gameId)
    if (!game || !game.polling) return

    const promptId = game.polling.currentPromptIndex
    const votes = game.polling.votes[promptId] || []

    // Count votes for each player
    const voteCounts = {}
    votes.forEach(vote => {
      voteCounts[vote.votedFor] = (voteCounts[vote.votedFor] || 0) + 1
    })

    // Find the player(s) with most votes
    const maxVotes = Math.max(...Object.values(voteCounts), 0)

    // Award points to voters who voted for the majority
    votes.forEach(vote => {
      if (voteCounts[vote.votedFor] === maxVotes) {
        const voter = game.players.find(p => p.name === vote.voter)
        if (voter) {
          game.answers[voter.id] = (game.answers[voter.id] || 0) + 1
        }
      }
    })

    console.log(`Prompt ${promptId} results:`, voteCounts)
  }

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})