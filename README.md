# Solicitações de Atendimento — V-Lab / CIn UFPE

Sistema full stack para registrar e acompanhar solicitações de atendimento em unidades públicas de saúde.

---

## Tecnologias e versões

| Camada         | Tecnologia              | Versão        |
|----------------|-------------------------|---------------|
| Frontend       | React + TypeScript      | 18.x / 5.x   |
| Build frontend | Vite                    | 5.x           |
| Estilo         | Tailwind CSS            | 3.x           |
| HTTP client    | Axios                   | 1.x           |
| Backend        | PHP + Laravel           | 8.3 / 11.x   |
| Banco de dados | PostgreSQL              | 16            |
| Infraestrutura | Docker + Docker Compose | 27.x / 2.x   |
| Testes backend | Pest (sobre PHPUnit)    | 2.x           |
| Testes frontend| Vitest + Testing Library| 2.x / 16.x   |

---

## Como executar com Docker Compose

### Pré-requisito
[Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando.

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>
```

### 2. Configure o ambiente do backend

```bash
cp backend/.env.example backend/.env
```

> O `.env.example` já contém as variáveis corretas para o ambiente Docker. Não é necessário alterar nada para rodar localmente.

### 3. Suba todos os serviços

```bash
docker compose up --build
```

O Docker Compose irá:
- Subir o PostgreSQL e aguardar ele ficar saudável
- Rodar `php artisan migrate` automaticamente
- Popular o banco com dados fictícios via `php artisan db:seed`
- Subir a API Laravel em `http://localhost:8000`
- Buildar e servir o frontend em `http://localhost:5173`

### 4. Acesse

| Serviço       | URL                              |
|---------------|----------------------------------|
| Frontend      | http://localhost:5173            |
| API           | http://localhost:8000/api/v1     |
| Health check  | http://localhost:8000/api/v1/health |

### Parar os serviços

```bash
docker compose down
# Para remover também o volume do banco:
docker compose down -v
```

---

## Como executar os testes

### Backend (Pest)

```bash
docker compose exec api ./vendor/bin/pest
```

Ou localmente (com PHP e Composer instalados):

```bash
cd backend
composer install
cp .env.example .env.testing
php artisan key:generate --env=testing
./vendor/bin/pest
```

Os testes usam `RefreshDatabase` com banco SQLite em memória — não afetam o banco de desenvolvimento.

### Frontend (Vitest + Testing Library)

```bash
docker compose exec frontend npm test
```

Ou localmente:

```bash
cd frontend
npm install
npm test
```

---

## Especificação OpenAPI

O arquivo `backend/docs/openapi.yaml` descreve todos os endpoints, parâmetros, corpos de requisição e respostas.

Para visualizar no Swagger UI, acesse após subir os containers:

```
http://localhost:8000/api/documentation
```

Ou abra o arquivo `backend/docs/openapi.yaml` diretamente em [editor.swagger.io](https://editor.swagger.io).

---

## Arquitetura e decisões técnicas

### Organização geral

```
/
├── backend/          # API REST em Laravel
├── frontend/         # SPA em React + TypeScript
└── docker-compose.yml
```

### Backend — separação de responsabilidades

```
app/
├── Enums/            # StatusSolicitacao (com lógica de transição), Categoria, Prioridade
├── Exceptions/       # TransicaoStatusInvalidaException + Handler JSON consistente
├── Http/
│   ├── Controllers/  # Thin controllers — só recebem request e delegam
│   ├── Requests/     # Form Requests com validação e mensagens em português
│   └── Resources/    # API Resources — contrato de saída tipado
├── Models/           # Eloquent com scopes para filtros
└── Services/         # SolicitacaoService — toda a lógica de negócio aqui
```

**Decisão principal:** a lógica de transição de status fica dentro do próprio enum `StatusSolicitacao`, no método `podeTransicionarPara()`. Isso torna a regra testável de forma isolada (testes unitários sem banco) e evita if/else espalhados.

**Form Requests** centralizam a validação, incluindo a regra condicional de `justificativa_prioridade` obrigatória quando `prioridade = URGENTE`.

**Sem abstrações desnecessárias:** não há Repository, não há camada de DTO, não há Policy (sem autenticação). As abstrações existentes têm benefício demonstrável.

### Frontend — organização por responsabilidade

```
src/
├── api/          # client.ts (axios + extração de erros) + solicitacoes.ts
├── components/
│   ├── layout/   # Layout com sidebar
│   ├── solicitacao/ # FormularioSolicitacao, DetalheSolicitacao
│   └── ui/       # Componentes atômicos reutilizáveis (Badge, Button, Field...)
├── hooks/        # useSolicitacoes, useSolicitacao — estado assíncrono isolado
├── pages/        # Dashboard, ListaSolicitacoes, NovaSolicitacao
├── types/        # Contratos TypeScript alinhados com a API
└── utils/        # constants.ts — labels e classes por status/prioridade/categoria
```

**Contrato frontend ↔ API:** os tipos em `src/types/index.ts` espelham exatamente a resposta da API Resource do Laravel. O campo `proximos_status` na resposta permite ao frontend saber dinamicamente quais botões de transição exibir, sem duplicar a lógica de negócio.

**Hooks com `useReducer`:** os estados de loading/success/error são gerenciados com reducer em vez de múltiplos `useState`, tornando as transições de estado explícitas e previsíveis.

**Sem biblioteca de formulário:** o formulário é controlado com estado local simples, o que é suficiente para o escopo e reduz dependências.

### Banco de dados

- Enum do PostgreSQL via `->enum()` no Eloquent — restrição de integridade no nível do banco
- Índices em `status`, `categoria`, `prioridade` e `created_at` — alinhados com os filtros da API
- Constraint `unique` em `protocolo`
- `created_at` e `updated_at` do Eloquent mapeados como `data_criacao` e `data_atualizacao` no Resource

---

## Funcionalidades implementadas

- [x] Criar solicitação com protocolo único gerado automaticamente
- [x] Status inicial sempre `RECEBIDA`
- [x] Prioridade `URGENTE` exige justificativa (validado no backend e no frontend)
- [x] Fluxo de transição de status com regras: RECEBIDA → EM_ANALISE → AGENDADA → CONCLUIDA/CANCELADA
- [x] Status finais (CONCLUIDA, CANCELADA) não permitem alteração
- [x] Listagem paginada com filtros por status, categoria e prioridade
- [x] Detalhe de solicitação com botões de transição de status
- [x] Dashboard com KPIs por status e urgentes pendentes
- [x] Validação com mensagens claras no frontend e no backend
- [x] Estados visuais de carregamento, erro e vazio
- [x] Layout responsivo com sidebar
- [x] Docker Compose com healthcheck no PostgreSQL
- [x] Migrations e seeders com dados fictícios
- [x] Health check da API (`GET /api/v1/health`)
- [x] Especificação OpenAPI em `backend/docs/openapi.yaml`



---

## Uso de inteligência artificial

Este projeto foi desenvolvido com auxílio do **Claude (Anthropic)** nas seguintes partes:

- **Geração da estrutura inicial** dos arquivos de backend e frontend
- **Revisão de decisões de arquitetura** (separação de responsabilidades, onde colocar a lógica de transição)
- **Geração dos testes** (Pest e Vitest), revisados e ajustados manualmente
- **Documentação do projeto** 

Todo o código gerado foi lido, compreendido e é explicável pelo candidato. Conforme a política do desafio, poderão ser solicitadas explicações ou alterações na entrevista técnica.

---

## Dados fictícios

Todos os dados usados (nomes, descrições, justificativas) são fictícios e gerados pela biblioteca Faker do Laravel. Nenhum dado pessoal, clínico ou sensível real foi utilizado.