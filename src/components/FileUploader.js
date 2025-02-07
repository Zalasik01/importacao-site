import React, { useState } from 'react';
import './FileUploader.css';
import * as XLSX from 'xlsx';

function FileUploader({ cnpj, file, setFile }) {
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

  const handleConvert = () => {
    const payload = mapSheetDataToPayload();
    generateExcel(payload);
  };


  const mapSheetDataToPayload = () => {
    return sheetData.map((row) => {
      const modelo = row[columns.indexOf("MODELO")];
      const complemento = modelo.includes(" ") ? modelo.split(" ").slice(1).join(" ") : "";
      const modeloFinal = modelo.split(" ")[0];

      let rowData = {
        "ID": "", 
        "STATUS": row[columns.indexOf("POSICAO ESTOQUE")],
        "DATA DE ENTRADA": row[columns.indexOf("DATA COMPRA")] + " 00:00:00",
        "DATA E HORA DE SAIDA": "", 
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
        "NOME PROPRIETARIO ENTRADA": row[columns.indexOf("FORNECEDOR")], 
        "CPF/CNPJ PROPRIETARIO ENTRADA": row[columns.indexOf("CPF/CNPJ FORNECEDOR")], 
        "KM": row[columns.indexOf("KM")], 
        "PORTAS": "", 
        "CAMBIO": "", 
        "CNPJ REVENDA": cnpj, 
        "ESTADO_CONVERSACAO": "Usado"
      };
      return rowData;
    });
  };

  const generateExcel = (payload) => {
    const ws = XLSX.utils.json_to_sheet(payload);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Output');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'output.xlsx';
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
        <span>Arraste ou clique para selecionar um arquivo</span>
      </label>

      {file && <p>Arquivo selecionado: {file.name}</p>}

      {sheetData.length > 0 && (
        <div>
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
      )}

      {sheetData.length > 0 && (
        <button className="convert-button" onClick={handleConvert}>
          Converter
        </button>
      )}
    </div>
  );
}

export default FileUploader;
