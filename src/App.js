import React, { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Dropdowns from "./components/Dropdowns";
import FileUploader from "./components/FileUploader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";
import "./App.css";
import packageJson from "../package.json";
import Modal from "react-modal";
import { FaQuestionCircle } from "react-icons/fa";

function App() {
  const [origem, setOrigem] = useState("");
  const [tipoConversao, setTipoConversao] = useState("");
  const [posicao, setPosicao] = useState("");
  const [cnpj, setCNPJ] = useState("");
  const [file, setFile] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [marcarFornecedor, setMarcarFornecedor] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setFile(null);
    setSheetData([]);
    setColumns([]);
  }, [origem, tipoConversao, posicao]);

  useEffect(() => {
    document.title = "Altimus - Conversão de Planilhas";
  }, []);

  const notifyConverting = () =>
    toast.info("Conversão da planilha iniciada...", {
      autoClose: 5000,
      theme: "dark",
      hideProgressBar: true,
    });

  const notifyDownloadReady = () =>
    toast.success("Planilha convertida e pronta para download!", {
      autoClose: 5000,
      theme: "dark",
      hideProgressBar: true,
    });

  const openHelpModal = () => setIsModalOpen(true);
  const closeHelpModal = () => setIsModalOpen(false);

  return (
    <ErrorBoundary>
      <div className="App">
        <div className="card-box">
          <div className="card-box-title">
            <h1>Site para conversão de planilha - Altimus</h1>
          </div>
          <Dropdowns
            origem={origem}
            setOrigem={setOrigem}
            tipoConversao={tipoConversao}
            setTipoConversao={setTipoConversao}
            posicao={posicao}
            setPosicao={setPosicao}
          />
          {origem && tipoConversao && (
            <div>
              <label>CNPJ da Revenda</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => {
                  const rawCNPJ = e.target.value.replace(/\D/g, "");
                  setCNPJ(rawCNPJ);
                }}
                placeholder="Digite o CNPJ (somente números)"
              />
            </div>
          )}
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

          <p className="versao">
            Versão:{" "}
            {new Date(packageJson.buildDate).toLocaleString("en-GB", {
              timeZone: "UTC",
            })}
          </p>

          <button className="help-button shadow" onClick={openHelpModal}>
            <FaQuestionCircle /> Ajuda
          </button>
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeHelpModal}
            contentLabel="Ajuda"
            className="help-modal"
            overlayClassName="help-overlay"
            closeTimeoutMS={300}
          >
            <h2 className="modal-title">Como usar</h2>
            <p>
              Utilize essa aplicação para fazer conversão de planilhas de outros
              sistemas para o sistema Altimus
            </p>
            <ul>
              <li>
                Selecione o programa de Origem (Revenda Mais, Auto-Conf, Boom
                Sistemas).
              </li>
              <li>
                Selecione o tipo de Importação (Clientes, Veículos, Titulos
                Financeiros).
              </li>
              <li>
                Após isso preencha o CNPJ da revenda (Utilizado para preencher
                os campos de CNPJ dentro da planilha de destino).
              </li>
              <li>
                Após a importação, verifique a planilha no{" "}
                <strong>"Espelho"</strong> que é apresentado.
              </li>
              <li>
                Caso esteja tudo certo, basta clicar em{" "}
                <strong>Converter</strong>.
              </li>
              <hr></hr>
              <li>
                Para Tipo de Importação Clientes, existe uma checkbox de{" "}
                <strong>"Fornecedor"</strong> com essa opção marcada a coluna é
                marcada como <strong>"Sim"</strong> para todos os registros.
              </li>
            </ul>
            <button onClick={closeHelpModal} className="modal-button">
              Fechar
            </button>
          </Modal>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        limit={3}
      />
    </ErrorBoundary>
  );
}

export default App;
