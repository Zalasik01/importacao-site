/**
 * Mapper para converter dados JSON de veículos para formato padrão Excel
 */

export function mapJsonToVeiculosPayload(jsonData, posicao, cnpj) {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error("Dados JSON inválidos para mapeamento de veículos");
  }

  // Verificar se os dados estão wrapped em uma propriedade (ex: {veiculos: [...]})
  let actualData = jsonData;
  
  // Se o primeiro item tem uma propriedade que é um array, usar esse array
  if (jsonData.length > 0 && typeof jsonData[0] === 'object') {
    const firstItem = jsonData[0];
    const arrayKeys = Object.keys(firstItem).filter(key => Array.isArray(firstItem[key]));
    
    if (arrayKeys.length === 1) {
      actualData = firstItem[arrayKeys[0]];
    }
  }

  return actualData.map((item, index) => {
    try {
      // Extrair e processar modelo
      const modelo = extractField(item, [
        "modelo",
        "MODELO",
        "model",
        "base_model",
        "vehicle_model",
        "titulo",
        "title",
        "name",
        "description",
        "modelName",
        "car_model",
        "vehicle_name",
        "versao", // Adicionar versao como fallback para modelo
      ]);
      
      // Extrair versão para complemento
      const versao = extractField(item, [
        "versao",
        "version",
        "trim",
        "variant",
        "grade",
        "nivel",
        "complemento",
      ]);
      
      const { modeloFinal, complemento } = processModelo(modelo, versao);

      // Extrair marca
      const marca = extractField(item, [
        "marca",
        "MARCA",
        "make",
        "brand",
        "fabricante",
        "manufacturer",
        "makeName",
        "brandName",
        "vehicle_make",
        "car_brand",
      ]);

      // Extrair datas
      const dataCompra = extractField(item, [
        "dataCompra",
        "DATA COMPRA",
        "data_compra",
        "date",
        "created_at",
        "date_created",
        "dataEntradaEstoque", // Adicionar campo específico
        "data_entrada_estoque",
        "entrada_estoque",
      ]);
      const dataVenda = extractField(item, [
        "dataVenda",
        "DATA VENDA",
        "data_venda",
        "date_sold",
        "sold_date",
        "dataSaida",
        "data_saida",
      ]);

      // Extrair valores
      const valorCompra = extractField(item, [
        "valorCompra",
        "VALOR COMPRA",
        "VALOR_COMPRA",
        "valor_compra",
        "purchase_price",
        "cost_price",
        "buyPrice",
        "costPrice",
        "preco_compra",
        "valor_aquisicao",
      ]);
      const valorVenda = extractField(item, [
        "valorVenda",
        "VALOR VENDA", 
        "VALOR_VENDA",
        "valor_venda",
        "price",
        "promotion_price",
        "sale_price",
        "selling_price",
        "preco",
        "valor",
        "preco_venda",
        "sellPrice",
        "salePrice",
      ]);

      // Extrair informações do proprietário
      const { nomeProprietario, cpfCnpjProprietario } =
        extractProprietario(item);

      // Extrair combustível e normalizar
      const combustivelRaw = extractField(item, [
        "combustivel",
        "COMBUSTIVEL",
        "fuel",
        "fuel_type",
        "tipo_combustivel",
        "fuelType",
        "combustible",
        "fuel_kind",
        "energy_type",
      ]);
      const combustivel = normalizeCombustivel(combustivelRaw);

      // Extrair tipo e normalizar
      const tipoRaw = extractField(item, [
        "tipo",
        "TIPO",
        "category",
        "condition",
        "vehicle_type",
        "status",
      ]);
      const tipo = normalizeTipo(tipoRaw);

      const result = {
        ID: "",
        STATUS: posicao === "Estoque" ? 0 : 1,
        "DATA DE ENTRADA": formatDate(dataCompra),
        "DATA E HORA DE SAIDA": formatDate(dataVenda),
        MARCA: marca || "",
        MODELO: modeloFinal || "",
        COMPLEMENTO: complemento || "",
        CHASSI:
          extractField(item, [
            "chassi",
            "CHASSI",
            "vin",
            "chassis",
            "chassis_number",
            "numero_chassi",
            "chassisNumber",
            "vehicle_identification_number",
          ]) || "",
        RENAVAM:
          extractField(item, [
            "renavam",
            "RENAVAM",
            "registration",
            "reg_number",
            "numero_renavam",
            "renavam_number",
            "vehicle_registration",
          ]) || "",
        "NUMERO MOTOR":
          extractField(item, [
            "numeroMotor",
            "NUMERO MOTOR",
            "engine_number",
            "motor_number",
            "motor", // Adicionar campo motor
            "engine",
            "numero_motor",
          ]) || "",
        "ANO FAB.":
          extractField(item, [
            "anoFabricacao",
            "ANO FAB",
            "ANO_FAB",
            "ano_fabricacao",
            "fabric_year",
            "year_manufactured",
            "manufacturing_year",
            "ano_fabricacao",
            "yearManufactured",
          ]) ||
          extractField(item, [
            "anoModelo",
            "ANO MODELO",
            "ANO_MODELO", 
            "ano_modelo",
            "year",
            "model_year",
            "modelYear",
          ]) ||
          "",
        "ANO MOD":
          extractField(item, [
            "anoModelo",
            "ANO MODELO",
            "ANO_MODELO",
            "ano_modelo", 
            "year",
            "model_year",
            "modelYear",
            "vehicle_year",
          ]) || 
          extractField(item, [
            "anoFabricacao",
            "ANO FAB",
            "ANO_FAB",
            "ano_fabricacao",
            "fabric_year",
            "year_manufactured",
          ]) ||
          "",
        COR:
          extractField(item, [
            "cor",
            "COR",
            "color",
            "colour",
            "paint_color",
            "vehicle_color",
            "car_color",
            "cor_veiculo",
            "colorName",
          ]) || "",
        COMBUSTIVEL: combustivel,
        PLACA:
          extractField(item, [
            "placa",
            "PLACA",
            "plate",
            "license_plate",
            "number_plate",
            "placa_veiculo",
            "licensePlate",
            "vehicle_plate",
            "registration_plate",
          ]) || "",
        TIPO: tipo,
        "VALOR COMPRA": valorCompra || "",
        "VALOR A VISTA": valorVenda || "",
        "VALOR DE VENDA": valorVenda || "",
        "NOME PROPRIETARIO ENTRADA": nomeProprietario || "",
        "CPF/CNPJ PROPRIETARIO ENTRADA": cpfCnpjProprietario || "",
        KM:
          extractField(item, [
            "km",
            "KM",
            "quilometragem",
            "mileage",
            "odometer",
            "kilometragem",
            "milhas",
            "kilometers",
            "odometry",
            "distance",
            "mileage_km",
            "odometer_reading",
          ]) || "",
        PORTAS:
          extractField(item, [
            "portas",
            "PORTAS",
            "doors",
            "door_count",
            "num_doors",
          ]) || "",
        CAMBIO: normalizeCambio(
          extractField(item, [
            "cambio",
            "CAMBIO",
            "gear",
            "transmission",
            "gearbox",
          ])
        ),
        "CNPJ REVENDA": cnpj || "",
        ESTADO_CONVERSACAO: "Usado",
        "LINK IMAGENS": extractLinkImagens(item),
      };
      
      return result;
    } catch (error) {
      console.error(`Erro ao processar item ${index}:`, error);
      throw new Error(
        `Erro ao processar veículo na linha ${index + 1}: ${error.message}`
      );
    }
  });
}

