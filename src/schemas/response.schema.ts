import { FastifyInstance } from 'fastify';

export async function registerResponseSchemas(fastify: FastifyInstance) {
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
