import { useEffect, useState } from "react"
import { Form, Button, Card, Row, Col, Container, Spinner } from 'react-bootstrap'
import { socket } from "../../socket"
import { usePlayers } from "../../states/PlayersContext"


export const PollingPromptSubmissionPhone = ({ gameId }) => {
    const [prompt, setPrompt] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const submitPrompt = (e) => {
        e.preventDefault()
        if (!prompt.trim()) return alert("Please enter a prompt")
        
        socket.emit("polling:submit-prompt", { gameId, prompt: prompt.trim() })
        setSubmitted(true)
    }

    return (
        <Container style={{ maxWidth: "500px", marginTop: "50px" }}>
            {!submitted ? (
                <Card className="p-4 shadow">
                    <Card.Body>
                        <Card.Title className="mb-4 text-center">
                            Who's Most Likely To...
                        </Card.Title>

                        <Form onSubmit={submitPrompt}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="e.g., forget someone's birthday"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Complete the sentence: "Who's most likely to..."
                                </Form.Text>
                            </Form.Group>

                            <Button variant="secondary" type="submit" className="w-100">
                                Submit Prompt
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="p-4 shadow text-center">
                    <Card.Body>
                        <Spinner animation="border" className="mb-3" />
                        <h4>Waiting for others...</h4>
                        <p className="text-muted">Your prompt has been submitted</p>
                    </Card.Body>
                </Card>
            )}
        </Container>
    )
}
