import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatBox() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", content: "Hola brother, en que puedo ayudarte" }, // Default AI message
  ]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const chatContainerRef = useRef(null);

  const sendMessage = async () => {
    if (!query.trim()) return;
    setChatHistory((prev) => [...prev, { sender: "user", content: query }]);
    setQuery("");
    setLoading(true);
    let aiMessage = { sender: "ai", content: "", loading: true };
    setChatHistory((prev) => [...prev, aiMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        if (chunk) {
          aiMessage.content += chunk;
          aiMessage.loading = false; // Remove spinner once the first chunk arrives
          setChatHistory((prev) => [...prev.slice(0, -1), aiMessage]);
        }
      }
    } catch (error) {
      setChatHistory((prev) => [
        ...prev.slice(0, -1),
        { sender: "ai", content: "Error al contactar con la IA." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div
      style={{
        backgroundColor: "#3a3a3a", // Fondo más claro
        padding: "15px", // Reducir padding
        borderRadius: "8px",
        width: "60%", // Reducir el ancho al 60%
        height: "400px", // Reducir la altura mínima
        margin: "20px auto", // Centrar horizontalmente
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Sombra para destacar
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        ref={chatContainerRef}
        style={{
          flex: "1", // Ocupa el espacio restante
          overflowY: "auto", // Habilitar scroll vertical
          padding: "10px",
          backgroundColor: "#2a2a2a", // Fondo más claro para el historial
          borderRadius: "5px",
          border: "1px solid #444",
          scrollbarWidth: "thin", // Estilizar barra de scroll
          scrollbarColor: "#e67e22 #2a2a2a", // Colores de la barra y el fondo
        }}
      >
        {chatHistory.map((message, index) => (
          <div
            key={index}
            style={{
              textAlign: message.sender === "user" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "12px",
                backgroundColor: message.sender === "user" ? "#e67e22" : "#444", // Naranja para usuario, gris oscuro para IA
                color: "#fff",
                maxWidth: "80%",
                wordWrap: "break-word",
              }}
            >
              {message.sender === "ai" && message.loading ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    border: "2px solid #e67e22", // Naranja para el borde
                    borderTop: "2px solid transparent", // Transparente en la parte superior
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite", // Animación de giro
                    marginRight: "5px",
                  }}
                ></span>
              ) : null}
              {message.sender === "ai" ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                message.content
              )}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px", // Espacio entre el textarea y el botón
          alignItems: "center", // Alinear verticalmente
          padding: "10px",
          backgroundColor: "#2a2a2a", // Fondo más claro para el input
          borderTop: "1px solid #444", // Línea superior
        }}
      >
        <textarea
          style={{
            flex: "1", // Ocupa todo el espacio disponible
            height: "35px", // Reducir altura del textarea
            backgroundColor: "#444", // Fondo gris oscuro
            color: "#f0f0f0", // Texto gris claro
            border: "1px solid #555", // Borde gris
            borderRadius: "5px",
            padding: "10px",
            resize: "none", // Deshabilitar redimensionamiento
          }}
          placeholder="Escribe tu mensaje..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown} // Enviar mensaje al presionar Enter
        />
        <button
          style={{
            backgroundColor: loading ? "#777" : "#e67e22", // Cambiar color si está cargando
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: "50%", // Hacer el botón circular
            cursor: loading ? "not-allowed" : "pointer", // Cambiar cursor si está cargando
            width: "35px", // Reducir tamaño del botón
            height: "35px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={sendMessage}
          disabled={loading}
        >
          <span
            style={{
              fontSize: "14px", // Reducir tamaño del icono
              lineHeight: "1",
            }}
          >
            ➤
          </span>
        </button>
      </div>
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}
