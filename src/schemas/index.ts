import { FastifyInstance } from 'fastify';
import { registerCommentSchema } from './comment.schema';
import { registerResponseSchemas } from './response.schema';
import { registerPaginationSchema } from './pagination.schema';

export async function registerSchemas(fastify: FastifyInstance) {
  await registerCommentSchema(fastify);
  await registerResponseSchemas(fastify);
  await registerPaginationSchema(fastify);
}
