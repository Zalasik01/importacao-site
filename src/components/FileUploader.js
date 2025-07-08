import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import "./../../src/CustomToast.css";
import "./FileUploader.css";

// Importação dos mappers
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
  const [jsonUrl, setJsonUrl] = useState("");
  const [jsonData, setJsonData] = useState([]);
  const [showJsonTextarea, setShowJsonTextarea] = useState(false);
  const [jsonText, setJsonText] = useState("");

  // Limpar dados quando o tipo de conversão ou fonte mudar
  useEffect(() => {
    setSheetData([]);
    setColumns([]);
    setJsonUrl("");
    setJsonData([]);
    setShowJsonTextarea(false);
    setJsonText("");
    if (setFile) {
      setFile(null);
    }
  }, [tipoConversao, tipoFonte, setFile]);

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
      // Primeira tentativa: requisição normal
      let response;
      let data;

      try {
        response = await fetch(jsonUrl, {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // Tentar interpretar como JSON mesmo se o content-type não estiver correto
          const text = await response.text();
          data = JSON.parse(text);
        } else {
          data = await response.json();
        }
      } catch (mainError) {
        console.log(
          "Tentativa principal falhou, tentando alternativas...",
          mainError
        );

        // Segunda tentativa: sem mode cors
        try {
          response = await fetch(jsonUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          });

          if (response.ok) {
            const text = await response.text();
            data = JSON.parse(text);
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (secondError) {
          console.log(
            "Segunda tentativa falhou, tentando proxy...",
            secondError
          );

          // Terceira tentativa: com proxy CORS
          try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
              jsonUrl
            )}`;
            const proxyResponse = await fetch(proxyUrl);

            if (proxyResponse.ok) {
              const proxyData = await proxyResponse.json();
              data = JSON.parse(proxyData.contents);
            } else {
              throw new Error("Proxy também falhou");
            }
          } catch (proxyError) {
            console.log("Proxy falhou, tentando outro proxy...", proxyError);

            // Quarta tentativa: outro proxy
            try {
              const proxyUrl2 = `https://corsproxy.io/?${encodeURIComponent(
                jsonUrl
              )}`;
              const proxyResponse2 = await fetch(proxyUrl2);

              if (proxyResponse2.ok) {
                data = await proxyResponse2.json();
              } else {
                throw new Error("Todos os métodos falharam");
              }
            } catch (finalError) {
              // Se chegou até aqui, mostrar erro detalhado
              let errorMessage = "Erro ao carregar JSON. ";

              if (
                mainError.name === "TypeError" &&
                mainError.message.includes("Failed to fetch")
              ) {
                errorMessage +=
                  "Problema de CORS ou conexão. Use a opção 'Colar JSON' para inserir os dados manualmente.";
              } else if (mainError.message.includes("404")) {
                errorMessage +=
                  "URL não encontrada (404). Verifique se o link está correto.";
              } else if (mainError.message.includes("403")) {
                errorMessage += "Acesso negado (403). Verifique as permissões.";
              } else if (mainError.message.includes("500")) {
                errorMessage += "Erro interno do servidor (500).";
              } else {
                errorMessage += mainError.message;
              }

              throw new Error(errorMessage);
            }
          }
        }
      }

      if (Array.isArray(data) && data.length > 0) {
        // Extrair as colunas do primeiro objeto
        const firstItem = data[0];
        const columns = Object.keys(firstItem);

        // Converter os dados para o formato da tabela
        const rows = data.map((item) => columns.map((col) => item[col] || ""));

        setColumns(columns);
        setJsonData(data);
        setSheetData(rows);
        toastSuccess(
          `Dados JSON carregados com sucesso! ${data.length} registros encontrados.`
        );
      } else if (Array.isArray(data) && data.length === 0) {
        toastError("O JSON está vazio ou não contém dados.");
      } else if (typeof data === "object" && data !== null) {
        // Se retornar um objeto único, transformar em array
        const columns = Object.keys(data);
        const rows = [columns.map((col) => data[col] || "")];

        setColumns(columns);
        setJsonData([data]);
        setSheetData(rows);
        toastSuccess(
          "Dados JSON carregados com sucesso! 1 registro encontrado."
        );
      } else {
        toastError(
          "O JSON deve conter um array de objetos ou um objeto com dados."
        );
      }
    } catch (error) {
      console.error("Erro detalhado ao carregar JSON:", error);
      toastError(error.message || "Erro inesperado ao carregar dados do JSON.");
    } finally {
      setLoading(false);
    }
  };

  const handleJsonTextChange = (event) => {
    setJsonText(event.target.value);
  };

  const handleProcessJsonText = () => {
    if (!jsonText.trim()) {
      toastError("Por favor, cole o JSON no campo de texto.");
      return;
    }

    setLoading(true);
    toastInfo("Processando JSON...");

    try {
      const data = JSON.parse(jsonText);

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        const columns = Object.keys(firstItem);
        const rows = data.map((item) => columns.map((col) => item[col] || ""));

        setColumns(columns);
        setJsonData(data);
        setSheetData(rows);
        toastSuccess(
          `JSON processado com sucesso! ${data.length} registros encontrados.`
        );
        setShowJsonTextarea(false);
      } else if (Array.isArray(data) && data.length === 0) {
        toastError("O JSON está vazio ou não contém dados.");
      } else if (typeof data === "object" && data !== null) {
        const columns = Object.keys(data);
        const rows = [columns.map((col) => data[col] || "")];

        setColumns(columns);
        setJsonData([data]);
        setSheetData(rows);
        toastSuccess("JSON processado com sucesso! 1 registro encontrado.");
        setShowJsonTextarea(false);
      } else {
        toastError(
          "O JSON deve conter um array de objetos ou um objeto com dados."
        );
      }
    } catch (error) {
      console.error("Erro ao processar JSON:", error);
      toastError("JSON inválido. Verifique a formatação e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const mapJsonDataToVeiculosPayload = (jsonData, posicao, cnpj) => {
    return jsonData.map((item) => {
      // Mapear os campos do JSON para o formato padrão de veículos
      const modelo = item.modelo || item.MODELO || "";
      const complemento =
        modelo && modelo.includes(" ")
          ? modelo.split(" ").slice(1).join(" ")
          : "";
      const modeloFinal = modelo ? modelo.split(" ")[0] : "";

      // Determinar proprietário baseado nos dados disponíveis
      let nomeProprietario = "";
      let cpfCnpjProprietario = "";

      if (item.fornecedor || item.FORNECEDOR) {
        nomeProprietario = item.fornecedor || item.FORNECEDOR;
        cpfCnpjProprietario =
          item.cpfCnpjFornecedor ||
          item["CPF/CNPJ FORNECEDOR"] ||
          item.cpf_cnpj_fornecedor;
      } else if (item.cliente || item.CLIENTE) {
        nomeProprietario = item.cliente || item.CLIENTE;
        cpfCnpjProprietario =
          item.cpfCnpjCliente ||
          item["CPF/CNPJ CLIENTE"] ||
          item.cpf_cnpj_cliente;
      }

      return {
        ID: "",
        STATUS: posicao === "Estoque" ? 0 : 1,
        "DATA DE ENTRADA":
          item.dataCompra || item["DATA COMPRA"] || item.data_compra
            ? (item.dataCompra || item["DATA COMPRA"] || item.data_compra) +
              " 00:00:00"
            : "",
        "DATA E HORA DE SAIDA":
          item.dataVenda || item["DATA VENDA"] || item.data_venda
            ? (item.dataVenda || item["DATA VENDA"] || item.data_venda) +
              " 00:00:00"
            : "",
        MARCA: item.marca || item.MARCA || "",
        MODELO: modeloFinal,
        COMPLEMENTO: complemento,
        CHASSI: item.chassi || item.CHASSI || "",
        RENAVAM: item.renavam || item.RENAVAM || "",
        "NUMERO MOTOR": "",
        "ANO FAB.":
          item.anoModelo || item["ANO MODELO"] || item.ano_modelo || "",
        "ANO MOD":
          item.anoModelo || item["ANO MODELO"] || item.ano_modelo || "",
        COR: item.cor || item.COR || "",
        COMBUSTIVEL:
          (item.combustivel || item.COMBUSTIVEL || "") === "FLEX"
            ? "ALCOOL/GASOLINA"
            : item.combustivel || item.COMBUSTIVEL || "",
        PLACA: item.placa || item.PLACA || "",
        TIPO:
          (item.tipo || item.TIPO || "") === "Consignado"
            ? "TERCEIRO_CONSIGNADO"
            : (item.tipo || item.TIPO || "") === "Proprio"
            ? "PROPRIO"
            : item.tipo || item.TIPO || "",
        "VALOR COMPRA":
          item.valorCompra || item["VALOR COMPRA"] || item.valor_compra || "",
        "VALOR A VISTA":
          item.valorVenda || item["VALOR VENDA"] || item.valor_venda || "",
        "VALOR DE VENDA":
          item.valorVenda || item["VALOR VENDA"] || item.valor_venda || "",
        "NOME PROPRIETARIO ENTRADA": nomeProprietario,
        "CPF/CNPJ PROPRIETARIO ENTRADA": cpfCnpjProprietario,
        KM: item.km || item.KM || "",
        PORTAS: "",
        CAMBIO: "",
        "CNPJ REVENDA": cnpj,
        ESTADO_CONVERSACAO: "Usado",
      };
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
        // Para Veículos com JSON, mapear os dados para o formato padrão
        payload = mapJsonDataToVeiculosPayload(jsonData, posicao, cnpj);
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
    if (tipoConversao === "Veículos" && tipoFonte === "JSON") {
      fileName = `Exportacao_Veiculos_JSON_${posicao}_${formattedDate}_${cnpj}.xlsx`;
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
      {tipoConversao === "Veículos" && tipoFonte === "JSON" ? (
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

          <div className="json-options">
            <button
              className="toggle-json-button"
              onClick={() => setShowJsonTextarea(!showJsonTextarea)}
              disabled={loading}
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
                disabled={loading}
                rows={10}
              />
              <button
                className="process-json-button"
                onClick={handleProcessJsonText}
                disabled={loading || !jsonText.trim()}
                aria-busy={loading}
              >
                {loading ? "Processando..." : "Processar JSON"}
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
          <button
            className="convert-button"
            onClick={handleConvert}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Convertendo..." : "Converter"}
          </button>

          <div className="table-wrapper">
            <h3>
              {tipoConversao === "Link JSON" ||
              (tipoConversao === "Veículos" && tipoFonte === "JSON")
                ? "Dados do JSON importado:"
                : "Espelho da planilha importada:"}
            </h3>
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
