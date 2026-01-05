import { FastifyInstance } from 'fastify';
import Comment from '../models/Comment';

export default async function commentRoutes(fastify: FastifyInstance) {
  // Get a single comment by ID
  fastify.get<{
    Params: {
      id: string;
    };
  }>(
    '/:id',
    {
      schema: {
        description: 'Get a comment by ID',
        tags: ['Comments'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },

        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' },
              data: { $ref: 'Comment#' },
            },
          },
          404: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const comment = await Comment.findById(request.params.id);
      if (!comment) {
        return reply
          .code(404)
          .send({ status: 'failure', message: 'Comment not found' });
      }
      return {
        status: 'success',
        message: 'Comment fetched successfully',
        data: comment,
      };
    }
  );

  // Get all comments
  fastify.get<{
    Querystring: {
      parentId?: string;
    };
  }>(
    '/',
    {
      schema: {
        description: 'Get comments (top-level or replies)',
        tags: ['Comments'],
        querystring: {
          type: 'object',
          properties: {
            parentId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' },
              data: {
                type: 'array',
                items: { $ref: 'Comment#' },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { parentId } = request.query;
      const filter = parentId ? { parentId } : { parentId: null };
      const comments = await Comment.find(filter).sort({ createdAt: -1 });
      return {
        status: 'success',
        message: 'Comments fetched successfully',
        data: comments,
      };
    }
  );

  // Add a comment
  fastify.post<{
    Querystring: {
      parentId?: string;
    };
    Body: {
      text: string;
    };
  }>(
    '/',
    {
      schema: {
        description: 'Create a comment or reply',
        tags: ['Comments'],
        querystring: {
          type: 'object',
          properties: {
            parentId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' },
              data: { $ref: 'Comment#' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { parentId } = request.query;
      if (parentId) {
        const parent = await Comment.findById(parentId);
        if (!parent) {
          return reply
            .code(404)
            .send({ status: 'failure', message: 'Parent comment not found' });
        }
      }
      const comment = new Comment({
        text: request.body.text,
        parentId: parentId ?? null,
      });
      await comment.save();
      // Increment counter for parent
      if (parentId) {
        await Comment.findByIdAndUpdate(parentId, {
          $inc: { totalSubComments: 1 },
        });
      }
      reply.code(201);
      return {
        status: 'success',
        message: 'Comment created successfully',
        data: comment,
      };
    }
  );

  // Update a comment
  fastify.put<{
    Params: {
      id: string;
    };
    Body: {
      text: string;
    };
  }>(
    '/:id',
    {
      schema: {
        description: 'Update a comment by ID',
        tags: ['Comments'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' },
              data: { $ref: 'Comment#' },
            },
          },
          404: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const updated = await Comment.findByIdAndUpdate(
        request.params.id,
        { text: request.body.text },
        { new: true }
      );
      if (!updated) {
        return reply
          .code(404)
          .send({ status: 'failure', message: 'Comment not found' });
      }
      return {
        status: 'success',
        message: 'Comment updated successfully',
        data: updated,
      };
    }
  );

  // Delete a comment by ID
  fastify.delete<{
    Params: {
      id: string;
    };
  }>(
    '/:id',
    {
      schema: {
        description: 'Delete a comment by ID',
        tags: ['Comments'],
      },
    },
    async (request, reply) => {
      const deleted = await Comment.findByIdAndDelete(request.params.id);
      if (!deleted) {
        return reply
          .code(404)
          .send({ status: 'failure', message: 'Comment not found' });
      }
      // Decrement counter for parent
      if (deleted.parentId) {
        await Comment.findByIdAndUpdate(deleted.parentId, {
          $inc: { totalSubComments: -1 },
        });
      }
      return {
        status: 'success',
        message: 'Comment deleted successfully',
      };
    }
  );
}
