require('dotenv').config();
const express = require('express');
const cors = require('cors');
const unidadeRoutes = require('./src/routes/unidadeRoutes');
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
app.listen(PORT, () => {
    console.log(`[VIME 2.0] Servidor profissional a correr com sucesso na porta ${PORT}`);
});