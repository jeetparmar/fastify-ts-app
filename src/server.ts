import Fastify from 'fastify';
import cors from '@fastify/cors';
import dbConnector from './plugins/db';
import commentRoutes from './routes/comment';
import { PORT } from './config';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { registerCommentSchema } from './schemas/comment.schema';

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, { origin: '*' });

// Register MongoDB plugin
fastify.register(dbConnector);

// Register Swagger
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Comments API',
      description:
        'API documentation for Fastify + TypeScript + MongoDB project',
      version: '1.0.0',
    },
    host: `localhost:${PORT}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
});

fastify.register(swaggerUI, {
  routePrefix: '/docs', // Swagger UI at /docs
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// Register routes
fastify.register(commentRoutes, { prefix: '/api/v1/comments' });

// Start server
const start = async () => {
  try {
    await registerCommentSchema(fastify);
    await fastify.listen({ port: Number(PORT) });
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
