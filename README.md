# API SOLID

API REST para gerenciamento de usuários, academias e check-ins, construída com Fastify, TypeScript, Prisma e PostgreSQL.

O projeto aplica princípios do SOLID na camada de serviços e repositórios, com autenticação JWT, controle de acesso por papel de usuário e cobertura de testes com Vitest.

## Tecnologias

- Node.js
- TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- JWT
- Vitest
- Docker Compose

## Funcionalidades

- Cadastro de usuário
- Autenticação com JWT
- Refresh token via cookie
- Consulta de perfil do usuário autenticado
- Busca de academias por nome
- Busca de academias próximas por coordenadas
- Criação de academias por administradores
- Realização de check-in em academias
- Consulta de histórico de check-ins
- Consulta de métricas de check-ins
- Validação de check-ins por administradores

## Regras de negócio

- Um usuário não pode se cadastrar com e-mail duplicado
- Um usuário não pode fazer dois check-ins no mesmo dia
- O check-in só pode ser realizado se o usuário estiver a até 100m da academia
- O check-in só pode ser validado até 20 minutos após a criação
- Apenas administradores podem validar check-ins
- Apenas administradores podem cadastrar academias
- Listagens são paginadas com 20 itens por página

## Requisitos

- Node.js 20+ recomendado
- Docker e Docker Compose
- npm

## Como executar o projeto

1. Clone o repositório:

```bash
git clone https://github.com/Rohwedder7/API_SOLID.git
cd API_SOLID
```

2. Instale as dependências:

```bash
npm install
```

3. Suba o banco PostgreSQL com Docker:

```bash
docker compose up -d
```

4. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

5. Aplique as migrations:

```bash
npx prisma migrate dev
```

6. Inicie a aplicação em desenvolvimento:

```bash
npm run dev
```

Servidor padrão:

```text
http://localhost:3333
```

## Variáveis de ambiente

Exemplo disponível em `.env.example`:

```env
NODE_ENV=dev
PORT=3333
DATABASE_URL="postgresql://docker:docker@localhost:5432/apisolid?schema=public"
JWT_SECRET="super-secret-key"
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run test:unit
npm run test:e2e
npm run test:watch
npm run test:coverage
```

## Rotas principais

### Usuários e autenticação

- `POST /users` cria uma conta
- `POST /sessions` autentica e retorna o token JWT
- `PATCH /token/refresh` gera um novo token usando o cookie de refresh
- `GET /me` retorna o perfil do usuário autenticado

### Academias

- `GET /gyms/search` busca academias por nome
- `GET /gyms/nearby` lista academias próximas
- `POST /gyms` cria uma academia, disponível apenas para `ADMIN`

### Check-ins

- `POST /gyms/:gymId/check-ins` realiza check-in em uma academia
- `GET /check-ins/history` retorna o histórico do usuário autenticado
- `GET /check-ins/metrics` retorna métricas de check-ins
- `PATCH /check-ins/:checkInId/validate` valida um check-in, disponível apenas para `ADMIN`

## Autenticação e autorização

- O access token é enviado no retorno da autenticação
- O refresh token é armazenado em cookie HTTP-only
- Rotas protegidas exigem JWT válido
- Rotas administrativas exigem papel `ADMIN`

## Testes

Para rodar os testes unitários:

```bash
npm run test:unit
```

Para rodar os testes end-to-end:

```bash
npm run test:e2e
```

Para gerar cobertura:

```bash
npm run test:coverage
```

## Estrutura do projeto

```text
src/
	env/
	http/
		controllers/
		middlewares/
	lib/
	repositories/
		in-memory/
		prisma/
	services/
		errors/
		factories/
	utils/
prisma/
	migrations/
```

## Observações

- O cliente Prisma gerado fica em `generated/prisma`
- O projeto usa PostgreSQL como banco persistente
- O refresh token está configurado com cookie `secure`, então alguns clientes HTTP podem exigir contexto compatível para persistir esse cookie