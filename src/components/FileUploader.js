import React, { useState, useEffect } from "react";
import "./FileUploader.css";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "./../../src/CustomToast.css";
import "react-toastify/dist/ReactToastify.css";

// Importação dos mappers
import mapSheetDataToPayloadClientes from "../mappers/revenda-mais/clientes";
import mapSheetDataToPayloadVeiculos from "../mappers/revenda-mais/veiculos";
import mapSheetDataToPayloadTitulosFinanceiros from "../mappers/revenda-mais/titulos-financeiros";
import mapSheetDataToPayloadRdv from "../mappers/revenda-mais/receitas-despesas-veiculos";

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
}) {
  const [sheetData, setSheetData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonUrl, setJsonUrl] = useState("");
  const [jsonData, setJsonData] = useState([]);

  // Limpar dados quando o tipo de conversão mudar
  useEffect(() => {
    setSheetData([]);
    setColumns([]);
    setJsonUrl("");
    setJsonData([]);
    if (setFile) {
      setFile(null);
    }
  }, [tipoConversao, setFile]);

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
    setJsonUrl(event.target.value);
  };

  const handleVisualizarJson = async () => {
    if (!jsonUrl.trim()) {
      toastError("Por favor, insira uma URL válida.");
      return;
    }

    setLoading(true);
    toastInfo("Carregando dados do JSON...");

    try {
      const response = await fetch(jsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Extrair as colunas do primeiro objeto
        const firstItem = data[0];
        const columns = Object.keys(firstItem);
        
        // Converter os dados para o formato da tabela
        const rows = data.map(item => columns.map(col => item[col] || ""));
        
        setColumns(columns);
        setJsonData(data);
        setSheetData(rows);
        toastSuccess("Dados JSON carregados com sucesso!");
      } else {
        toastError("O JSON deve conter um array de objetos com dados.");
      }
    } catch (error) {
      console.error("Erro ao carregar JSON:", error);
      toastError("Erro ao carregar dados do JSON. Verifique a URL e tente novamente.");
    } finally {
      setLoading(false);
    }
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
    if (tipoConversao === "Link JSON") {
      if (jsonData.length === 0) {
        toastError("Por favor, carregue dados do JSON primeiro usando o botão 'Visualizar'.");
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

      if (tipoConversao === "Link JSON") {
        // Para Link JSON, usar os dados JSON diretamente
        payload = jsonData;
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

  const generateExcel = async (payload, cnpj) => {
    const ws = XLSX.utils.json_to_sheet(payload);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Output");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const now = new Date();
    const formattedDate = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    
    let fileName;
    if (tipoConversao === "Link JSON") {
      fileName = `Exportacao_JSON_${formattedDate}_${cnpj}.xlsx`;
    } else {
      fileName = `Exportacao_${tipoConversao}_${posicao}_${formattedDate}_${cnpj}.xlsx`;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="file-upload-container">
      {tipoConversao === "Link JSON" ? (
        <div className="json-url-container">
          <div className="url-input-group">
            <input
              type="url"
              placeholder="https://exemplo.com/dados.json"
              value={jsonUrl}
              onChange={handleJsonUrlChange}
              className="json-url-input"
              disabled={loading}
            />
            <button
              className="visualizar-button"
              onClick={handleVisualizarJson}
              disabled={loading || !jsonUrl.trim()}
              aria-busy={loading}
            >
              {loading ? "Carregando..." : "Visualizar"}
            </button>
          </div>
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
          <button
            className="convert-button"
            onClick={handleConvert}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Convertendo..." : "Converter"}
          </button>

          <div className="table-wrapper">
            <h3>{tipoConversao === "Link JSON" ? "Dados do JSON importado:" : "Espelho da planilha importada:"}</h3>
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
