function mapSheetDataToPayloadTitulosFinanceiros(sheetData, columns, cnpj, COLUMN_NAMES) {
  const colIdx = columns.reduce((acc, col, idx) => ({ ...acc, [col]: idx }), {});
  return sheetData.map((row) => {
    const documentoFornecedorCliente =
      row[colIdx[COLUMN_NAMES.documentoFornecedorCliente]] || "00.000.000/0000-00";
    return {
      id_titulo_financeiro: "",
      "CNPJ REVENDA": cnpj,
      OPERAÇÃO:
        row[colIdx[COLUMN_NAMES.operacao]] === "Pagar"
          ? "PAGAR"
          : row[colIdx[COLUMN_NAMES.operacao]] === "Receber"
            ? "RECEBER"
            : row[colIdx[COLUMN_NAMES.operacao]],
      "DATA EMISSÃO": row[colIdx[COLUMN_NAMES.dataEmissao]],
      "DATA VENCIMENTO": row[colIdx[COLUMN_NAMES.dataVencimento]],
      "NOME/RAZÃO SOCIAL CLIENTE/FORNECEDOR": row[colIdx[COLUMN_NAMES.clienteFornecedor]],
      "CPF/CNPJ CLIENTE/FORNECEDOR": documentoFornecedorCliente,
      DESCRIÇÃO: row[colIdx[COLUMN_NAMES.descricao]],
      "VALOR TOTAL": row[colIdx[COLUMN_NAMES.valorTitulo]],
      QUITADO: row[colIdx[COLUMN_NAMES.dataPagamentoRecebimento]] ? "true" : "false",
      CONTA: "t_conta | Pode ser solicitada para o N2",
      "CONTA FINANCEIRA": "t_conta_financeira | Pode ser solicitada para o N2",
      "FORMA DE PAGAMENTO": row[colIdx[COLUMN_NAMES.formaPagamentoRecebimento]],
      "DATA QUITACAO": row[colIdx[COLUMN_NAMES.dataPagamentoRecebimento]]
        ? row[colIdx[COLUMN_NAMES.dataPagamentoRecebimento]] + " 00:00:00"
        : "",
    };
  });
}

export default mapSheetDataToPayloadTitulosFinanceiros;
