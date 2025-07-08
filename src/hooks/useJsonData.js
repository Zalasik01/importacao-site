import { useCallback, useState } from "react";
import { JsonProcessor } from "../services/jsonProcessor";

/**
 * Hook customizado para gerenciar dados JSON
 */
export function useJsonData() {
  const [jsonUrl, setJsonUrl] = useState("");
  const [jsonData, setJsonData] = useState([]);
  const [jsonText, setJsonText] = useState("");
  const [showJsonTextarea, setShowJsonTextarea] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preserveUrl, setPreserveUrl] = useState(false); // Flag para preservar URL

  /**
   * Carrega dados JSON de uma URL
   */
  const loadJsonFromUrl = async (url, { onSuccess, onError }) => {
    if (!url?.trim()) {
      onError("Por favor, insira uma URL válida.");
      return;
    }

    setLoading(true);

    try {
      const data = await JsonProcessor.fetchJsonData(url);
      const { columns, rows } = JsonProcessor.jsonToTableFormat(data);

      setJsonData(data);
      onSuccess({ data, columns, rows });
    } catch (error) {
      console.error("Erro ao carregar JSON:", error);
      onError(`Erro ao carregar JSON: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processa JSON de texto colado
   */
  const processJsonText = async (text, { onSuccess, onError }) => {
    if (!text?.trim()) {
      onError("Por favor, cole o JSON no campo de texto.");
      return;
    }

    setLoading(true);

    try {
      const data = JsonProcessor.processJsonText(text);
      const { columns, rows } = JsonProcessor.jsonToTableFormat(data);

      setJsonData(data);
      setShowJsonTextarea(false);
      onSuccess({ data, columns, rows });
    } catch (error) {
      console.error("Erro ao processar JSON:", error);
      onError(`Erro ao processar JSON: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpa todos os dados JSON
   */
  const clearJsonData = useCallback(() => {
    if (!preserveUrl) {
      setJsonUrl("");
    }
    setJsonData([]);
    setJsonText("");
    setShowJsonTextarea(false);
  }, [preserveUrl]);

  /**
   * Força limpeza completa incluindo URL
   */
  const forceFullClear = useCallback(() => {
    setJsonUrl("");
    setJsonData([]);
    setJsonText("");
    setShowJsonTextarea(false);
    setPreserveUrl(false);
  }, []);

  /**
   * Atualiza URL do JSON e define flag para preservar
   */
  const updateJsonUrl = useCallback((url) => {
    setJsonUrl(url);
    setPreserveUrl(!!url); // Preservar se há URL
  }, []);

  /**
   * Atualiza texto JSON
   */
  const updateJsonText = (text) => {
    setJsonText(text);
  };

  /**
   * Alterna exibição do textarea
   */
  const toggleJsonTextarea = () => {
    setShowJsonTextarea(!showJsonTextarea);
  };

  return {
    // Estados
    jsonUrl,
    jsonData,
    jsonText,
    showJsonTextarea,
    loading,

    // Ações
    loadJsonFromUrl,
    processJsonText,
    clearJsonData,
    forceFullClear,
    updateJsonUrl,
    updateJsonText,
    toggleJsonTextarea,
  };
}

export default useJsonData;
