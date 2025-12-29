// PollingPromptSubmission.jsx - Component for submitting prompts
import { useEffect, useState } from "react"
import { Form, Button, Card, Row, Col, Container, Spinner } from 'react-bootstrap'
import { socket } from "../../socket"
import { usePlayers } from "../../states/PlayersContext"

export const PollingPromptSubmissionHost = ({ gameId }) => {
    const [prompts, setPrompts] = useState([])
    const { players } = usePlayers()

    useEffect(() => {
        const handlePromptSubmitted = ({ player, prompt }) => {
            setPrompts(prev => {
                if (prev.some(p => p.player === player)) return prev
                return [...prev, { player, prompt }]
            })
        }

        socket.on("polling:prompt-submitted", handlePromptSubmitted)

        return () => {
            socket.off("polling:prompt-submitted", handlePromptSubmitted)
        }
    }, [])

    // Auto-advance when all players submitted
    useEffect(() => {
        if (
            players.length > 0 &&
            prompts.length > 0 &&
            prompts.length === players.length
        ) {
            console.log("All prompts submitted, starting voting")
            socket.emit("polling:start-voting", { gameId })
        }
    }, [prompts, players, gameId])

    return (
        <Container className="mt-4">
            <Card className="p-4 shadow">
                <Card.Body>
                    <Card.Title className="text-center mb-4">
                        Waiting for Prompts...
                    </Card.Title>
                    
                    <h5 className="mb-3">
                        Prompts Submitted: {prompts.length}/{players.length}
                    </h5>

                    <Row className="g-2">
                        {prompts.map((item, i) => (
                            <Col key={i} xs={12} md={6}>
                                <div className="p-3 border rounded" style={{ backgroundColor: "#f7f7f7" }}>
                                    <strong>{item.player}:</strong> {item.prompt}
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    )
}