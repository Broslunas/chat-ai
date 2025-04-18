export default async function updateMessageCounter(username) {
  try {
    const res = await fetch("/api/messages/increment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      console.error(
        "Error al modificar contador de número de mensajes:",
        await res.text()
      );
      return;
    }

    const data = await res.json();
  } catch (error) {
    console.error("Error al modificar contador de número de mensajes:", error);
  }
}
