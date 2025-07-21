function mapSheetDataToPayloadVeiculos(sheetData, columns, posicao, cnpj, COLUMN_NAMES) {
  const colIdx = columns.reduce((acc, col, idx) => ({ ...acc, [col]: idx }), {});
  return sheetData.map((row) => {
    const modelo = row[colIdx[COLUMN_NAMES.modelo]];
    const complemento = modelo && modelo.includes(" ") ? modelo.split(" ").slice(1).join(" ") : "";
    const modeloFinal = modelo ? modelo.split(" ")[0] : "";

    let nomeProprietario, cpfCnpjProprietario;

    if (row[colIdx[COLUMN_NAMES.fornecedor]]) {
      nomeProprietario = row[colIdx[COLUMN_NAMES.fornecedor]];
      cpfCnpjProprietario = row[colIdx[COLUMN_NAMES.cpfCnpjFornecedor]];
    } else if (row[colIdx[COLUMN_NAMES.cliente]]) {
      nomeProprietario = row[colIdx[COLUMN_NAMES.cliente]];
      cpfCnpjProprietario = row[colIdx[COLUMN_NAMES.cpfCnpjCliente]];
    }

    return {
      ID: "",
      STATUS: posicao === "Estoque" ? 0 : 1,
      "DATA DE ENTRADA": row[colIdx[COLUMN_NAMES.dataCompra]]
        ? row[colIdx[COLUMN_NAMES.dataCompra]] + " 00:00:00"
        : "",
      "DATA E HORA DE SAIDA": row[colIdx[COLUMN_NAMES.dataVenda]]
        ? row[colIdx[COLUMN_NAMES.dataVenda]] + " 00:00:00"
        : "",
      MARCA: row[colIdx[COLUMN_NAMES.marca]],
      MODELO: modeloFinal,
      COMPLEMENTO: complemento,
      CHASSI: row[colIdx[COLUMN_NAMES.chassi]],
      RENAVAM: row[colIdx[COLUMN_NAMES.renavam]],
      "NUMERO MOTOR": "",
      "ANO FAB.": row[colIdx[COLUMN_NAMES.anoModelo]],
      "ANO MOD": row[colIdx[COLUMN_NAMES.anoModelo]],
      COR: row[colIdx[COLUMN_NAMES.cor]],
      COMBUSTIVEL:
        row[colIdx[COLUMN_NAMES.combustivel]] === "FLEX"
          ? "ALCOOL/GASOLINA"
          : row[colIdx[COLUMN_NAMES.combustivel]],
      PLACA: row[colIdx[COLUMN_NAMES.placa]],
      TIPO:
        row[colIdx[COLUMN_NAMES.tipo]] === "Consignado"
          ? "TERCEIRO_CONSIGNADO"
          : row[colIdx[COLUMN_NAMES.tipo]] === "Proprio"
            ? "PROPRIO"
            : row[colIdx[COLUMN_NAMES.tipo]],
      "VALOR COMPRA": row[colIdx[COLUMN_NAMES.valorCompra]],
      "VALOR A VISTA": row[colIdx[COLUMN_NAMES.valorVenda]],
      "VALOR DE VENDA": row[colIdx[COLUMN_NAMES.valorVenda]],
      "NOME PROPRIETARIO ENTRADA": nomeProprietario,
      "CPF/CNPJ PROPRIETARIO ENTRADA": cpfCnpjProprietario,
      KM: row[colIdx[COLUMN_NAMES.km]],
      PORTAS: "",
      CAMBIO: "",
      "CNPJ REVENDA": cnpj,
      ESTADO_CONVERSACAO: "Usado",
    };
  });
}

export default mapSheetDataToPayloadVeiculos;
