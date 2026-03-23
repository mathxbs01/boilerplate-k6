# Boilerplate K6 - Testes de Performance

## 📋 Sobre o Projeto

Este é um boilerplate para testes de performance e carga de APIs utilizando **K6**, uma ferramenta modern de testes de carga construída sobre JavaScript. O projeto segue uma arquitetura em camadas que facilita a manutenção, reutilização de código e escalabilidade dos testes.

---

## 🏗️ Arquitetura do Projeto

A estrutura segue um padrão em **camadas**, separando responsabilidades entre testes, utilitários e dados:

### Estrutura de Pastas

```
boilerplate-k6/
├── src/
│   ├── tests/              # Camada de Testes (Regras de Negócio)
│   │   └── example/        # Exemplo de teste de login
│   │       └── login.js
│   └── utils/              # Camada de Utilitários
│       ├── api/            # Cliente HTTP genérico
│       │   └── base.js
│       ├── read/           # Leitura de arquivos de dados
│       │   └── readCsv.js
│       └── data/           # Dados de teste
│           └── data-tests.csv
├── report/                 # Relatórios de teste (gerados automaticamente)
├── config.json             # Configurações gerais
├── package.json            # Dependências do projeto
└── README.md              # Este arquivo
```

### Camadas da Arquitetura

#### 1. **Camada de Testes** (`src/tests/`)
- Contém os scripts de teste específicos por módulo/funcionalidade
- Responsável pela **lógica de negócio** dos testes
- Utiliza validações, métricas customizadas e cenários de teste
- Exemplo: `src/tests/example/login.js`
- Organização: cada funcionalidade em seu diretório, ex: `tests/home`, `tests/login`

**Responsabilidades:**
- Definir grupos de testes (`group()`)
- Somar métricas customizadas (sucesso, tempo de resposta)
- Implementar validações com `check()`
- Configurar intensidade de carga (`vus`, `duration`, `thresholds`)

#### 2. **Camada de Utilitários** (`src/utils/`)

##### **API Client** (`utils/api/base.js`)
Cliente HTTP centralizado que encapsula todas as chamadas para a API.

**Features:**
- Classe `HttpClient` com métodos reutilizáveis
- Suporte para GET, POST, PUT, DELETE
- Gerenciamento automático de headers
- Suporte a autenticação com token Bearer
- Construção dinâmica de URLs com parâmetros

**Métodos:**
- `useGet(options)` - Requisição GET
- `usePost(options)` - Requisição POST
- `usePut(options)` - Requisição PUT
- `useDelete(options)` - Requisição DELETE

**Endpoints cadastrados:**
- `APIGet`, `APIPost`, `APIPut`, `APIDelete` - Mapeamento de endpoints

##### **Leitura de Dados** (`utils/read/readCsv.js`)
Utilitário para ler e processar arquivos CSV.

**Features:**
- Upload automático de arquivo CSV
- Parsing de cabeçalho e dados
- Geração de dados aleatórios para testes

**Métodos:**
- `dadosRandomicosCSV()` - Retorna uma linha aleatória do CSV

#### 3. **Dados de Teste** (`src/utils/data/`)
Arquivos CSV contendo dados para os testes.

**Formato:**
- Primeira linha: cabeçalho (nomes das colunas)
- Demais linhas: dados dos testes
- Exemplo: `data-tests.csv` com usuários de teste

#### 4. **Configurações** (`config.json`)
Arquivo central de configuração com variáveis de ambiente.

**Variáveis:**
- `CI` - Nível de isolamento (concorrência)
- `baseUrlApi` - URL base da API
- `tenantID` - Identificador do tenant
- `cepFrete` - CEP para testes de frete
- `limiteCompras` - Limite de compras para validação

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- K6 instalado (`npm install k6`)
- Node.js 14+

### Executar Testes

**Via NPM Scripts:**
```bash
# Teste de Login
npm run login

```

**Via K6 CLI direto:**
```bash
k6 run src/tests/example/login.js
```

**Com variáveis de ambiente:**
```bash
k6 run --env token=seu_token --env baseUrlApi=https://api.example.com src/tests/example/login.js
```

### Parâmetros de Execução

Os testes podem ser configurados em tempo de execução via:
- **Variáveis de ambiente** (`.env`)
- **Argumentos CLI** (`--env`)
- **`config.json`** (valores padrão)

