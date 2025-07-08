/**
 * Centralizador de conversores de dados
 */

import { ExcelConverter } from "./excelConverter";
import { JsonConverter } from "./jsonConverter";

export class DataConverter {
  /**
   * Converte dados de planilha para payload específico
   */
  static convertSheetData(tipoConversao, sheetData, columns, params) {
    return ExcelConverter.convertSheetData(
      tipoConversao,
      sheetData,
      columns,
      params
    );
  }

  /**
   * Converte dados JSON para payload específico
   */
  static convertJsonData(tipoConversao, jsonData, params) {
    return JsonConverter.convertJsonData(tipoConversao, jsonData, params);
  }

  /**
   * Converte JSON de veículos para o formato padrão (alias para compatibilidade)
   */
  static convertJsonToVeiculos(jsonData, posicao, cnpj) {
    return JsonConverter.convertJsonToVeiculos(jsonData, posicao, cnpj);
  }

  /**
   * Verifica se um tipo de conversão é suportado
   */
  static isSupported(tipoConversao, fonte = "excel") {
    if (fonte === "json") {
      return JsonConverter.isSupported(tipoConversao);
    }
    return ExcelConverter.isSupported(tipoConversao);
  }

  /**
   * Gera nome de arquivo baseado nos parâmetros
   */
  static generateFileName(tipoConversao, tipoFonte, params) {
    const { posicao, cnpj } = params;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

    if (tipoConversao === "Veículos" && tipoFonte === "JSON") {
      return `Exportacao_Veiculos_JSON_${posicao}_${formattedDate}_${cnpj}.xlsx`;
    }

    return `Exportacao_${tipoConversao}_${posicao}_${formattedDate}_${cnpj}.xlsx`;
  }
}

export default DataConverter;
