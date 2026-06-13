require('dotenv').config();
const express = require('express');
const cors = require('cors');
const unidadeRoutes = require('./src/routes/unidadeRoutes');
const kitnetRouts = require('./src/routes/kitnetRoutes');
const inquilinoRoutes = require('./src/routes/inquilinoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const authRoutes = require('./src/routes/authRoutes');
const locadorRoutes = require('./src/routes/locadorRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: "ok"
        }
    });
});
app.use('/unidades', unidadeRoutes);
app.use('/kitnets', kitnetRouts);
app.use('/inquilinos', inquilinoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/auth', authRoutes);
app.use('/locadores', locadorRoutes);
app.listen(PORT, () => {
    console.log(`[VIME 2.0] Servidor profissional a correr com sucesso na porta ${PORT}`);
});