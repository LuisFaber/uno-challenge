# ONE CRM

Mini CRM para gerenciamento de contatos e oportunidades comerciais (leads).

---

## Como rodar

### Pré-requisito

- [Docker](https://www.docker.com/) instalado e rodando.

### Subir o projeto

Na raiz do repositório, execute:

```bash
docker compose up --build
```

Isso irá subir automaticamente:

| Serviço    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:5173       |
| API (REST) | http://localhost:3000       |
| MySQL      | `localhost:3306`            |

Acesse o sistema em **http://localhost:5173**.

> Na primeira execução o banco de dados é criado e populado automaticamente. Se o container da API iniciar antes do MySQL estar pronto, ele tentará reconectar automaticamente.

---

## Funcionalidades

### Contatos

- Listar, criar, editar e excluir contatos.
- Busca por nome ou e-mail.
- Ordenação por data de criação ou nome.
- Paginação.

### Leads

- Listar, criar, editar e excluir leads.
- Cada lead está vinculado a um contato existente.
- Filtro por status e busca por nome ou empresa.
- Ordenação por data de criação ou nome.
- Paginação.
- Ação de "Ir para contato" na tabela: redireciona para a página de Contatos com a busca preenchida automaticamente.

### Status dos leads

| Status      | Descrição                              |
|-------------|----------------------------------------|
| `novo`      | Lead recém-criado                      |
| `contactado`| Contato feito com o lead               |
| `qualificado`| Lead qualificado para negociação      |
| `convertido`| Negócio fechado                        |
| `perdido`   | Oportunidade perdida                   |

---

## Estrutura do projeto

```
uno-challenge/
├── backend/          # API REST (Node.js + Hono + MySQL)
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── schemas/  # validação com Zod
│       ├── types/
│       └── db/       # conexão e inicialização do banco
├── frontend/         # SPA (React + Vite + Tailwind CSS)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/ # chamadas à API
│       └── types/
└── docker-compose.yml
```

---

## Endpoints da API

### Contatos — `/contacts`

| Método | Rota                     | Descrição                             |
|--------|--------------------------|---------------------------------------|
| GET    | `/contacts`              | Lista contatos (suporta `?search=`)   |
| POST   | `/contacts`              | Cria um contato                       |
| PUT    | `/contacts/:id`          | Atualiza um contato                   |
| DELETE | `/contacts/:id`          | Remove um contato                     |
| GET    | `/contacts/:id/leads`    | Lista leads de um contato             |

**Corpo para criar/atualizar contato:**
```json
{
  "name": "Maria Silva",
  "email": "maria@exemplo.com",
  "phone": "(11) 91234-5678"
}
```

### Leads — `/leads`

| Método | Rota          | Descrição                                                         |
|--------|---------------|-------------------------------------------------------------------|
| GET    | `/leads`      | Lista leads (suporta `?search`, `?status`, `?page`, `?limit`, `?orderBy`, `?order`) |
| POST   | `/leads`      | Cria um lead                                                      |
| PUT    | `/leads/:id`  | Atualiza um lead                                                  |
| DELETE | `/leads/:id`  | Remove um lead                                                    |

**Corpo para criar/atualizar lead:**
```json
{
  "contactId": "uuid-do-contato",
  "name": "João Leads",
  "company": "Empresa XYZ",
  "status": "novo"
}
```

---

## Stack

| Camada    | Tecnologia                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, TypeScript |
| Backend   | Node.js 20, Hono, TypeScript            |
| Banco     | MySQL 8                                 |
| Containers| Docker + Docker Compose                 |
