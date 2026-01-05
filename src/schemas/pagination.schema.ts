import { FastifyInstance } from 'fastify';

export async function registerPaginationSchema(fastify: FastifyInstance) {
  fastify.addSchema({
    $id: 'PaginatedCommentResponse',
    type: 'object',
    properties: {
      status: { type: 'string' },
      message: { type: 'string' },
      data: {
        type: 'array',
        items: { $ref: 'Comment#' },
      },
      meta: {
        type: 'object',
        properties: {
          page: { type: 'number' },
          limit: { type: 'number' },
          total: { type: 'number' },
        },
      },
    },
  });
}
