import "font-awesome/css/font-awesome.min.css";
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaQuestionCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import packageJson from "../package.json";
import "./App.css";
import Dropdowns from "./components/Dropdowns";
import ErrorBoundary from "./components/ErrorBoundary";
import FileUploader from "./components/FileUploader";

function App() {
  const [origem, setOrigem] = useState("");
  const [tipoConversao, setTipoConversao] = useState("");
  const [posicao, setPosicao] = useState("");
  const [tipoFonte, setTipoFonte] = useState(""); // Planilha ou JSON para veículos
  const [cnpj, setCNPJ] = useState("");
  const [file, setFile] = useState(null);
  const [marcarFornecedor, setMarcarFornecedor] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    setFile(null);
    // Só limpar tipoFonte se não for veículos, para preservar a seleção JSON
    if (tipoConversao !== "Veículos") {
      setTipoFonte("");
    }
  }, [origem, tipoConversao, posicao]);

  useEffect(() => {
    document.title = "Autos 360 - Conversão de Planilhas";
  }, []);

  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isModalOpen]);

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

  function formatCNPJ(value) {
    const v = value.replace(/\D/g, "").slice(0, 14);
    if (v.length <= 2) return v;
    if (v.length <= 5) return v.replace(/^(\d{2})(\d+)/, "$1.$2");
    if (v.length <= 8) return v.replace(/^(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
    if (v.length <= 12) return v.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, "$1.$2.$3/$4-$5");
  }

  const isCNPJValid = cnpj.length === 14;

  return (
    <ErrorBoundary>
      <div className="App">
        <div className="card-box">
          <div className="card-box-title">
            <h1 tabIndex={0}>Site para conversão de planilha - Altimus</h1>
          </div>
          <Dropdowns
            origem={origem}
            setOrigem={setOrigem}
            tipoConversao={tipoConversao}
            setTipoConversao={setTipoConversao}
            posicao={posicao}
            setPosicao={setPosicao}
            tipoFonte={tipoFonte}
            setTipoFonte={setTipoFonte}
          />
          {origem && tipoConversao && (
            <div style={{ position: "relative" }}>
              <label htmlFor="cnpj-input">CNPJ da Revenda</label>
              <input
                id="cnpj-input"
                type="text"
                value={formatCNPJ(cnpj)}
                onChange={(e) => {
                  const rawCNPJ = e.target.value.replace(/\D/g, "");
                  setCNPJ(rawCNPJ);
                }}
                placeholder="Digite o CNPJ (somente números)"
                aria-label="CNPJ da Revenda"
                autoComplete="off"
                maxLength={18}
                style={{
                  paddingRight: "34px",
                }}
              />
              {cnpj.length > 0 &&
                (isCNPJValid ? (
                  <FaCheckCircle
                    className="cnpj-icon"
                    style={{
                      color: "#2ecc40",
                      position: "absolute",
                      right: "10px",
                      top: "30px",
                      fontSize: "1.3em",
                      pointerEvents: "none",
                      background: "transparent",
                    }}
                  />
                ) : (
                  <FaTimesCircle
                    className="cnpj-icon invalid"
                    style={{
                      color: "#e74c3c",
                      position: "absolute",
                      right: "10px",
                      top: "30px",
                      fontSize: "1.3em",
                      pointerEvents: "none",
                      background: "transparent",
                    }}
                  />
                ))}
            </div>
          )}
          {cnpj &&
            origem &&
            tipoConversao &&
            (tipoConversao !== "Veículos" ||
              (tipoConversao === "Veículos" && posicao && tipoFonte)) && (
              <>
                {tipoConversao === "Clientes" && (
                  <div className="flag-container">
                    <label title="Ao marcar esse checkbox a coluna Fornecedor será marcada automaticamente">
                      <input
                        type="checkbox"
                        checked={marcarFornecedor}
                        onChange={() => setMarcarFornecedor(!marcarFornecedor)}
                        className="checkbox"
                      />
                      <span className="custom-checkbox" aria-hidden="true"></span>
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
                  notifyConverting={notifyConverting}
                  notifyDownloadReady={notifyDownloadReady}
                  marcarFornecedor={marcarFornecedor}
                  tipoFonte={tipoFonte}
                />
              </>
            )}

          <p className="versao" aria-label="Versão:">
            Versão:
            <>{new Date(packageJson.buildDate).toLocaleString("pt-BR")}</>
          </p>

          <button className="help-button shadow" onClick={openHelpModal} aria-label="Abrir ajuda">
            <FaQuestionCircle /> Ajuda
          </button>
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeHelpModal}
            contentLabel="Ajuda"
            className="help-modal"
            overlayClassName="help-overlay"
            closeTimeoutMS={300}
            ariaHideApp={false}
          >
            <div tabIndex={-1} ref={modalRef}>
              <h2 className="modal-title">Como usar</h2>
              <p>
                Utilize essa aplicação para fazer conversão de planilhas de outros sistemas para o
                sistema Altimus
              </p>
              <ul>
                <li>Selecione o programa de Origem (Revenda Mais, Auto-Conf, Boom Sistemas).</li>
                <li>Selecione o tipo de Importação (Clientes, Veículos, Titulos Financeiros).</li>
                <li>
                  Após isso preencha o CNPJ da revenda (Utilizado para preencher os campos de CNPJ
                  dentro da planilha de destino).
                </li>
                <li>
                  Após a importação, verifique a planilha no <strong>"Espelho"</strong> que é
                  apresentado.
                </li>
                <li>
                  Caso esteja tudo certo, basta clicar em <strong>Converter</strong>.
                </li>
                <hr />
                <li>
                  Para Tipo de Importação Clientes, existe uma checkbox de{" "}
                  <strong>"Fornecedor"</strong> com essa opção marcada a coluna é marcada como{" "}
                  <strong>"Sim"</strong> para todos os registros.
                </li>
              </ul>
              <button onClick={closeHelpModal} className="modal-button" autoFocus>
                Fechar
              </button>
            </div>
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
