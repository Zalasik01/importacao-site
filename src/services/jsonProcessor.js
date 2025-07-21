/**
 * Serviço para processar dados JSON de diferentes fontes
 */

import GenericJsonProcessor from "./genericJsonProcessor";
import Logger from "../utils/logger";

export class JsonProcessor {
  /**
   * Faz requisição para URL JSON com múltiplas estratégias de fallback
   * @param {string} url - URL do JSON
   * @returns {Promise<Array>} - Array de dados processados
   */
  static async fetchJsonData(url) {
    if (!url?.trim()) {
      throw new Error("URL não fornecida");
    }

    let data;
    let lastError;

    // Estratégia 1: Fetch normal com CORS
    try {
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = JSON.parse(text);
        }

        // Usar processador genérico para analisar a estrutura
        const analysis = GenericJsonProcessor.analyzeJsonStructure(data);
        Logger.log("Estrutura JSON detectada:", analysis.metadata);

        return analysis.data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      lastError = error;
      Logger.warn("Fetch com CORS falhou:", error.message);
    }

    // Estratégia 2: Fetch sem CORS
    try {
      const response = await fetch(url, {
        method: "GET",
        mode: "no-cors",
      });

      if (response.ok) {
        const text = await response.text();
        data = JSON.parse(text);

        const analysis = GenericJsonProcessor.analyzeJsonStructure(data);
        return analysis.data;
      }
    } catch (error) {
      lastError = error;
      Logger.warn("Fetch sem CORS falhou:", error.message);
    }

    // Estratégia 3: Proxy/CORS bypass (se disponível)
    const proxyUrls = [
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    ];

    for (const proxyUrl of proxyUrls) {
      try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const result = await response.json();

          // AllOrigins retorna { contents: "..." }
          const jsonText = result.contents || result;
          data = typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;

          const analysis = GenericJsonProcessor.analyzeJsonStructure(data);
          Logger.log("Dados carregados via proxy:", analysis.metadata);

          return analysis.data;
        }
      } catch (error) {
        Logger.warn(`Proxy ${proxyUrl} falhou:`, error.message);
        continue;
      }
    }

    // Se todas as estratégias falharam
    throw new Error(`Falha ao carregar JSON: ${lastError?.message || "Erro desconhecido"}`);
  }

  /**
   * Processa texto JSON usando processador genérico
   * @param {string} jsonText - Texto JSON
   * @returns {Array} - Array de dados processados
   */
  static processJsonText(jsonText) {
    if (!jsonText?.trim()) {
      throw new Error("Texto JSON não fornecido");
    }

    try {
      const data = JSON.parse(jsonText);
      const analysis = GenericJsonProcessor.analyzeJsonStructure(data);

      Logger.log("JSON processado:", analysis.metadata);

      return analysis.data;
    } catch (error) {
      throw new Error(`Erro ao processar JSON: ${error.message}`);
    }
  }

  /**
   * Converte dados JSON para formato de tabela usando processador genérico
   * @param {Array} jsonData - Array de dados JSON
   * @returns {Object} - { columns: Array, rows: Array }
   */
  static jsonToTableFormat(jsonData) {
    try {
      const result = GenericJsonProcessor.processGenericJson(jsonData);
      return {
        columns: result.columns,
        rows: result.rows,
      };
    } catch (error) {
      Logger.error("Erro ao converter para formato de tabela:", error);
      throw new Error(`Erro ao formatar tabela: ${error.message}`);
    }
  }

  /**
   * Analisa estrutura JSON e sugere possíveis caminhos para arrays
   * @param {any} jsonData - Dados JSON
   * @returns {Array} - Lista de caminhos sugeridos
   */
  static suggestDataPaths(jsonData) {
    try {
      return GenericJsonProcessor.suggestArrayPaths(jsonData);
    } catch (error) {
      Logger.error("Erro ao sugerir caminhos:", error);
      return [];
    }
  }

  /**
   * Obtém dados de um caminho específico no JSON
   * @param {any} jsonData - Dados JSON
   * @param {string} path - Caminho para os dados (ex: "data.items")
   * @returns {Array} - Array de dados no caminho especificado
   */
  static getDataFromPath(jsonData, path) {
    try {
      if (!path || path === "root") {
        return Array.isArray(jsonData) ? jsonData : [jsonData];
      }

      const pathParts = path.split(".");
      let current = jsonData;

      for (const part of pathParts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          throw new Error(`Caminho "${path}" não encontrado no JSON`);
        }
      }

      return Array.isArray(current) ? current : [current];
    } catch (error) {
      Logger.error("Erro ao obter dados do caminho:", error);
      throw new Error(`Erro ao acessar caminho "${path}": ${error.message}`);
    }
  }
}

export default JsonProcessor;
