import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import "./../../src/CustomToast.css";
import "./FileUploader.css";

// Serviços e hooks
import useJsonData from "../hooks/useJsonData";
import { DataConverter } from "../services/dataConverter";
import { ExcelUtils } from "../utils/excelUtils";

// Mappers para planilhas (mantidos para compatibilidade)
import mapSheetDataToPayloadClientes from "../mappers/revenda-mais/clientes";
import mapSheetDataToPayloadRdv from "../mappers/revenda-mais/receitas-despesas-veiculos";
import mapSheetDataToPayloadTitulosFinanceiros from "../mappers/revenda-mais/titulos-financeiros";
import mapSheetDataToPayloadVeiculos from "../mappers/revenda-mais/veiculos";

const COLUMN_NAMES = {
  modelo: "MODELO",
  fornecedor: "FORNECEDOR",
  cpfCnpjFornecedor: "CPF/CNPJ FORNECEDOR",
  cliente: "CLIENTE",
  cpfCnpjCliente: "CPF/CNPJ CLIENTE",
  dataCompra: "DATA COMPRA",
  dataVenda: "DATA VENDA",
  marca: "MARCA",
  chassi: "CHASSI",
  renavam: "RENAVAM",
  anoModelo: "ANO MODELO",
  cor: "COR",
  combustivel: "COMBUSTIVEL",
  placa: "PLACA",
  tipo: "TIPO",
  valorCompra: "VALOR COMPRA",
  valorVenda: "VALOR VENDA",
  km: "KM",
  pessoa: "pessoa",
  sexo: "sexo",
  nome: "nome",
  apelido: "apelido",
  cpfCnpj: "cpf_cnpj",
  email: "email",
  cep: "cep",
  rua: "rua",
  numero: "numero",
  complemento: "complemento",
  bairro: "bairro",
  cidade: "cidade",
  estado: "estado",
  dataNascimento: "data_nascimento",
  rg: "rg",
  ie: "ie",
  telefoneCelular: "telefone_celular",
  telefoneResidencial: "telefone_residencial",
  telefoneComercial: "telefone_comercial",
  documentoFornecedorCliente: "Documento Fornecedor/cliente",
  operacao: "Operação",
  dataEmissao: "Data emissão",
  dataVencimento: "Data vencimento",
  clienteFornecedor: "Cliente/Fornecedor",
  descricao: "Descrição",
  valorTitulo: "Valor título",
  dataPagamentoRecebimento: "Data pagamento/recebimento",
  formaPagamentoRecebimento: "Forma pagamento/recebimento",
};

const MESSAGES = {
  invalidFile: "Por favor, selecione um arquivo Excel válido.",
  noSheet: "Nenhuma planilha indexada. Por favor, envie uma planilha.",
  conversionStarted: "Conversão da planilha iniciada...",
  conversionSuccess: "Planilha convertida e pronta para download!",
};

