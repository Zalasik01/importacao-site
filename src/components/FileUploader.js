import React, { useState } from "react";
import "./FileUploader.css";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "./../../src/CustomToast.css";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "react-toastify/dist/ReactToastify.css";

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

  const getColIdx = () =>
    columns.reduce((acc, col, idx) => ({ ...acc, [col]: idx }), {});

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
    if (!file) {
      toastError(MESSAGES.noSheet);
      return;
    }

    setLoading(true);
    toastInfo(MESSAGES.conversionStarted);

    try {
      let payload;

      if (
        tipoConversao === "Titulos Financeiros" &&
        origem === "Revenda Mais"
      ) {
        payload = mapSheetDataToPayloadTitulosFinanceiros();
      } else if (tipoConversao === "Clientes" && origem === "Revenda Mais") {
        payload = mapSheetDataToPayloadClientes();
      } else if (
        tipoConversao === "Receitas e Despesas Veículos" &&
        origem === "Revenda Mais"
      ) {
        payload = mapSheetDataToPayloadRdv();
      } else {
        payload = mapSheetDataToPayload();
      }

      await generateExcel(payload, cnpj);
      toastSuccess(MESSAGES.conversionSuccess);
    } catch (error) {
      toastError("Erro ao converter a planilha.");
    } finally {
      setLoading(false);
    }
  };

  const mapSheetDataToPayload = () => {
    const colIdx = getColIdx();
    return sheetData.map((row) => {
      const modelo = row[colIdx[COLUMN_NAMES.modelo]];
      const complemento =
        modelo && modelo.includes(" ")
          ? modelo.split(" ").slice(1).join(" ")
          : "";
      const modeloFinal = modelo ? modelo.split(" ")[0] : "";

      let nomeProprietario, cpfCnpjProprietario;

      if (row[colIdx[COLUMN_NAMES.fornecedor]]) {
        nomeProprietario = row[colIdx[COLUMN_NAMES.fornecedor]];
        cpfCnpjProprietario = row[colIdx[COLUMN_NAMES.cpfCnpjFornecedor]];
      } else if (row[colIdx[COLUMN_NAMES.cliente]]) {
        nomeProprietario = row[colIdx[COLUMN_NAMES.cliente]];
        cpfCnpjProprietario = row[colIdx[COLUMN_NAMES.cpfCnpjCliente]];
      }

      let rowData = {
        ID: "",
        STATUS: posicao === "Estoque" ? 0 : 1,
        "DATA DE ENTRADA": row[colIdx[COLUMN_NAMES.dataCompra]]
          ? row[colIdx[COLUMN_NAMES.dataCompra]] + " 00:00:00"
          : "",
        "DATA E HORA DE SAIDA": row[colIdx[COLUMN_NAMES.dataVenda]]
          ? row[colIdx[COLUMN_NAMES.dataVenda]] + " 00:00:00"
          : "",
        MARCA: row[colIdx[COLUMN_NAMES.marca]],
        MODELO: modeloFinal,
        COMPLEMENTO: complemento,
        CHASSI: row[colIdx[COLUMN_NAMES.chassi]],
        RENAVAM: row[colIdx[COLUMN_NAMES.renavam]],
        "NUMERO MOTOR": "",
        "ANO FAB.": row[colIdx[COLUMN_NAMES.anoModelo]],
        "ANO MOD": row[colIdx[COLUMN_NAMES.anoModelo]],
        COR: row[colIdx[COLUMN_NAMES.cor]],
        COMBUSTIVEL:
          row[colIdx[COLUMN_NAMES.combustivel]] === "FLEX"
            ? "ALCOOL/GASOLINA"
            : row[colIdx[COLUMN_NAMES.combustivel]],
        PLACA: row[colIdx[COLUMN_NAMES.placa]],
        TIPO:
          row[colIdx[COLUMN_NAMES.tipo]] === "Consignado"
            ? "TERCEIRO_CONSIGNADO"
            : row[colIdx[COLUMN_NAMES.tipo]] === "Proprio"
            ? "PROPRIO"
            : row[colIdx[COLUMN_NAMES.tipo]],
        "VALOR COMPRA": row[colIdx[COLUMN_NAMES.valorCompra]],
        "VALOR A VISTA": row[colIdx[COLUMN_NAMES.valorVenda]],
        "VALOR DE VENDA": row[colIdx[COLUMN_NAMES.valorVenda]],
        "NOME PROPRIETARIO ENTRADA": nomeProprietario,
        "CPF/CNPJ PROPRIETARIO ENTRADA": cpfCnpjProprietario,
        KM: row[colIdx[COLUMN_NAMES.km]],
        PORTAS: "",
        CAMBIO: "",
        "CNPJ REVENDA": cnpj,
        ESTADO_CONVERSACAO: "Usado",
      };
      return rowData;
    });
  };

  const mapSheetDataToPayloadClientes = () => {
    const colIdx = getColIdx();
    return sheetData
      .filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && cell !== "")
      )
      .map((row) => {
        const sexoValor = row[colIdx[COLUMN_NAMES.sexo]];
        const sexo = sexoValor && sexoValor.charAt(0).toUpperCase();
        const sexoFinal = sexo === "M" || sexo === "F" ? sexo : "O";

        const pessoa = isNaN(row[colIdx[COLUMN_NAMES.cpfCnpj]])
          ? "Física"
          : "Jurídica";

        const cepValor = String(row[colIdx[COLUMN_NAMES.cep]] || "");
        const cep = cepValor.replace("-", "");

        const telefone1 = row[colIdx[COLUMN_NAMES.telefoneCelular]] || "";
        const telefone2 = row[colIdx[COLUMN_NAMES.telefoneResidencial]] || "";
        const telefone3 = row[colIdx[COLUMN_NAMES.telefoneComercial]] || "";

        const telefone1Field = telefone1 ? telefone1 : undefined;
        const tipoTelefone1Field = telefone1 ? "Celular" : undefined;

        const telefone2Field = telefone2 ? telefone2 : undefined;
        const tipoTelefone2Field = telefone2 ? "Celular" : undefined;

        const telefone3Field = telefone3 ? telefone3 : undefined;
        const tipoTelefone3Field = telefone3 ? "Celular" : undefined;

        const ruaValor = row[colIdx[COLUMN_NAMES.rua]] || "";
        const rua = ruaValor.split(",")[0].trim();

        return {
          Cod: "",
          Pessoa: row[colIdx[COLUMN_NAMES.pessoa]],
          Sexo: sexoFinal,
          "Nome Completo": row[colIdx[COLUMN_NAMES.nome]],
          Apelido: row[colIdx[COLUMN_NAMES.apelido]],
          CPFCNPJ: row[colIdx[COLUMN_NAMES.cpfCnpj]],
          Email: row[colIdx[COLUMN_NAMES.email]],
          Cep: cep,
          Rua: rua,
          Numero: row[colIdx[COLUMN_NAMES.numero]],
          Complemento: row[colIdx[COLUMN_NAMES.complemento]],
          Bairro: row[colIdx[COLUMN_NAMES.bairro]],
          Cidade: row[colIdx[COLUMN_NAMES.cidade]],
          UF: row[colIdx[COLUMN_NAMES.estado]],
          "Data Nascimento": row[colIdx[COLUMN_NAMES.dataNascimento]],
          "IE/RG": row[colIdx[COLUMN_NAMES.rg]] || row[colIdx[COLUMN_NAMES.ie]],
          Telefone1: telefone1Field,
          "Tipo Telefone 1": tipoTelefone1Field,
          "Telefone 2": telefone2Field,
          "Tipo Telefone 2": tipoTelefone2Field,
          Telefone3: telefone3Field,
          "Tipo Telefone 3": tipoTelefone3Field,
          Fornecedor: marcarFornecedor ? "Sim" : "",
        };
      });
  };

  const mapSheetDataToPayloadTitulosFinanceiros = () => {
    const colIdx = getColIdx();
    return sheetData.map((row) => {
      const documentoFornecedorCliente =
        row[colIdx[COLUMN_NAMES.documentoFornecedorCliente]] ||
        "00.000.000/0000-00";
      return {
        id_titulo_financeiro: "",
        "CNPJ REVENDA": cnpj,
        OPERAÇÃO:
          row[colIdx[COLUMN_NAMES.operacao]] === "Pagar"
            ? "PAGAR"
            : row[colIdx[COLUMN_NAMES.operacao]] === "Receber"
            ? "RECEBER"
            : row[colIdx[COLUMN_NAMES.operacao]],
        "DATA EMISSÃO": row[colIdx[COLUMN_NAMES.dataEmissao]],
        "DATA VENCIMENTO": row[colIdx[COLUMN_NAMES.dataVencimento]],
        "NOME/RAZÃO SOCIAL CLIENTE/FORNECEDOR":
          row[colIdx[COLUMN_NAMES.clienteFornecedor]],
        "CPF/CNPJ CLIENTE/FORNECEDOR": documentoFornecedorCliente,
        DESCRIÇÃO: row[colIdx[COLUMN_NAMES.descricao]],
        "VALOR TOTAL": row[colIdx[COLUMN_NAMES.valorTitulo]],
        QUITADO: row[colIdx[COLUMN_NAMES.dataPagamentoRecebimento]]
          ? "true"
          : "false",
        CONTA: "t_conta | Pode ser solicitada para o N2",
        "CONTA FINANCEIRA":
          "t_conta_financeira | Pode ser solicitada para o N2",
        "FORMA DE PAGAMENTO":
          row[colIdx[COLUMN_NAMES.formaPagamentoRecebimento]],
        "DATA QUITACAO": row[colIdx[COLUMN_NAMES.dataPagamentoRecebimento]]
          ? row[colIdx[COLUMN_NAMES.dataPagamentoRecebimento]] + " 00:00:00"
          : "",
      };
    });
  };

  const mapSheetDataToPayloadRdv = () => {
    return sheetData.map(() => ({
      id_receita_despesa_veiculo: "",
    }));
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
    const fileName = `Exportacao_${tipoConversao}_${posicao}_${formattedDate}_${cnpj}.xlsx`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="file-upload-container">
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
            <h3>Espelho da planilha importada:</h3>
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