Exemplo:
```bash
k6 run \
  --env token=abc123 \
  --env baseUrlApi=https://staging-api.familhao.com/ \
  --env tenantID=tenant-123 \
  src/tests/example/login.js
```

---

## 📝 Como Criar um Novo Teste

Para implementar uma nova feature, adicione código nas seguintes camadas:

### 1. Registre o Endpoint na Camada de API

**Arquivo:** `src/utils/api/base.js`

```javascript
// Adicione nas variáveis APIPost, APIGet, etc
let APIPost = {
  loginPost: API + 'login',
  meuNovoEndpoint: API + 'meu-novo-endpoint'  // ← Novo
};
```

### 2. Crie o Script de Teste

**Arquivo:** `src/tests/meu-modulo/meu-teste.js`

```javascript
import { check, group } from 'k6';
import { HttpClient } from '../../utils/api/base.js';
import { ReadCSV } from '../../utils/read/readCsv.js';

const env = JSON.parse(open('../../../config.json'));
const httpClient = new HttpClient();
const dados = new ReadCSV('../../../src/utils/data/data-tests.csv');

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  group('Meu Teste', function () {
    const res = httpClient.usePost({
      nomeRequest: 'meuNovoEndpoint',
      headers: { 'X-Custom-Header': 'value' },
      body: { /* payload */ },
    });

    check(res, {
      'status 200': (r) => r.status === 200,
    });
  });
}
```

### 3. Adicione o Script NPM

**Arquivo:** `package.json`

```json
{
  "scripts": {
    "meu-teste": "k6 run --out json=report/output.json src/tests/meu-modulo/meu-teste.js"
  }
}
```

### 4. (Opcional) Adicione Dados de Teste

**Arquivo:** `src/utils/data/meus-dados.csv`

```csv
campo1,campo2,campo3
valor1,valor2,valor3
valor4,valor5,valor6
```

---

## 📊 Geração de Relatórios

Os relatórios são gerados automaticamente em formato **HTML** durante a execução dos testes.

### Como Funciona

1. A função `handleSummary()` no script de teste processa os resultados
2. Utiliza a biblioteca `k6-reporter` para gerar o HTML
3. Salva no diretório `report/`

**Exemplo no código:**
```javascript
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export function handleSummary(data) {
  return {
    'report/meu-teste.html': htmlReport(data),
  };
}
```

### Acessar o Relatório

Após a execução, abra:
```
./report/login-test.html
```

---

## 🔍 Métricas e Thresholds

O projeto utiliza métricas customizadas para monitorar:

- **Latência:** `http_req_duration` - Tempo de resposta HTTP
- **Taxa de Erro:** `http_req_failed` e `errors` - Porcentagem de falhas
- **Taxa de Sucesso:** Métrica customizada por endpoint
- **Tempo de Resposta:** Métricas de tendência por endpoint

**Exemplo de Thresholds:**
```javascript
thresholds: {
  'http_req_duration': ['p(95)<500', 'p(99)<800'],  // 95º e 99º percentil
  'http_req_failed': ['rate<0.01'],                 // Menos de 1% de falhas
  'home_success_rate': ['rate>0.99'],               // + de 99% sucesso
  'home_response_time': ['p(95)<400'],              // 95º percentil < 400ms
},
```

---

## 🛠️ Desenvolvimento

### Dependências

- **k6** - Framework de testes de carga
- **k6-html-reporter** - Gerador de relatórios HTML
- **k6-reporter** - Reporter alternativo
- **dotenv** - Gerenciamento de variáveis de ambiente

### Padrões de Código

- **Nomes descritivos:** Use `nomeRequest` para identificar endpoints
- **Separação de responsabilidades:** Testes em `tests/`, API Client em `utils/api/`
- **Reutilização:** Sempre use `HttpClient` para chamadas HTTP
- **Dados:** Armazene dados em CSV sob `utils/data/`

---

## 📌 Convenções do Projeto

1. **Estrutura de pastas:** Organize testes por módulo/funcionalidade
2. **Nomes de arquivos:** Use snake_case para nomes de arquivo e endpoints
3. **Commits:** Descreva a funcionalidade adicionada (ex: "Add saldo endpoint test")
4. **Variáveis de ambiente:** Defina em `config.json` ou via CLI

---

## 🎯 Próximos Passos

- Adicionar mais cenários de teste
- Implementar integração com CI/CD
- Expandir biblioteca de dados de teste
- Configurar alertas baseados em thresholds