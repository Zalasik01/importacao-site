import React from "react";
import './Dropdowns.css';

function Dropdowns({ origem, setOrigem, tipoConversao, setTipoConversao, posicao, setPosicao }) {
  const origens = ["Revenda Mais", "AutoConf", "AutoCerto"];
  const tiposConversao = ["Clientes", "Veículos"];
  const posicoes = ["Histórico", "Estoque"];

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
          <label>Posição dos Veículos:</label>
          <select value={posicao} onChange={(e) => setPosicao(e.target.value)}>
            <option value="">Selecione...</option>
            {posicoes.map((opcao) => (
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
