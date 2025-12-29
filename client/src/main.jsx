import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { PhaseProvider } from "./states/PhaseContext"
import { PlayersProvider } from "./states/PlayersContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PhaseProvider>
      <PlayersProvider>
        <App />
      </PlayersProvider>
    </PhaseProvider>
  </React.StrictMode>
)