function FileUploader({
  cnpj,
  file,
  setFile,
  posicao,
  tipoConversao,
  origem,
  marcarFornecedor,
  tipoFonte,
}) {
  const [sheetData, setSheetData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hook para gerenciar dados JSON
  const {
    jsonUrl,
    jsonData,
    jsonText,
    showJsonTextarea,
    loading: jsonLoading,
    loadJsonFromUrl,
    processJsonText,
    clearJsonData,
    updateJsonUrl,
    updateJsonText,
    toggleJsonTextarea,
  } = useJsonData();

  // Limpar dados quando o tipo de conversão ou fonte mudar
  useEffect(() => {
    setSheetData([]);
    setColumns([]);

    // Só limpar dados JSON completamente se mudar o tipo de conversão
    // Para Veículos com fonte JSON, preservar a URL
    if (tipoConversao !== "Veículos" || tipoFonte !== "JSON") {
      clearJsonData();
    }

    if (setFile) {
      setFile(null);
    }
  }, [tipoConversao, tipoFonte, setFile, clearJsonData]);

  const toastError = (msg) =>
    toast.error(msg, {
      autoClose: 2000,
      className: "toast-error",
      bodyClassName: "toast-body",
      closeButton: true,
      hideProgressBar: false,
    });

  const toastSuccess = (msg) =>
    toast.success(msg, {
      autoClose: 2000,
      className: "toast-success",
      bodyClassName: "toast-body",
      closeButton: true,
      hideProgressBar: false,
    });

  const toastInfo = (msg) =>
    toast.info(msg, {
      autoClose: 1000,
      className: "toast-info",
      bodyClassName: "toast-body",
      closeButton: true,
      hideProgressBar: false,
    });

  const handleJsonUrlChange = (event) => {
    updateJsonUrl(event.target.value);
  };

  const handleVisualizarJson = async () => {
    toastInfo("Carregando dados do JSON...");

    await loadJsonFromUrl(jsonUrl, {
      onSuccess: ({ data, columns, rows }) => {
        setColumns(columns);
        setSheetData(rows);
        toastSuccess(
          `Dados JSON carregados com sucesso! ${data.length} registros encontrados.`
        );
      },
      onError: (errorMessage) => {
        toastError(errorMessage);
      },
    });
  };

  const handleJsonTextChange = (event) => {
    updateJsonText(event.target.value);
  };

  const handleProcessJsonText = async () => {
    toastInfo("Processando JSON...");

    await processJsonText(jsonText, {
      onSuccess: ({ data, columns, rows }) => {
        setColumns(columns);
        setSheetData(rows);
        toastSuccess(
          `JSON processado com sucesso! ${data.length} registros encontrados.`
        );
      },
      onError: (errorMessage) => {
        toastError(errorMessage);
      },
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileType = selectedFile.type;
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "application/csv",
      ];
      const validExtensions = [".xls", ".xlsx", ".csv"];
      const fileExtension = selectedFile.name
        .slice(selectedFile.name.lastIndexOf("."))
        .toLowerCase();
      if (
        validTypes.includes(fileType) ||
        validExtensions.includes(fileExtension)
      ) {
        try {
          readExcelFile(selectedFile);
        } catch (error) {
          toastError("Erro ao ler o arquivo. Verifique o formato.");
        }
      } else {
        toastError(MESSAGES.invalidFile);
      }
    }
    event.target.value = "";
  };

  const readExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonSheet = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonSheet.length > 0) {
          const header = jsonSheet[0];
          const filledRows = jsonSheet.slice(1).map((row) => {
            const newRow = [...row];
            while (newRow.length < header.length) {
              newRow.push("");
            }
            return newRow;
          });
          setColumns(header);
          setSheetData(filledRows);
        }
      } catch (error) {
        toastError("Erro ao processar a planilha.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConvert = async () => {
    if (tipoConversao === "Veículos" && tipoFonte === "JSON") {
      if (jsonData.length === 0) {
        toastError(
          "Por favor, carregue dados do JSON primeiro usando o botão 'Visualizar'."
        );
        return;
      }
    } else {
      if (!file) {
        toastError(MESSAGES.noSheet);
        return;
      }
    }

    setLoading(true);
    toastInfo(MESSAGES.conversionStarted);

    try {
      let payload;

      if (tipoConversao === "Veículos" && tipoFonte === "JSON") {
        // Para Veículos com JSON, usar o DataConverter
        payload = DataConverter.convertJsonToVeiculos(jsonData, posicao, cnpj);
      } else if (origem === "Revenda Mais") {
        if (tipoConversao === "Titulos Financeiros") {
          payload = mapSheetDataToPayloadTitulosFinanceiros(
            sheetData,
            columns,
            cnpj,
            COLUMN_NAMES
          );
        } else if (tipoConversao === "Clientes") {
          payload = mapSheetDataToPayloadClientes(
            sheetData,
            columns,
            marcarFornecedor,
            COLUMN_NAMES
          );
        } else if (tipoConversao === "Receitas e Despesas Veículos") {
          payload = mapSheetDataToPayloadRdv(
            sheetData,
            columns,
            cnpj,
            COLUMN_NAMES
          );
        } else if (tipoConversao === "Veículos") {
          payload = mapSheetDataToPayloadVeiculos(
            sheetData,
            columns,
            posicao,
            cnpj,
            COLUMN_NAMES
          );
        } else {
          payload = [];
        }
      } else {
        payload = [];
      }

      await generateExcel(payload, cnpj);
      toastSuccess(MESSAGES.conversionSuccess);
    } catch (error) {
      toastError("Erro ao converter a planilha.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJsonSheet = async () => {
    if (jsonData.length === 0) {
      toastError(
        "Por favor, carregue dados do JSON primeiro usando o botão 'Visualizar'."
      );
      return;
    }

    setLoading(true);
    toastInfo("Gerando planilha com campos mapeados do JSON...");

    try {
      // Gerar payload mapeado usando o DataConverter
      const payload = DataConverter.convertJsonToVeiculos(
        jsonData,
        posicao,
        cnpj
      );

      // Gerar nome de arquivo específico para planilha mapeada
      const now = new Date();
      const formattedDate = `${now.getFullYear()}${String(
        now.getMonth() + 1
      ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
        now.getHours()
      ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

      const fileName = `Planilha_Mapeada_JSON_${posicao}_${formattedDate}_${cnpj}.xlsx`;

      const result = await ExcelUtils.generateExcelFile(payload, fileName);
      console.log(
        `Planilha mapeada gerada: ${result.fileName} com ${result.recordCount} registros`
      );

      toastSuccess(
        `Planilha mapeada gerada com sucesso! ${result.recordCount} registros processados.`
      );
    } catch (error) {
      console.error("Erro ao gerar planilha mapeada:", error);
      toastError("Erro ao gerar planilha mapeada do JSON.");
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = async (payload, cnpj) => {
    try {
      ExcelUtils.validatePayload(payload);

      const fileName = ExcelUtils.generateFileName(tipoConversao, tipoFonte, {
        posicao,
        cnpj,
      });

      const result = await ExcelUtils.generateExcelFile(payload, fileName);
      console.log(
        `Arquivo gerado: ${result.fileName} com ${result.recordCount} registros`
      );

      return result;
    } catch (error) {
      console.error("Erro ao gerar Excel:", error);
      throw error;
    }
  };

  return (
    <div className="file-upload-container">
      {tipoConversao === "Veículos" && tipoFonte === "JSON" ? (
        <div className="json-url-container">
          <div className="url-input-group">
            <input
              type="url"
              placeholder="https://exemplo.com/dados.json"
              value={jsonUrl}
              onChange={handleJsonUrlChange}
              className="json-url-input"
              disabled={loading || jsonLoading}
            />
            <button
              className="visualizar-button"
              onClick={handleVisualizarJson}
              disabled={loading || jsonLoading || !jsonUrl.trim()}
              aria-busy={loading || jsonLoading}
            >
              {loading || jsonLoading ? "Carregando..." : "Visualizar"}
            </button>
          </div>

          <div className="json-options">
            <button
              className="toggle-json-button"
              onClick={toggleJsonTextarea}
              disabled={loading || jsonLoading}
            >
              {showJsonTextarea ? "Usar URL" : "Colar JSON"}
            </button>
          </div>

          {showJsonTextarea && (
            <div className="json-textarea-container">
              <textarea
                placeholder="Cole aqui o conteúdo JSON..."
                value={jsonText}
                onChange={handleJsonTextChange}
                className="json-textarea"
                disabled={loading || jsonLoading}
                rows={10}
              />
              <button
                className="process-json-button"
                onClick={handleProcessJsonText}
                disabled={loading || jsonLoading || !jsonText.trim()}
                aria-busy={loading || jsonLoading}
              >
                {loading || jsonLoading ? "Processando..." : "Processar JSON"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <input
            type="file"
            id="file-upload"
            className="file-input"
            onChange={handleFileChange}
            aria-label="Selecionar arquivo Excel"
            disabled={loading}
          />
          <label
            htmlFor="file-upload"
            className="file-label"
            tabIndex={0}
            aria-label="Clique para selecionar um arquivo"
          >
            <span>Clique para selecionar um arquivo</span>
          </label>

          {file && <p>Arquivo selecionado: {file.name}</p>}
        </>
      )}

      {sheetData.length > 0 && (
        <>
          {tipoConversao === "Veículos" && tipoFonte === "JSON" ? (
            <button
              className="generate-sheet-button"
              onClick={handleGenerateJsonSheet}
              disabled={loading || jsonLoading}
              aria-busy={loading || jsonLoading}
            >
              {loading || jsonLoading ? "Gerando..." : "Gerar Planilha Mapeada"}
            </button>
          ) : (
            <button
              className="convert-button"
              onClick={handleConvert}
              disabled={loading || jsonLoading}
              aria-busy={loading || jsonLoading}
            >
              {loading || jsonLoading ? "Convertendo..." : "Converter"}
            </button>
          )}

          <div className="table-wrapper">
            <h3>
              {tipoConversao === "Link JSON" ||
              (tipoConversao === "Veículos" && tipoFonte === "JSON")
                ? `Dados do JSON importado: ${sheetData.length} registros`
                : `Espelho da planilha importada: ${sheetData.length} registros`}
            </h3>
            {tipoConversao === "Veículos" && tipoFonte === "JSON" && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "10px",
                }}
              >
                * Antes de realizar a importação verifique as informações
              </p>
            )}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {columns.map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheetData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((_, colIndex) => (
                        <td key={colIndex}>{row[colIndex]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FileUploader;
