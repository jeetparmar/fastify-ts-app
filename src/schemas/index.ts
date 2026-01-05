import { FastifyInstance } from 'fastify';
import { registerCommentSchema } from './comment.schema';

export async function registerSchemas(fastify: FastifyInstance) {
  await registerCommentSchema(fastify);
}
