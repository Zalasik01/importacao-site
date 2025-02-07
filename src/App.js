import React, { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Dropdowns from "./components/Dropdowns";
import CNPJInput from "./components/CNPJInput";
import FileUploader from "./components/FileUploader";
import 'font-awesome/css/font-awesome.min.css';
import "./App.css";

function App() {
  const [origem, setOrigem] = useState("");
  const [tipoConversao, setTipoConversao] = useState("");
  const [cnpj, setCNPJ] = useState("");
  const [file, setFile] = useState(null);

  return (
    <ErrorBoundary>
      <div className="App">
        <h1>Site para conversão de planilha - Altimus</h1>
        <Dropdowns origem={origem} setOrigem={setOrigem} tipoConversao={tipoConversao} setTipoConversao={setTipoConversao} />
        {origem && <CNPJInput cnpj={cnpj} setCNPJ={setCNPJ} />}
        {cnpj && origem && tipoConversao && (
          <FileUploader file={file} setFile={setFile} cnpj={cnpj} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;