import { FastifyInstance } from 'fastify';
import Comment, { IComment } from '../models/Comment';

export default async function commentRoutes(fastify: FastifyInstance) {
  // Get all comments
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all comments',
        tags: ['Comments'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                text: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async () => {
      const comments: IComment[] = await Comment.find();
      return comments;
    }
  );

  // Add a comment
  fastify.post<{
    Body: { text: string };
  }>(
    '/',
    {
      schema: {
        description: 'Create a new comment',
        tags: ['Comments'],
        body: {
          type: 'object',
          required: ['text'],
          properties: { text: { type: 'string' } },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              text: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const comment = new Comment({ text: request.body.text });
      await comment.save();
      reply.code(201);
      return comment;
    }
  );
}
