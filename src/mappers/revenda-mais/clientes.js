function mapSheetDataToPayloadClientes(sheetData, columns, marcarFornecedor, COLUMN_NAMES) {
  const colIdx = columns.reduce((acc, col, idx) => ({ ...acc, [col]: idx }), {});
  return sheetData
    .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ""))
    .map((row) => {
      const sexoValor = row[colIdx[COLUMN_NAMES.sexo]];
      const sexo = sexoValor && sexoValor.charAt(0).toUpperCase();
      const sexoFinal = sexo === "M" || sexo === "F" ? sexo : "O";

      const pessoa = isNaN(row[colIdx[COLUMN_NAMES.cpfCnpj]]) ? "Física" : "Jurídica";

      const cepValor = String(row[colIdx[COLUMN_NAMES.cep]] || "");
      const cep = cepValor.replace("-", "");

      const telefone1 = row[colIdx[COLUMN_NAMES.telefoneCelular]] || "";
      const telefone2 = row[colIdx[COLUMN_NAMES.telefoneResidencial]] || "";
      const telefone3 = row[colIdx[COLUMN_NAMES.telefoneComercial]] || "";

      const telefone1Field = telefone1 ? telefone1 : undefined;
      const tipoTelefone1Field = telefone1 ? "Celular" : undefined;

      const telefone2Field = telefone2 ? telefone2 : undefined;
      const tipoTelefone2Field = telefone2 ? "Celular" : undefined;

      const telefone3Field = telefone3 ? telefone3 : undefined;
      const tipoTelefone3Field = telefone3 ? "Celular" : undefined;

      const ruaValor = row[colIdx[COLUMN_NAMES.rua]] || "";
      const rua = ruaValor.split(",")[0].trim();

      return {
        Cod: "",
        Pessoa: row[colIdx[COLUMN_NAMES.pessoa]],
        Sexo: sexoFinal,
        "Nome Completo": row[colIdx[COLUMN_NAMES.nome]],
        Apelido: row[colIdx[COLUMN_NAMES.apelido]],
        CPFCNPJ: row[colIdx[COLUMN_NAMES.cpfCnpj]],
        Email: row[colIdx[COLUMN_NAMES.email]],
        Cep: cep,
        Rua: rua,
        Numero: row[colIdx[COLUMN_NAMES.numero]],
        Complemento: row[colIdx[COLUMN_NAMES.complemento]],
        Bairro: row[colIdx[COLUMN_NAMES.bairro]],
        Cidade: row[colIdx[COLUMN_NAMES.cidade]],
        UF: row[colIdx[COLUMN_NAMES.estado]],
        "Data Nascimento": row[colIdx[COLUMN_NAMES.dataNascimento]],
        "IE/RG": row[colIdx[COLUMN_NAMES.rg]] || row[colIdx[COLUMN_NAMES.ie]],
        Telefone1: telefone1Field,
        "Tipo Telefone 1": tipoTelefone1Field,
        "Telefone 2": telefone2Field,
        "Tipo Telefone 2": tipoTelefone2Field,
        Telefone3: telefone3Field,
        "Tipo Telefone 3": tipoTelefone3Field,
        Fornecedor: marcarFornecedor ? "Sim" : "",
      };
    });
}

export default mapSheetDataToPayloadClientes;
