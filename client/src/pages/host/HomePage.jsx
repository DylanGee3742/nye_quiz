import React, { useState, useEffect } from "react";
import { Container, Button, Card, Row, Col } from "react-bootstrap";
import { socket } from "../../socket";
import { usePhase } from "../../states/PhaseContext";
import { usePlayers } from "../../states/PlayersContext";

export const HomePage = ({ gameId }) => {
    const { phase, setPhase } = usePhase()
    const { players, setPlayers } = usePlayers()

    const startQuiz = () => {
        setPhase("questions");
        socket.emit("quiz:start", { gameId });
    };

    useEffect(() => {
        socket.emit("host:join", { gameId });

        socket.on("player:joined", (playerList) => {
            setPlayers(playerList);
        });

        socket.on("quiz:finished", () => {
            setPhase("leaderboard");
        });

        return () => {
            socket.off("player:joined");
            socket.off("quiz:finished");
        };
    }, [gameId, setPhase]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                fontFamily: "Arial, sans-serif",
                background: "linear-gradient(to bottom, #f0f8ff, #d1e7ff)",
                padding: "40px 20px",
            }}
        >
            <h1 style={{ fontSize: "3rem", marginBottom: "20px", textAlign: "center" }}>
                🎉 NYE Quiz 🎉
            </h1>

            <h3 className="mb-4 text-center">Players Joined</h3>

            <Container className="mb-4">
                <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                    {players.map((player) => (
                        <Col key={player.id}>
                            <Card
                                style={{
                                    textAlign: "center",
                                    backgroundColor: "#ffffff",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    padding: "10px",
                                    transition: "transform 0.2s",
                                }}
                                className="player-card"
                            >
                                <Card.Body>
                                    <Card.Title style={{ fontSize: "1.5rem" }}>{player.name}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            <Button
                variant="primary"
                size="lg"
                onClick={startQuiz}
                style={{ padding: "10px 40px", fontSize: "1.2rem" }}
            >
                Start Quiz
            </Button>
        </div>
    );
};
