import { FastifyInstance } from 'fastify';

export async function registerCommentSchema(fastify: FastifyInstance) {
  fastify.addSchema({
    $id: 'Comment',
    type: 'object',
    properties: {
      id: { type: 'string' },
      text: { type: 'string' },
      totalSubComments: { type: 'number' },
      parentId: { type: ['string', 'null'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  });
}
