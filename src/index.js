import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { router as itemsRouter } from './items.routes.js';

dotenv.config();

const app = express();

// Puerto para Railway
const PORT = process.env.PORT || 8080;

// ✅ CORS PERMITIENDO LOCALHOST Y VERCEL
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://frontend-crud-fullstack.vercel.app"
  ]
}));

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente 🚀' });
});

app.use('/api/items', itemsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
