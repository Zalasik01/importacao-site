import React, { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Dropdowns from "./components/Dropdowns";
import CNPJInput from "./components/CNPJInput";
import FileUploader from "./components/FileUploader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'font-awesome/css/font-awesome.min.css';
import "./App.css";

function App() {
  const [origem, setOrigem] = useState("");
  const [tipoConversao, setTipoConversao] = useState("");
  const [posicao, setPosicao] = useState(""); 
  const [cnpj, setCNPJ] = useState("");
  const [file, setFile] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [marcarFornecedor, setMarcarFornecedor] = useState(false);

  useEffect(() => {
    setFile(null);
    setSheetData([]);
    setColumns([]);
  }, [origem, tipoConversao, posicao]);

  useEffect(() => {
    document.title = "Altimus - Conversão de Planilhas";
  }, []);

  const notifyConverting = () => toast.info("Conversão da planilha iniciada...", { 
    autoClose: 5000, 
    theme: "dark", 
    hideProgressBar: true
  });
  
  const notifyDownloadReady = () => toast.success("Planilha convertida e pronta para download!", { 
    autoClose: 5000, 
    theme: "dark", 
    hideProgressBar: true
  });

  return (
    <ErrorBoundary>
      <div className="App">
        <h1>Site para conversão de planilha - Altimus</h1>
        <Dropdowns
          origem={origem}
          setOrigem={setOrigem}
          tipoConversao={tipoConversao}
          setTipoConversao={setTipoConversao}
          posicao={posicao} 
          setPosicao={setPosicao} 
        />
        {origem && <CNPJInput cnpj={cnpj} setCNPJ={setCNPJ} />}
        {cnpj && origem && tipoConversao && (
          <>
            {tipoConversao === "Clientes" && (
            <div className="flag-container">
              <label title="Ao marcar esse checkbox a coluna Fornecedor será marcada automaticamente">
                <input
                  type="checkbox"
                  checked={marcarFornecedor}
                  onChange={() => setMarcarFornecedor(!marcarFornecedor)}
                />
                Fornecedor
              </label>
            </div>
          )}
            <FileUploader 
              file={file} 
              setFile={setFile} 
              cnpj={cnpj} 
              posicao={posicao} 
              tipoConversao={tipoConversao}
              origem={origem} 
              setSheetData={setSheetData} 
              setColumns={setColumns}
              notifyConverting={notifyConverting}
              notifyDownloadReady={notifyDownloadReady}
              marcarFornecedor={marcarFornecedor}
            />
          </>
        )}
        <p className="versao">Atualizado: 10/02/2025 09:18</p>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
