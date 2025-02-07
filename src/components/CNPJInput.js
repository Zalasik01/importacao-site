import React from 'react';
import { validate } from 'cnpj'; // Mantemos apenas a validação

function CNPJInput({ cnpj, setCNPJ }) {
  const handleCNPJChange = (e) => {
    const rawCNPJ = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    setCNPJ(rawCNPJ); // Apenas armazena os números, sem formatação
  };

  return (
    <div>
      <label>CNPJ da Revenda</label>
      <input
        type="text"
        value={cnpj}
        onChange={handleCNPJChange}
        placeholder="Digite o CNPJ (somente números)"
      />
      {cnpj && !validate(cnpj) && <p style={{ color: 'red' }}><i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>CNPJ inválido</p>}
    </div>
  );
}

export default CNPJInput;
