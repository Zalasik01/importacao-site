# Funcionalidade: Gerar Planilha Mapeada do JSON

## Descrição
Esta nova funcionalidade permite gerar uma planilha Excel com os campos corretamente mapeados a partir de dados JSON de veículos.

## Como usar

1. **Selecione "Veículos" como tipo de conversão**
2. **Selecione "JSON" como tipo de fonte**
3. **Insira a URL do JSON** ou **cole o JSON** diretamente
4. **Clique em "Visualizar"** para carregar os dados
5. **Clique em "Gerar Planilha Mapeada"** para baixar a planilha formatada

> **Nota**: Para conversão de JSON de veículos, apenas o botão "Gerar Planilha Mapeada" é exibido, que aplica automaticamente todos os mapeamentos de campos.

## Campos Mapeados

A funcionalidade mapeia automaticamente os seguintes campos do JSON para a planilha de destino:

### Campos Básicos do Veículo
- **Marca**: `marca`, `MARCA`, `make`, `brand`, `fabricante`, `manufacturer`, etc.
- **Modelo**: `modelo`, `MODELO`, `model`, `vehicle_model`, `titulo`, `name`, `versao`, etc.
- **Versão/Complemento**: `versao`, `version`, `trim`, `variant`, `grade`, `complemento`, etc.
- **Ano Fabricação**: `anoFabricacao`, `ANO_FAB`, `fabric_year`, `year_manufactured`, etc.
- **Ano Modelo**: `anoModelo`, `ANO_MODELO`, `model_year`, `vehicle_year`, etc.
- **Cor**: `cor`, `COR`, `color`, `vehicle_color`, `paint_color`, etc.
- **Combustível**: `combustivel`, `COMBUSTIVEL`, `fuel`, `fuel_type`, etc.

### Identificação
- **Chassi**: `chassi`, `CHASSI`, `vin`, `chassis_number`, etc.
- **Renavam**: `renavam`, `RENAVAM`, `registration`, `reg_number`, etc.
- **Placa**: `placa`, `PLACA`, `plate`, `license_plate`, etc.
- **Número Motor**: `motor`, `numeroMotor`, `engine_number`, `engine`, etc.

### Dados Comerciais
- **Valor Compra**: `valorCompra`, `purchase_price`, `cost_price`, etc.
- **Valor Venda**: `valorVenda`, `price`, `sale_price`, `selling_price`, etc.
- **KM**: `km`, `KM`, `mileage`, `odometer`, `quilometragem`, etc.

### Imagens (NOVA FUNCIONALIDADE)
- **Link Imagens**: `fotos`, `linkImagens`, `imagens`, `images`, `gallery`, etc.
  - Suporta URLs simples
  - Suporta arrays de URLs (separadas por vírgula)
  - Suporta objetos com múltiplas imagens

### Outros Campos
- **Portas**: `portas`, `doors`, `door_count`, etc.
- **Câmbio**: `cambio`, `transmission`, `gearbox`, etc.
- **Data Compra/Entrada**: `dataCompra`, `dataEntradaEstoque`, `date_created`, `created_at`, etc.
- **Data Venda**: `dataVenda`, `date_sold`, `sold_date`, etc.

## Exemplo de JSON Suportado

```json
[
  {
    "id": 2412407,
    "marca": "BMW",
    "modelo": "320i",
    "versao": "2.0 Turbo/ActiveFlex 16V/GP 4",
    "anoFabricacao": 2013,
    "anoModelo": 2014,
    "cor": "Cinza",
    "combustivel": "Álcool/Gasolina",
    "km": 12321,
    "portas": 4,
    "placa": "KPZ4G52",
    "chassi": "9991781088",
    "motor": "B4290640",
    "valorVenda": 250000,
    "tipo": "Carro/Camioneta",
    "cambio": "Câmbio automático",
    "dataEntradaEstoque": "Nov 21, 2024 11:25:47 AM",
    "fotos": [
      "https://s3.amazonaws.com/altimus2.arquivos.prod/5c0e681e-4e50-4955-80ee-9982c65fd15f/fotos/veiculo/0bac62b84f9d4014bd3d00eff1e65421_1732188558474.jpg"
    ]
  }
]
```

## Formato da Planilha Gerada

A planilha gerada conterá as seguintes colunas:

1. ID
2. STATUS
3. DATA DE ENTRADA
4. DATA E HORA DE SAIDA
5. MARCA
6. MODELO
7. COMPLEMENTO
8. CHASSI
9. RENAVAM
10. NUMERO MOTOR
11. ANO FAB.
12. ANO MOD
13. COR
14. COMBUSTIVEL
15. PLACA
16. TIPO
17. VALOR COMPRA
18. VALOR A VISTA
19. VALOR DE VENDA
20. NOME PROPRIETARIO ENTRADA
21. CPF/CNPJ PROPRIETARIO ENTRADA
22. KM
23. PORTAS
24. CAMBIO
25. CNPJ REVENDA
26. ESTADO_CONVERSACAO
27. **LINK IMAGENS** (NOVA COLUNA)

## Benefícios

- **Flexibilidade**: Suporta diferentes formatos de nomes de campos
- **Automação**: Mapeia automaticamente os campos sem intervenção manual
- **Validação**: Processa e valida os dados antes da geração
- **Imagens**: Inclui links de imagens na planilha final
- **Compatibilidade**: Funciona com diferentes estruturas de JSON
