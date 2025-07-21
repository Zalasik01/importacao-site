import { useEffect, useRef } from "react";
import "./Dropdowns.css";

function Dropdowns({
  origem,
  setOrigem,
  tipoConversao,
  setTipoConversao,
  posicao,
  setPosicao,
  tipoFonte,
  setTipoFonte,
}) {
  const origens = ["Revenda Mais", "AutoConf", "AutoCerto", "Generico"];
  const tiposConversao = [
    "Clientes",
    "Veículos",
    "Titulos Financeiros",
    "Receitas e Despesas Veículos",
  ];
  const posicoes = ["Histórico", "Estoque"];
  const tiposFonte = ["Planilha", "JSON"];

  const posicaoRef = useRef(null);

  useEffect(() => {
    if (posicaoRef.current) {
      if (posicao === "Estoque") {
        posicaoRef.current.style.background = "#1aad88";
        posicaoRef.current.style.borderColor = "#2ecc40";
        posicaoRef.current.style.color = "#fff";
        posicaoRef.current.style.fontWeight = "bold";
        posicaoRef.current.style.backgroundImage =
          "url(\"data:image/svg+xml,%3Csvg width='16' height='10' viewBox='0 0 16 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 2L8 8L14 2' stroke='%236e0ad6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";
        posicaoRef.current.style.backgroundRepeat = "no-repeat";
        posicaoRef.current.style.backgroundPosition = "right 12px center";
        posicaoRef.current.style.backgroundSize = "18px 12px";
      } else if (posicao === "Histórico") {
        posicaoRef.current.style.background = "#114D82";
        posicaoRef.current.style.borderColor = "#b39ddb";
        posicaoRef.current.style.color = "#fff";
        posicaoRef.current.style.fontWeight = "bold";
        posicaoRef.current.style.backgroundImage =
          "url(\"data:image/svg+xml,%3Csvg width='16' height='10' viewBox='0 0 16 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 2L8 8L14 2' stroke='%236e0ad6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";
        posicaoRef.current.style.backgroundRepeat = "no-repeat";
        posicaoRef.current.style.backgroundPosition = "right 12px center";
        posicaoRef.current.style.backgroundSize = "18px 12px";
      } else {
        posicaoRef.current.style.background = "";
        posicaoRef.current.style.borderColor = "";
        posicaoRef.current.style.color = "";
        posicaoRef.current.style.fontWeight = "";
        posicaoRef.current.style.backgroundImage = "";
        posicaoRef.current.style.backgroundRepeat = "";
        posicaoRef.current.style.backgroundPosition = "";
        posicaoRef.current.style.backgroundSize = "";
      }
    }
  }, [posicao]);

  return (
    <div className="drop">
      <div>
        <label>Origem da Planilha:</label>
        <select value={origem} onChange={(e) => setOrigem(e.target.value)}>
          <option value="">Selecione...</option>
          {origens.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      </div>

      {origem && (
        <div>
          <label>Tipo de Conversão:</label>
          <select value={tipoConversao} onChange={(e) => setTipoConversao(e.target.value)}>
            <option value="">Selecione...</option>
            {tiposConversao.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        </div>
      )}

      {tipoConversao === "Veículos" && (
        <div>
          <label htmlFor="posicao-veiculos">Posição dos Veículos:</label>
          <select
            id="posicao-veiculos"
            className="dropdown-profissional"
            value={posicao}
            onChange={(e) => setPosicao(e.target.value)}
            ref={posicaoRef}
          >
            <option value="">Selecione...</option>
            {posicoes.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        </div>
      )}

      {tipoConversao === "Veículos" && posicao && (
        <div>
          <label htmlFor="tipo-fonte">Fonte dos Dados:</label>
          <select id="tipo-fonte" value={tipoFonte} onChange={(e) => setTipoFonte(e.target.value)}>
            <option value="">Selecione...</option>
            {tiposFonte.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default Dropdowns;
