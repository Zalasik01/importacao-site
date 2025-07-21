/**
 * Conversores para dados JSON
 */

// Mappers JSON
import mapJsonToVeiculosPayload from "../mappers/json/veiculos";

export class JsonConverter {
  /**
   * Converte dados JSON para payload específico
   */
  static convertJsonData(tipoConversao, jsonData, params) {
    const { cnpj, posicao } = params;

    switch (tipoConversao) {
      case "Veículos":
        return mapJsonToVeiculosPayload(jsonData, posicao, cnpj);

      default:
        throw new Error(`Conversão JSON não implementada para: ${tipoConversao}`);
    }
  }

  /**
   * Converte JSON de veículos para o formato padrão (alias para compatibilidade)
   */
  static convertJsonToVeiculos(jsonData, posicao, cnpj) {
    return mapJsonToVeiculosPayload(jsonData, posicao, cnpj);
  }

  /**
   * Valida se o tipo de conversão JSON é suportado
   */
  static isSupported(tipoConversao) {
    const supportedTypes = ["Veículos"];
    return supportedTypes.includes(tipoConversao);
  }

  /**
   * Lista tipos de conversão suportados para JSON
   */
  static getSupportedTypes() {
    return ["Veículos"];
  }
}

export default JsonConverter;
