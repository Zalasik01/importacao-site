/**
 * Sistema padronizado de tratamento de erros
 */

import { toast } from "react-toastify";
import Logger from "./logger";

export class ErrorHandler {
  static handleError(error, context = "Aplicação", showToast = true) {
    const errorInfo = {
      message: error.message || "Erro desconhecido",
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    };

    // Log do erro (apenas em desenvolvimento)
    Logger.error(`[${context}] Erro capturado:`, errorInfo);

    // Mostrar toast para o usuário (se solicitado)
    if (showToast) {
      const userMessage = this.getUserFriendlyMessage(error, context);
      toast.error(userMessage, {
        autoClose: 3000,
        className: "toast-error",
        bodyClassName: "toast-body",
        closeButton: true,
        hideProgressBar: false,
      });
    }

    return errorInfo;
  }

  static getUserFriendlyMessage(error, context) {
    const errorMessages = {
      "Network Error": "Erro de conexão. Verifique sua internet.",
      "Failed to fetch": "Não foi possível carregar os dados. Tente novamente.",
      "JSON Parse Error": "Formato de dados inválido.",
      "File Upload": "Erro ao fazer upload do arquivo.",
      "Data Conversion": "Erro ao converter os dados.",
      "Excel Generation": "Erro ao gerar planilha Excel.",
    };

    // Verificar se é um erro conhecido
    for (const [key, message] of Object.entries(errorMessages)) {
      if (error.message.includes(key) || context.includes(key)) {
        return message;
      }
    }

    // Mensagem genérica baseada no contexto
    switch (context) {
      case "JSON Loading":
        return "Erro ao carregar dados JSON. Verifique a URL ou formato.";
      case "File Processing":
        return "Erro ao processar arquivo. Verifique o formato.";
      case "Data Export":
        return "Erro ao exportar dados. Tente novamente.";
      default:
        return "Ocorreu um erro inesperado. Tente novamente.";
    }
  }

  static handleAsyncError(asyncFn, context = "Operação") {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error;
      }
    };
  }
}

export default ErrorHandler;
