import { FastifyInstance } from 'fastify';
import Comment from '../models/Comment';
import mongoose from 'mongoose';
import { isValidObjectId } from '../utils/mongo';
import * as commentService from '../services/comment.service';
import { badRequest, notFound, serverError, success } from '../utils/response';

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
            allOf: [
              { $ref: 'SuccessResponse#' },
              {
                properties: {
                  data: { $ref: 'Comment#' },
                },
              },
            ],
          },
          404: { $ref: 'ErrorResponse#' },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      if (!isValidObjectId(id)) {
        return badRequest(reply, 'Invalid comment ID');
      }
      const comment = await commentService.getById(id);
      if (!comment) {
        return notFound(reply, 'Comment not found');
      }
      return success('Comment fetched successfully', comment);
    }
  );

  // Get all comments
  fastify.get<{
    Querystring: {
      parentId?: string;
      page?: number;
      limit?: number;
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
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
        response: {
          200: { $ref: 'PaginatedCommentResponse#' },
          400: { $ref: 'ErrorResponse#' },
          500: { $ref: 'ErrorResponse#' },
        },
      },
    },
    async (request, reply) => {
      const { parentId } = request.query;
      if (parentId && !mongoose.isValidObjectId(parentId)) {
        return badRequest(reply, 'Invalid parent ID');
      }
      const page = Math.max(1, request.query.page ?? 1);
      const limit = Math.min(50, request.query.limit ?? 10);
      const filter = parentId ? { parentId } : { parentId: null };
      const comments = await commentService.getAll(filter, page, limit);
      return success('Comments fetched successfully', comments);
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
            allOf: [
              { $ref: 'SuccessResponse#' },
              { properties: { data: { $ref: 'Comment#' } } },
            ],
          },
          400: { $ref: 'ErrorResponse#' },
          404: { $ref: 'ErrorResponse#' },
        },
      },
    },
    async (request, reply) => {
      const { parentId } = request.query;
      if (parentId) {
        if (!isValidObjectId(parentId)) {
          return badRequest(reply, 'Invalid parent ID');
        }
        const exists = await commentService.exists(parentId);
        if (!exists) {
          return notFound(reply, 'Parent comment not found');
        }
      }

      const comment = await commentService.create(request.body.text, parentId);
      if (parentId) {
        await commentService.incSubCount(parentId, 1);
      }
      reply.code(201);
      return success('Comments created successfully', comment);
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
            allOf: [
              { $ref: 'SuccessResponse#' },
              { properties: { data: { $ref: 'Comment#' } } },
            ],
          },
          400: { $ref: 'ErrorResponse#' },
          404: { $ref: 'ErrorResponse#' },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { text } = request.body;
      if (!isValidObjectId(id)) {
        return badRequest(reply, 'Invalid comment ID');
      }
      const updated = await commentService.updateById(id, text);
      if (!updated) {
        return notFound(reply, 'Comment not found');
      }
      return success('Comments updated successfully', updated);
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
        response: {
          200: {
            allOf: [
              { $ref: 'SuccessResponse#' },
              { properties: { data: { $ref: 'Comment#' } } },
            ],
          },
          404: { $ref: 'ErrorResponse#' },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      if (!isValidObjectId(id)) {
        return badRequest(reply, 'Invalid comment ID');
      }
      const deleted = await commentService.deleteById(id);
      if (!deleted) {
        return notFound(reply, 'Comment not found');
      }
      if (deleted.parentId && mongoose.isValidObjectId(deleted.parentId)) {
        await commentService.incSubCount(deleted.parentId, -1);
      }
      return success('Comments deleted successfully', deleted);
    }
  );
}
