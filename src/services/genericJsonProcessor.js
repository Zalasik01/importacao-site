/**
 * Processador genérico de JSON para qualquer estrutura
 */

import Logger from "../utils/logger";

import ErrorHandler from "../utils/errorHandler";

export class GenericJsonProcessor {
  /**
   * Detecta automaticamente a estrutura do JSON e extrai os dados
   * @param {any} jsonData - Dados JSON de qualquer estrutura
   * @returns {Object} - { data: Array, structure: Object, metadata: Object }
   */
  static analyzeJsonStructure(jsonData) {
    try {
      Logger.log("Analisando estrutura do JSON:", jsonData);

      // Caso 1: JSON já é um array
      if (Array.isArray(jsonData)) {
        return {
          data: jsonData,
          structure: this.detectArrayStructure(jsonData),
          metadata: {
            type: "direct_array",
            count: jsonData.length,
            sample: jsonData[0] || null,
          },
        };
      }

      // Caso 2: JSON é um objeto com propriedades
      if (typeof jsonData === "object" && jsonData !== null) {
        const analysis = this.analyzeObjectStructure(jsonData);

        if (analysis.arrayFound) {
          return {
            data: analysis.data,
            structure: this.detectArrayStructure(analysis.data),
            metadata: {
              type: "nested_array",
              path: analysis.path,
              count: analysis.data.length,
              sample: analysis.data[0] || null,
              originalKeys: Object.keys(jsonData),
            },
          };
        }

        // Caso 3: JSON é um único objeto, transformar em array
        return {
          data: [jsonData],
          structure: this.detectObjectStructure(jsonData),
          metadata: {
            type: "single_object",
            count: 1,
            sample: jsonData,
            keys: Object.keys(jsonData),
          },
        };
      }

      // Caso 4: JSON é um valor primitivo
      return {
        data: [{ valor: jsonData }],
        structure: { valor: "string" },
        metadata: {
          type: "primitive",
          count: 1,
          sample: { valor: jsonData },
          originalType: typeof jsonData,
        },
      };
    } catch (error) {
      Logger.error("Erro ao analisar estrutura JSON:", error);
      throw new Error(`Erro ao analisar JSON: ${error.message}`);
    }
  }

  /**
   * Analisa um objeto JSON procurando por arrays
   * @param {Object} obj - Objeto JSON
   * @returns {Object} - Informações sobre arrays encontrados
   */
  static analyzeObjectStructure(obj, currentPath = "") {
    const results = [];

    for (const [key, value] of Object.entries(obj)) {
      const path = currentPath ? `${currentPath}.${key}` : key;

      if (Array.isArray(value)) {
        results.push({
          path,
          key,
          data: value,
          count: value.length,
          sample: value[0] || null,
        });
      } else if (typeof value === "object" && value !== null) {
        // Busca recursiva em objetos aninhados
        const nestedResults = this.analyzeObjectStructure(value, path);
        if (nestedResults.length > 0) {
          results.push(...nestedResults);
        }
      }
    }

    // Retornar o array mais promissor (maior quantidade de items)
    if (results.length > 0) {
      const bestResult = results.reduce((best, current) =>
        current.count > best.count ? current : best
      );

      return {
        arrayFound: true,
        data: bestResult.data,
        path: bestResult.path,
        key: bestResult.key,
        alternatives: results.filter((r) => r.path !== bestResult.path),
      };
    }

    return { arrayFound: false };
  }

