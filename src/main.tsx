import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import { AvatarConfigProvider } from "./hooks/useAvatarConfig";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AvatarConfigProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </AvatarConfigProvider>
  </React.StrictMode>
);
