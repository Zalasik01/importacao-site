import React from "react";

function ErrorPage() {
  return (
    <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
      <h1>Ops! Algo deu errado 😢</h1>
      <p>Houve um erro ao carregar a aplicação.</p>
      <button onClick={() => window.location.reload()}>Recarregar</button>
    </div>
  );
}

export default ErrorPage;
