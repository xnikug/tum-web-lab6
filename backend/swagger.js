const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Subscription Tracker API',
      version: '1.0.0',
      description: `
## TUM Web Lab 7 — CRUD REST API

Manage **Subscriptions**, **API Keys**, and **API Usage** records backed by PostgreSQL.

### Quick start
1. Call **POST /token** with \`{"role":"ADMIN"}\` to get a 60-second JWT.
2. Click **Authorize** and paste \`Bearer <token>\`.
3. All CRUD endpoints are now unlocked.

### Roles & permissions
| Role    | READ | WRITE | DELETE |
|---------|------|-------|--------|
| ADMIN   | ✓    | ✓     | ✓      |
| WRITER  | ✓    | ✓     |        |
| VISITOR | ✓    |       |        |

You can also pass a custom \`permissions\` array instead of a role.
      `,
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local / Docker dev' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth',          description: 'Token generation (no auth required)' },
      { name: 'Subscriptions', description: 'Subscription CRUD' },
      { name: 'API Keys',      description: 'API key management' },
      { name: 'API Usage',     description: 'Usage log CRUD' },
    ],
  },
  apis: ['./routes/*.js'],
});
