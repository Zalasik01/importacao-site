import React, { useState } from 'react';
import './FileUploader.css';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FileUploader({ cnpj, file, setFile, posicao, tipoConversao, origem, marcarFornecedor }) {
  const [sheetData, setSheetData] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileType = selectedFile.type;
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (validTypes.includes(fileType)) {
        readExcelFile(selectedFile);
      } else {
        alert('Por favor, selecione um arquivo Excel válido.');
      }
    }
  };

  const readExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonSheet = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (jsonSheet.length > 0) {
        setColumns(jsonSheet[0]);
        setSheetData(jsonSheet.slice(1));
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error("Nenhuma planilha indexada. Por favor, envie uma planilha.", { 
        autoClose: 1000, 
        theme: "dark", 
        hideProgressBar: true
      });
      return;
    }
  
    toast.info("Conversão da planilha iniciada...", { 
      autoClose: 1000, 
      theme: "dark", 
      hideProgressBar: true
    });
  
    let payload;
  
    if (tipoConversao === "Titulos Financeiros" && origem === "Revenda Mais") {
      payload = mapSheetDataToPayloadTitulosFinanceiros();
    } else if (tipoConversao === "Clientes" && origem === "Revenda Mais") {
      payload = mapSheetDataToPayloadClientes();
    } else {
      payload = mapSheetDataToPayload();
    }
    
    generateExcel(payload, cnpj);
    toast.success("Planilha convertida e pronta para download!", { 
      autoClose: 1000, 
      theme: "dark", 
      hideProgressBar: true
    });
};

  const mapSheetDataToPayload = () => {
    return sheetData.map((row) => {
      const modelo = row[columns.indexOf("MODELO")];
      const complemento = modelo.includes(" ") ? modelo.split(" ").slice(1).join(" ") : "";
      const modeloFinal = modelo.split(" ")[0];

      let nomeProprietario, cpfCnpjProprietario;

      if (row[columns.indexOf("FORNECEDOR")]) {
        nomeProprietario = row[columns.indexOf("FORNECEDOR")];
        cpfCnpjProprietario = row[columns.indexOf("CPF/CNPJ FORNECEDOR")];
      } else if (row[columns.indexOf("CLIENTE")]) {
        nomeProprietario = row[columns.indexOf("CLIENTE")];
        cpfCnpjProprietario = row[columns.indexOf("CPF/CNPJ CLIENTE")];
      }

      let rowData = {
        "ID": "", 
        "STATUS": posicao === "Estoque" ? 0 : 1,
        "DATA DE ENTRADA": row[columns.indexOf("DATA COMPRA")] ? row[columns.indexOf("DATA COMPRA")] + " 00:00:00" : "",
        "DATA E HORA DE SAIDA": row[columns.indexOf("DATA VENDA")] ? row[columns.indexOf("DATA VENDA")] + " 00:00:00" : "",
        "MARCA": row[columns.indexOf("MARCA")], 
        "MODELO": modeloFinal,
        "COMPLEMENTO": complemento, 
        "CHASSI": row[columns.indexOf("CHASSI")], 
        "RENAVAM": row[columns.indexOf("RENAVAM")], 
        "NUMERO MOTOR": "", 
        "ANO FAB.": row[columns.indexOf("ANO MODELO")], 
        "ANO MOD": row[columns.indexOf("ANO MODELO")], 
        "COR": row[columns.indexOf("COR")],
        "COMBUSTIVEL": 
        row[columns.indexOf("COMBUSTIVEL")] === "FLEX" ? "ALCOOL/GASOLINA" :
        row[columns.indexOf("COMBUSTIVEL")], 
        "PLACA": row[columns.indexOf("PLACA")], 
        "TIPO": 
        row[columns.indexOf("TIPO")] === "Consignado" ? "TERCEIRO_CONSIGNADO" : 
        row[columns.indexOf("TIPO")] === "Proprio" ? "PROPRIO" : 
        row[columns.indexOf("TIPO")], 
        "VALOR COMPRA": row[columns.indexOf("VALOR COMPRA")], 
        "VALOR A VISTA": row[columns.indexOf("VALOR VENDA")], 
        "VALOR DE VENDA": row[columns.indexOf("VALOR VENDA")], 
        "NOME PROPRIETARIO ENTRADA": nomeProprietario, 
        "CPF/CNPJ PROPRIETARIO ENTRADA": cpfCnpjProprietario, 
        "KM": row[columns.indexOf("KM")], 
        "PORTAS": "", 
        "CAMBIO": "", 
        "CNPJ REVENDA": cnpj, 
        "ESTADO_CONVERSACAO": "Usado"
      };
      return rowData;
    });
  };

  const mapSheetDataToPayloadClientes = () => {
    return sheetData.map((row) => {
      const sexoValor = row[columns.indexOf("sexo")];
      const sexo = sexoValor && sexoValor.charAt(0).toUpperCase();
      const sexoFinal = sexo === "M" || sexo === "F" ? sexo : "O";

      const pessoa = isNaN(row[columns.indexOf("cpf_cnpj")]) ? "Física" : "Jurídica";

      const cepValor = row[columns.indexOf("cep")] || "";
      const cep = cepValor.replace("-", "");

      const telefone1 = row[columns.indexOf("telefone_celular")] || "";
      const telefone2 = row[columns.indexOf("telefone_residencial")] || "";
      const telefone3 = row[columns.indexOf("telefone_comercial")] || "";

      const telefone1Field = telefone1 ? telefone1 : undefined;
      const tipoTelefone1Field = telefone1 ? "Celular" : undefined;

      const telefone2Field = telefone2 ? telefone2 : undefined;
      const tipoTelefone2Field = telefone2 ? "Celular" : undefined;

      const telefone3Field = telefone3 ? telefone3 : undefined;
      const tipoTelefone3Field = telefone3 ? "Celular" : undefined;

      const ruaValor = row[columns.indexOf("rua")] || "";
      const rua = ruaValor.split(",")[0].trim();

      return {
        "Cod": "",
        "Pessoa": pessoa,
        "Sexo": sexoFinal,
        "Nome Completo": row[columns.indexOf("nome")],
        "Apelido": row[columns.indexOf("apelido")],
        "CPFCNPJ": row[columns.indexOf("cpf_cnpj")],
        "Email": row[columns.indexOf("email")],
        "Cep": cep,
        "Rua": rua,
        "Numero": row[columns.indexOf("numero")],
        "Complemento": row[columns.indexOf("complemento")],
        "Bairro": row[columns.indexOf("bairro")],
        "Cidade": row[columns.indexOf("cidade")],
        "UF": row[columns.indexOf("estado")],
        "Data Nascimento": row[columns.indexOf("data_nascimento")],
        "IE/RG": row[columns.indexOf("rg")] || row[columns.indexOf("ie")],
        "Telefone1": telefone1Field,
        "Tipo Telefone 1": tipoTelefone1Field,
        "Telefone 2": telefone2Field,
        "Tipo Telefone 2": tipoTelefone2Field,
        "Telefone3": telefone3Field,
        "Tipo Telefone 3": tipoTelefone3Field,
        "Fornecedor": marcarFornecedor ? "Sim" : ""
      };
    });
  };

  const mapSheetDataToPayloadTitulosFinanceiros = () => {
    return sheetData.map((row) => {
      const documentoFornecedorCliente = row[columns.indexOf("Documento Fornecedor/cliente")] || "00.000.000/0000-00";
      return {
        "id_titulo_financeiro": "",
        "CNPJ REVENDA": cnpj,
        "OPERAÇÃO":
          row[columns.indexOf("Operação")] === "Pagar" ? "PAGAR" : 
          row[columns.indexOf("Operação")] === "Receber" ? "RECEBER" :
          row[columns.indexOf("Operação")],
        "DATA EMISSÃO": row[columns.indexOf("Data emissão")],
        "DATA VENCIMENTO": row[columns.indexOf("Data vencimento")],
        "NOME/RAZÃO SOCIAL CLIENTE/FORNECEDOR": row[columns.indexOf("Cliente/Fornecedor")],
        "CPF/CNPJ CLIENTE/FORNECEDOR": documentoFornecedorCliente,
        "DESCRIÇÃO": row[columns.indexOf("Descrição")],
        "VALOR TOTAL": row[columns.indexOf("Valor título")],
        "QUITADO": row[columns.indexOf("Data pagamento/recebimento")] ? "true" : "false",
        "CONTA": "t_conta | Pode ser solicitada para o N2",
        "CONTA FINANCEIRA": "t_conta_financeira | Pode ser solicitada para o N2",
        "FORMA DE PAGAMENTO": row[columns.indexOf("Forma pagamento/recebimento")],
        "DATA QUITACAO": row[columns.indexOf("Data pagamento/recebimento")]? row[columns.indexOf("Data pagamento/recebimento")] + " 00:00:00" : "",
      };
    });
  };   

  const generateExcel = async (payload, cnpj) => {
    const ws = XLSX.utils.json_to_sheet(payload);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Output');
  
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
    const now = new Date();
    const formattedDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const fileName = `Exportacao_${tipoConversao}_${posicao}_${formattedDate}_${cnpj}.xlsx`;
  
    const link = document.createElement('a');
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
      />
      <label htmlFor="file-upload" className="file-label">
        <span>Clique para selecionar um arquivo</span>
      </label>
  
      {file && <p>Arquivo selecionado: {file.name}</p>}
  
      {sheetData.length > 0 && (
        <>
          <button className="convert-button" onClick={handleConvert}>
            Converter
          </button>
  
          <div className="table-wrapper">  {/* Envolvendo a tabela */}
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
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
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
