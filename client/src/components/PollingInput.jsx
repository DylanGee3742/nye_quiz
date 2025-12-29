import { useState } from "react"
import { Form, Button, Container } from "react-bootstrap"
import { questions } from "../data/questions"

export const PollingInput = () => {
    const [prompt, setPrompt] = useState('')

    const submitPrompt = () => {
        questions
    }

    return (

        <Form onSubmit={submitPrompt}>
            <Container style={{ maxWidth: "500px" }}>
                <h2 className="mb-2 text-center">Who’s most likely to…</h2>
                <p className="text-muted text-center mb-4">
                    Finish the show prompt
                </p>

                <Form.Group className="mb-3" controlId="promptInput">
                    <Form.Control
                        type="text"
                        placeholder="e.g. go to prison"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        required
                    />
                </Form.Group>

                <div className="d-grid">
                    <Button type="submit" variant="primary">
                        Submit Prompt
                    </Button>
                </div>
            </Container>
        </Form>

    )
}