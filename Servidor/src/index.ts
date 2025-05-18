import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Servidor funcionando 🚀' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});