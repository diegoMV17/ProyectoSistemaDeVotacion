

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/config';

import userRoutes from './routes/users.routes';
import eleccionesRoutes from './routes/elecciones.routes';
import candidaturasRoutes from './routes/candidaturas.routes';
import votosRoutes from './routes/votos.routes';
import perfilesRoutes from './routes/perfiles.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
//app.use('/api/auth', authRoutes);               // Login y registro
app.use('/api/users', userRoutes);              // Usuarios
app.use('/api/perfiles', perfilesRoutes);       // Perfiles
app.use('/api/elecciones', eleccionesRoutes);   // Elecciones
app.use('/api/candidaturas', candidaturasRoutes); // Candidaturas
app.use('/api/votos', votosRoutes);             // Votaciones

// Ruta de prueba
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'API de votación funcionando correctamente 🚀' });
});

// Middleware 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: config.nodeEnv === 'development' ? err.message : {}
  });
});

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`✅ Servidor iniciado en puerto ${config.port}`);
});

export default app;