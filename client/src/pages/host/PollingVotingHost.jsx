// PollingVoting.jsx - Component for voting on prompts
import { useEffect, useState } from "react"
import { Card, Row, Col, Container } from 'react-bootstrap'
import { socket } from "../../socket"
import { usePlayers } from "../../states/PlayersContext"

export const PollingVotingHost = ({ gameId }) => {
    const [currentPrompt, setCurrentPrompt] = useState(null)
    const [votes, setVotes] = useState([])
    const { players } = usePlayers()

    useEffect(() => {
        const handlePrompt = (promptData) => {
            console.log("Host received prompt:", promptData)
            setCurrentPrompt(promptData)
            setVotes([])
        }

        const handleVote = ({ player }) => {
            setVotes(prev => {
                if (prev.some(p => p === player)) return prev
                return [...prev, player]
            })
        }

        socket.on("polling:current-prompt", handlePrompt)
        socket.on("polling:vote-cast", handleVote)

        return () => {
            socket.off("polling:current-prompt", handlePrompt)
            socket.off("polling:vote-cast", handleVote)
        }
    }, [])

    // Auto-advance when all players voted
    useEffect(() => {
        if (
            currentPrompt &&
            players.length > 0 &&
            votes.length > 0 &&
            votes.length === players.length
        ) {
            console.log("All players voted, moving to next")
            socket.emit("polling:next-prompt", { gameId })
        }
    }, [votes, players, currentPrompt, gameId])

    return (
        <Container className="mt-4">
            <Card className="p-4 shadow" style={{ maxWidth: "700px", margin: "0 auto" }}>
                <Card.Body>
                    <Card.Title className="text-center mb-4 fs-3">
                        Who's Most Likely To...
                    </Card.Title>

                    <div className="text-center mb-4 p-4 bg-light rounded">
                        <h4>{currentPrompt?.prompt}</h4>
                        <small className="text-muted">
                            Submitted by: {currentPrompt?.submittedBy}
                        </small>
                    </div>

                    <div className="mb-4">
                        <h5>Votes Cast: {votes.length}/{players.length}</h5>
                        <Row className="g-2">
                            {votes.map((voter, i) => (
                                <Col key={i} xs={6} sm={4} md={3}>
                                    <div className="p-2 text-center border rounded"
                                        style={{ backgroundColor: "#f7f7f7" }}>
                                        {voter}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    <div className="text-center">
                        <h5 className="mb-3">Players</h5>
                        <Row className="g-2">
                            {players.map((player, i) => (
                                <Col key={i} xs={6} sm={4}>
                                    <div className="p-3 border rounded text-center"
                                        style={{
                                            backgroundColor: "#fff",
                                            fontSize: "1.1rem"
                                        }}>
                                        {player.name}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    )
}