/**
 * Extrai campo de um objeto usando múltiplas chaves possíveis
 * Suporta objetos aninhados usando notação de ponto
 */
function extractField(obj, keys) {
  for (const key of keys) {
    const value = getNestedValue(obj, key);
    if (value !== undefined && value !== null && value !== "") {
      // Se for um objeto, tentar extrair valores comuns
      if (typeof value === "object" && !Array.isArray(value)) {
        // Tentar extrair 'value', 'name', 'title', 'text' do objeto
        const possibleKeys = ["value", "name", "title", "text", "description"];
        for (const possibleKey of possibleKeys) {
          if (value[possibleKey] !== undefined && value[possibleKey] !== null) {
            return String(value[possibleKey]).trim();
          }
        }
        // Se nenhuma chave comum encontrada, retornar JSON string
        return JSON.stringify(value);
      }

      // Se for array, juntar os valores
      if (Array.isArray(value)) {
        return value.join(", ");
      }

      return String(value).trim();
    }
  }
  
  return "";
}

/**
 * Obtém valor aninhado usando notação de ponto
 */
function getNestedValue(obj, path) {
  if (!obj || typeof obj !== "object") {
    return undefined;
  }

  // Se não há ponto, é uma chave simples
  if (!path.includes(".")) {
    return obj[path];
  }

  // Navegar através do objeto usando a notação de ponto
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Processa o campo modelo para separar modelo e complemento
 */
function processModelo(modelo, versao = "") {
  if (!modelo) {
    return { modeloFinal: "", complemento: versao || "" };
  }

  const parts = modelo.split(" ");
  const modeloFinal = parts[0] || "";
  let complemento = parts.slice(1).join(" ") || "";
  
  // Se temos versão e ela não está já incluída no modelo, adicionar
  if (versao && !complemento.includes(versao)) {
    complemento = complemento ? `${complemento} ${versao}` : versao;
  }

  return { modeloFinal, complemento };
}

/**
 * Extrai informações do proprietário (fornecedor ou cliente)
 */
function extractProprietario(item) {
  // Tentar fornecedor primeiro
  const fornecedor = extractField(item, ["fornecedor", "FORNECEDOR", "seller"]);
  const cpfCnpjFornecedor = extractField(item, [
    "cpfCnpjFornecedor",
    "CPF/CNPJ FORNECEDOR",
    "cpf_cnpj_fornecedor",
    "seller_cnpj",
  ]);

  if (fornecedor) {
    return {
      nomeProprietario: fornecedor,
      cpfCnpjProprietario: cpfCnpjFornecedor,
    };
  }

  // Tentar cliente como fallback
  const cliente = extractField(item, ["cliente", "CLIENTE"]);
  const cpfCnpjCliente = extractField(item, [
    "cpfCnpjCliente",
    "CPF/CNPJ CLIENTE",
    "cpf_cnpj_cliente",
  ]);

  return {
    nomeProprietario: cliente,
    cpfCnpjProprietario: cpfCnpjCliente,
  };
}

/**
 * Normaliza valores de combustível
 */
function normalizeCombustivel(combustivel) {
  if (!combustivel) return "";

  const combustivelLower = combustivel.toLowerCase();

  if (
    combustivelLower.includes("flex") ||
    combustivelLower.includes("alcool/gasolina")
  ) {
    return "ALCOOL/GASOLINA";
  }

  return combustivel.toUpperCase();
}

/**
 * Normaliza valores de tipo
 */
function normalizeTipo(tipo) {
  // Sempre retornar "PROPRIO" conforme solicitado
  return "PROPRIO";
}

/**
 * Normaliza valores de câmbio para garantir apenas "Automatico" ou "Manual"
 */
function normalizeCambio(cambio) {
  if (!cambio) return "";

  const cambioStr = String(cambio).toLowerCase().trim();
  
  // Verificar se contém indicações de câmbio automático
  if (cambioStr.includes("automatico") || 
      cambioStr.includes("automatic") || 
      cambioStr.includes("auto") ||
      cambioStr.includes("cvt") ||
      cambioStr.includes("dsg") ||
      cambioStr.includes("tiptronic") ||
      cambioStr.includes("multitronic")) {
    return "Automatico";
  }
  
  // Verificar se contém indicações de câmbio manual
  if (cambioStr.includes("manual") || 
      cambioStr.includes("man") ||
      cambioStr.includes("stick") ||
      cambioStr.includes("mt")) {
    return "Manual";
  }
  
  // Se não conseguir identificar, retornar "Manual" como padrão
  return "Manual";
}

/**
 * Formata data para o padrão esperado: DD/MM/YYYY HH:MM:SS
 */
function formatDate(dateStr) {
  if (!dateStr) return "";

  try {
    // Tentar criar um objeto Date
    let date;
    
    // Se já é uma data válida
    if (dateStr instanceof Date) {
      date = dateStr;
    } else {
      // Tentar parsear diferentes formatos
      date = new Date(dateStr);
    }

    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return dateStr; // Retornar original se não conseguir parsear
    }

    // Formatar para DD/MM/YYYY HH:MM:SS
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    // Se houver erro, retornar a data original
    return dateStr;
  }
}

