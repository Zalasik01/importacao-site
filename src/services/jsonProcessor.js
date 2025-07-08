/**
 * Serviço para processar dados JSON de diferentes fontes
 */

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
        return this.normalizeJsonArray(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      lastError = error;
      console.warn("Fetch com CORS falhou:", error.message);
    }

    // Estratégia 2: Fetch sem CORS
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const text = await response.text();
        data = JSON.parse(text);
        return this.normalizeJsonArray(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      lastError = error;
      console.warn("Fetch sem CORS falhou:", error.message);
    }

    // Estratégia 3: Proxy CORS público
    try {
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
      const response = await fetch(proxyUrl, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (response.ok) {
        data = await response.json();
        return this.normalizeJsonArray(data);
      }
    } catch (error) {
      lastError = error;
      console.warn("CORS Anywhere falhou:", error.message);
    }

    // Estratégia 4: AllOrigins proxy
    try {
      const proxyUrl2 = `https://api.allorigins.win/get?url=${encodeURIComponent(
        url
      )}`;
      const response2 = await fetch(proxyUrl2);

      if (response2.ok) {
        const proxyData = await response2.json();
        data = JSON.parse(proxyData.contents);
        return this.normalizeJsonArray(data);
      }
    } catch (error) {
      lastError = error;
      console.warn("AllOrigins falhou:", error.message);
    }

    // Se todas as estratégias falharam, dar uma mensagem mais útil
    const errorMessage = this.buildErrorMessage(lastError);
    throw new Error(errorMessage);
  }

  /**
   * Constrói mensagem de erro mais útil baseada no último erro
   */
  static buildErrorMessage(lastError) {
    if (!lastError) {
      return "Erro desconhecido ao carregar JSON";
    }

    if (
      lastError.name === "TypeError" &&
      lastError.message.includes("Failed to fetch")
    ) {
      return "Erro de CORS ou conexão. A URL pode não permitir acesso externo. Tente usar a opção 'Colar JSON' para inserir os dados manualmente.";
    }

    if (lastError.message.includes("404")) {
      return "URL não encontrada (404). Verifique se o link está correto.";
    }

    if (lastError.message.includes("403")) {
      return "Acesso negado (403). A URL pode precisar de autenticação.";
    }

    if (lastError.message.includes("500")) {
      return "Erro interno do servidor (500). Tente novamente mais tarde.";
    }

    return `Erro ao carregar JSON: ${lastError.message}`;
  }

  /**
   * Normaliza dados JSON para array
   * @param {any} data - Dados JSON
   * @returns {Array} - Array normalizado
   */
  static normalizeJsonArray(data) {
    if (!data) {
      throw new Error("Dados JSON vazios");
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error("Array JSON vazio");
      }
      return data;
    }

    if (typeof data === "object") {
      return [data];
    }

    throw new Error("Formato JSON inválido - deve ser array ou objeto");
  }

  /**
   * Processa texto JSON colado manualmente
   * @param {string} jsonText - Texto JSON
   * @returns {Array} - Array de dados processados
   */
  static processJsonText(jsonText) {
    if (!jsonText?.trim()) {
      throw new Error("Texto JSON não fornecido");
    }

    try {
      const data = JSON.parse(jsonText);
      return this.normalizeJsonArray(data);
    } catch (error) {
      throw new Error(`JSON inválido: ${error.message}`);
    }
  }

  /**
   * Converte dados JSON para formato de tabela (rows/columns)
   * @param {Array} jsonData - Array de dados JSON
   * @returns {Object} - {columns, rows}
   */
  static jsonToTableFormat(jsonData) {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error("Dados JSON inválidos para conversão de tabela");
    }

    // Achatar objetos aninhados e coletar todas as possíveis chaves
    const allColumns = new Set();
    const flattenedData = jsonData.map((item) => this.flattenObject(item));

    // Coletar todas as colunas possíveis
    flattenedData.forEach((item) => {
      Object.keys(item).forEach((key) => allColumns.add(key));
    });

    const columns = Array.from(allColumns).sort();

    const rows = flattenedData.map((item) =>
      columns.map((col) => {
        const value = item[col];
        return this.formatCellValue(value);
      })
    );

    return { columns, rows };
  }

  /**
   * Achata um objeto aninhado para uma estrutura plana
   * @param {Object} obj - Objeto a ser achatado
   * @param {string} prefix - Prefixo para as chaves
   * @returns {Object} - Objeto achatado
   */
  static flattenObject(obj, prefix = "") {
    const flattened = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          // Recursivamente achatar objetos aninhados
          Object.assign(flattened, this.flattenObject(value, newKey));
        } else {
          flattened[newKey] = value;
        }
      }
    }

    return flattened;
  }

  /**
   * Formata valor da célula para exibição na tabela
   * @param {any} value - Valor a ser formatado
   * @returns {string} - Valor formatado
   */
  static formatCellValue(value) {
    if (value === null || value === undefined) {
      return "";
    }

    if (Array.isArray(value)) {
      // Para arrays, juntar os elementos com vírgula
      return value
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            return JSON.stringify(item);
          }
          return String(item);
        })
        .join(", ");
    }

    if (typeof value === "object") {
      // Para objetos que não foram achatados, converter para JSON
      return JSON.stringify(value);
    }

    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }

    return String(value);
  }
}