  /**
   * Detecta a estrutura de um array de objetos
   * @param {Array} array - Array de dados
   * @returns {Object} - Estrutura detectada
   */
  static detectArrayStructure(array) {
    if (!Array.isArray(array) || array.length === 0) {
      return {};
    }

    const structure = {};
    const sample = array.slice(0, Math.min(10, array.length)); // Analisa até 10 items

    // Coletar todas as chaves possíveis
    const allKeys = new Set();
    sample.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    });

    // Analisar tipo de cada propriedade
    allKeys.forEach((key) => {
      const types = new Set();
      const values = [];

      sample.forEach((item) => {
        if (item && typeof item === "object" && key in item) {
          const value = item[key];
          types.add(typeof value);
          values.push(value);
        }
      });

      structure[key] = {
        type: this.determineDominantType(types),
        nullable: values.some((v) => v === null || v === undefined),
        sample: values.filter((v) => v !== null && v !== undefined).slice(0, 3),
      };
    });

    return structure;
  }

  /**
   * Detecta a estrutura de um objeto único
   * @param {Object} obj - Objeto a ser analisado
   * @returns {Object} - Estrutura detectada
   */
  static detectObjectStructure(obj) {
    const structure = {};

    Object.entries(obj).forEach(([key, value]) => {
      structure[key] = {
        type: Array.isArray(value) ? "array" : typeof value,
        nullable: value === null || value === undefined,
        sample: [value],
      };
    });

    return structure;
  }

  /**
   * Determina o tipo dominante de um conjunto de tipos
   * @param {Set} types - Set de tipos encontrados
   * @returns {string} - Tipo dominante
   */
  static determineDominantType(types) {
    if (types.size === 1) {
      return Array.from(types)[0];
    }

    // Prioridade: object > array > string > number > boolean
    const priority = ["object", "array", "string", "number", "boolean"];

    for (const type of priority) {
      if (types.has(type)) {
        return type;
      }
    }

    return "mixed";
  }

  /**
   * Converte dados analisados para formato de tabela
   * @param {Object} analysis - Resultado da análise
   * @returns {Object} - { columns: Array, rows: Array }
   */
  static toTableFormat(analysis) {
    const { data, structure, metadata } = analysis;

    if (!data || data.length === 0) {
      return { columns: [], rows: [] };
    }

    // Gerar colunas baseadas na estrutura
    const columns = Object.keys(structure).sort();

    // Gerar linhas
    const rows = data.map((item) => {
      if (typeof item !== "object" || item === null) {
        return [String(item)];
      }

      return columns.map((col) => {
        const value = item[col];

        if (value === null || value === undefined) {
          return "";
        }

        if (typeof value === "object") {
          return JSON.stringify(value);
        }

        return String(value);
      });
    });

    Logger.log(
      `Tabela gerada: ${columns.length} colunas, ${rows.length} linhas`
    );
    Logger.log("Estrutura detectada:", structure);
    Logger.log("Metadata:", metadata);

    return { columns, rows };
  }

  /**
   * Processa JSON genérico completo
   * @param {any} jsonData - Dados JSON
   * @returns {Object} - Resultado processado
   */
  static processGenericJson(jsonData) {
    try {
      // Analisar estrutura
      const analysis = this.analyzeJsonStructure(jsonData);

      // Converter para formato de tabela
      const tableFormat = this.toTableFormat(analysis);

      return {
        ...tableFormat,
        analysis,
        success: true,
      };
    } catch (error) {
      ErrorHandler.handleError(error, "Generic JSON Processing", false);
      throw error;
    }
  }

  /**
   * Sugere possíveis caminhos para arrays em JSON complexo
   * @param {any} jsonData - Dados JSON
   * @returns {Array} - Lista de caminhos possíveis
   */
  static suggestArrayPaths(jsonData) {
    if (Array.isArray(jsonData)) {
      return [
        {
          path: "root",
          description: "Array principal",
          count: jsonData.length,
        },
      ];
    }

    if (typeof jsonData !== "object" || jsonData === null) {
      return [];
    }

    const paths = [];

    function findArrays(obj, currentPath = "") {
      for (const [key, value] of Object.entries(obj)) {
        const path = currentPath ? `${currentPath}.${key}` : key;

        if (Array.isArray(value)) {
          paths.push({
            path,
            description: `Array em "${path}" com ${value.length} items`,
            count: value.length,
            sample: value[0] || null,
          });
        } else if (typeof value === "object" && value !== null) {
          findArrays(value, path);
        }
      }
    }

    findArrays(jsonData);

    // Ordenar por quantidade de items (maior primeiro)
    return paths.sort((a, b) => b.count - a.count);
  }
}

export default GenericJsonProcessor;
