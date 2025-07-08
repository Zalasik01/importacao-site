/**
 * Utilitários para geração de arquivos Excel
 */

import * as XLSX from "xlsx";

export class ExcelUtils {
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

    return `Exportacao_${tipoConversao.replace(
      /\s+/g,
      "_"
    )}_${posicao}_${formattedDate}_${cnpj}.xlsx`;
  }

  /**
   * Gera arquivo Excel a partir do payload
   */
  static async generateExcelFile(payload, fileName) {
    if (!Array.isArray(payload) || payload.length === 0) {
      throw new Error("Payload vazio ou inválido para geração do Excel");
    }

    const ws = XLSX.utils.json_to_sheet(payload);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Output");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    // Limpar URL para economizar memória
    setTimeout(() => URL.revokeObjectURL(link.href), 100);

    return { success: true, fileName, recordCount: payload.length };
  }

  /**
   * Valida payload antes da geração
   */
  static validatePayload(payload) {
    if (!payload) {
      throw new Error("Payload não fornecido");
    }

    if (!Array.isArray(payload)) {
      throw new Error("Payload deve ser um array");
    }

    if (payload.length === 0) {
      throw new Error("Payload vazio - nenhum dado para converter");
    }

    return true;
  }
}

export default ExcelUtils;
