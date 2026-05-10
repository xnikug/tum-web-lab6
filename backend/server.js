const express    = require('express');
const cors       = require('cors');
const swaggerUi  = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { initDb } = require('./database');

const authRoutes         = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');
const apiKeyRoutes       = require('./routes/apiKeys');
const apiUsageRoutes     = require('./routes/apiUsage');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Subscription Tracker API',
  swaggerOptions: { persistAuthorization: true },
}));

// Token endpoint — no authentication required
app.use('/token', authRoutes);

// Protected CRUD routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/api-keys',      apiKeyRoutes);
app.use('/api/api-usage',     apiUsageRoutes);

// Health check
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
      console.log(`Swagger UI  →  http://localhost:${PORT}/api-docs`);
      console.log(`Get a token →  POST http://localhost:${PORT}/token\n`);
    });
  })
  .catch(err => {
    console.error('Failed to initialise database:', err.message);
    process.exit(1);
  });
