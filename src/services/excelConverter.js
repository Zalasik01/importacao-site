/**
 * Conversores para dados de planilhas Excel
 */

// Mappers existentes
import mapSheetDataToPayloadClientes from "../mappers/revenda-mais/clientes";
import mapSheetDataToPayloadRdv from "../mappers/revenda-mais/receitas-despesas-veiculos";
import mapSheetDataToPayloadTitulosFinanceiros from "../mappers/revenda-mais/titulos-financeiros";
import mapSheetDataToPayloadVeiculos from "../mappers/revenda-mais/veiculos";

export class ExcelConverter {
  /**
   * Converte dados de planilha para payload específico
   */
  static convertSheetData(tipoConversao, sheetData, columns, params) {
    const { cnpj, marcarFornecedor, posicao, COLUMN_NAMES } = params;

    switch (tipoConversao) {
      case "Titulos Financeiros":
        return mapSheetDataToPayloadTitulosFinanceiros(
          sheetData,
          columns,
          cnpj,
          COLUMN_NAMES
        );

      case "Clientes":
        return mapSheetDataToPayloadClientes(
          sheetData,
          columns,
          marcarFornecedor,
          COLUMN_NAMES
        );

      case "Receitas e Despesas Veículos":
        return mapSheetDataToPayloadRdv(sheetData, columns, cnpj, COLUMN_NAMES);

      case "Veículos":
        return mapSheetDataToPayloadVeiculos(
          sheetData,
          columns,
          posicao,
          cnpj,
          COLUMN_NAMES
        );

      default:
        throw new Error(`Tipo de conversão não suportado: ${tipoConversao}`);
    }
  }

  /**
   * Valida se o tipo de conversão é suportado
   */
  static isSupported(tipoConversao) {
    const supportedTypes = [
      "Titulos Financeiros",
      "Clientes",
      "Receitas e Despesas Veículos",
      "Veículos",
    ];
    return supportedTypes.includes(tipoConversao);
  }
}

export default ExcelConverter;
