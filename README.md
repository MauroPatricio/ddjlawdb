# DDJLawDB - Estrutura Full-Stack (Node.js + Express + React + MongoDB)

Projecto full-stack totalmente configurável com backend modular em Node.js / Express, base de dados MongoDB (Mongoose) e frontend moderno em React com Vite.

## 🚀 Como Iniciar o Projecto

### 1. Instalar todas as dependências
Execute o comando de setup na raiz do repositório para instalar as dependências da raiz, do `backend` e do `frontend`:

```bash
npm run setup
```

### 2. Configurar as Variáveis de Ambiente

#### Backend (`backend/.env`):
Certifique-se de que o ficheiro `backend/.env` está criado com as credenciais do MongoDB e portas desejadas:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://nhiquelaservicos_db_user:DlGfgQnbACDh53Rd@cluster0.mongodb.net/ddjlawdb?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=sua_chave_secreta_super_segura_aqui
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Executar o Ambiente de Desenvolvimento
Para iniciar tanto o backend (`localhost:5000`) como o frontend (`localhost:5173`) em simultâneo:

```bash
npm run dev
```

---

## 📁 Arquitetura do Projecto

```
ddjlawdb/
├── backend/                # Backend Node.js + Express
│   ├── src/
│   │   ├── config/         # Conexão MongoDB (db.js)
│   │   ├── controllers/    # Lógica de rotas e pedidos
│   │   ├── middlewares/    # Middleware de erro, auth, CORS
│   │   ├── models/         # Modelos Mongoose
│   │   ├── routes/         # Rotas /api/v1
│   │   └── index.js        # Ponto de entrada do servidor
│
└── frontend/               # Frontend React + Vite
    ├── src/
    │   ├── components/     # Componentes UI reutilizáveis
    │   ├── services/       # Instância Axios com base URL da API
    │   ├── App.jsx         # Aplicação React Principal
    │   └── main.jsx        # Ponto de entrada React
```
