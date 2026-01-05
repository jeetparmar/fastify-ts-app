import { FastifyInstance } from 'fastify';

export async function registerResponseSchemas(fastify: FastifyInstance) {
  // Cursor meta schema
  fastify.addSchema({
    $id: 'CursorMeta',
    type: 'object',
    properties: {
      nextCursor: { type: 'string', nullable: true },
      hasMore: { type: 'boolean' },
      limit: { type: 'number' },
    },
  });
  // Generic success wrapper
  fastify.addSchema({
    $id: 'SuccessResponse',
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      message: { type: 'string' },
      data: {},
    },
  });

  // Error wrapper
  fastify.addSchema({
    $id: 'ErrorResponse',
    type: 'object',
    properties: {
      status: { type: 'string', example: 'failure' },
      message: { type: 'string' },
    },
  });
}
