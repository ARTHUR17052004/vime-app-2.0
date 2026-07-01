require('dotenv').config();

const express = require('express');
const cors = require('cors');

const unidadeRoutes = require('./src/routes/unidadeRoutes');
const kitnetRouts = require('./src/routes/kitnetRoutes');
const inquilinoRoutes = require('./src/routes/inquilinoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const authRoutes = require('./src/routes/authRoutes');
const locadorRoutes = require('./src/routes/locadorRoutes');
const contratoRoutes = require('./src/routes/contratoRoutes');
const receitaRoutes = require('./src/routes/receitaRoutes');
const despesaRoutes = require('./src/routes/despesaRoutes');
const financeiroRoutes = require('./src/routes/financeiroRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const asaasRoutes = require('./src/routes/asaasRoutes');

const errorMiddleware = require('./src/middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      api: 'VIME 2.0 Backend',
      version: '1.0.0'
    }
  });
});

app.use('/unidades', unidadeRoutes);
app.use('/kitnets', kitnetRouts);
app.use('/inquilinos', inquilinoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/auth', authRoutes);
app.use('/locadores', locadorRoutes);
app.use('/despesas', despesaRoutes);
app.use('/contratos', contratoRoutes);
app.use('/receitas', receitaRoutes);
app.use('/financeiro', financeiroRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/asaas', asaasRoutes);

// Middleware global de tratamento de erros
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[VIME 2.0] Servidor profissional a correr com sucesso na porta ${PORT}`);
});