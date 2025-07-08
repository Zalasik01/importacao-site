import { DataConverter } from '../src/services/dataConverter.js';

// JSON de teste
const testJson = [
  {
    "id": 2412407,
    "anoFabricacao": 2013,
    "anoModelo": 2014,
    "km": 12321,
    "portas": 4,
    "valorVenda": 250000,
    "dataEntradaEstoque": "Nov 21, 2024 11:25:47 AM",
    "tipo": "Carro/Camioneta",
    "marca": "BMW",
    "modelo": "320i",
    "versao": "2.0 Turbo/ActiveFlex 16V/GP 4",
    "cor": "Cinza",
    "combustivel": "Álcool/Gasolina",
    "motor": "B4290640",
    "placa": "KPZ4G52",
    "cambio": "Câmbio automático",
    "fotos": [
      "https://s3.amazonaws.com/altimus2.arquivos.prod/5c0e681e-4e50-4955-80ee-9982c65fd15f/fotos/veiculo/0bac62b84f9d4014bd3d00eff1e65421_1732188558474.jpg"
    ],
    "chassi": "9991781088"
  }
];

// Testar o converter
try {
  console.log('🧪 Testando converter...');
  const result = DataConverter.convertJsonToVeiculos(testJson, "Estoque", "12.345.678/0001-90");
  console.log('✅ Resultado:', result);
  console.log('🔢 Número de registros:', result.length);
  if (result.length > 0) {
    console.log('📋 Primeiro item:', result[0]);
  }
} catch (error) {
  console.error('❌ Erro no teste:', error);
}