/**
 * Extrai links de imagens do JSON
 * Procura por diferentes campos que podem conter URLs de imagens
 */
function extractLinkImagens(item) {
  const imagemFields = [
    "linkImagens",
    "link_imagens", 
    "imagens",
    "images",
    "fotos", // Adicionar campo fotos que está no JSON
    "photos",
    "pictures",
    "gallery",
    "galeria",
    "image_url",
    "image_urls",
    "foto_url",
    "photo_url",
    "picture_url",
    "main_image",
    "thumbnail",
    "media",
    "attachments"
  ];

  for (const field of imagemFields) {
    const value = extractField(item, [field]);
    if (value) {
      // Se for um array de URLs, juntar com vírgula
      if (Array.isArray(item[field])) {
        return item[field].join(", ");
      }
      
      // Se for um objeto com URLs, tentar extrair os valores
      if (typeof item[field] === "object" && !Array.isArray(item[field])) {
        const urls = Object.values(item[field]).filter(url => 
          typeof url === "string" && (url.startsWith("http") || url.startsWith("data:"))
        );
        if (urls.length > 0) {
          return urls.join(", ");
        }
      }
      
      // Se for uma string de URL válida
      if (typeof value === "string" && (value.startsWith("http") || value.startsWith("data:"))) {
        return value;
      }
      
      // Se for uma string com múltiplas URLs separadas
      if (typeof value === "string" && value.includes("http")) {
        return value;
      }
    }
  }

  return "";
}

export default mapJsonToVeiculosPayload;
