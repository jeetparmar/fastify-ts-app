import { FastifyInstance } from 'fastify';
import Comment from '../models/Comment';
import mongoose from 'mongoose';
import { badRequest, notFound, serverError } from '../utils/reply';
import { isValidObjectId } from '../utils/mongo';
import { success } from '../utils/response';

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
      const { id } = request.params;
      // Validate the Id
      if (!isValidObjectId(id)) {
        return badRequest(reply, 'Invalid comment ID');
      }
      try {
        const comment = await Comment.findById(id);
        if (!comment) {
          return notFound(reply, 'Comment not found');
        }
        return success('Comment fetched successfully', comment);
      } catch (error) {
        console.error('Error fetching comment:', error);
        return serverError(reply);
      }
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
          400: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' },
            },
          },
          500: {
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
      try {
        const { parentId } = request.query;
        // Validate the parentId if provided
        if (parentId && !mongoose.isValidObjectId(parentId)) {
          return badRequest(reply, 'Invalid parent ID');
        }
        // Build the filter based on parentId
        const filter = parentId ? { parentId } : { parentId: null };
        // Fetch comments from the database
        const comments = await Comment.find(filter).sort({ createdAt: -1 });
        return success('Comments fetched successfully', comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        return serverError(reply);
      }
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
          400: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' },
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
      try {
        const { parentId } = request.query;
        // Validate the parentId if provided
        if (parentId) {
          if (!isValidObjectId(parentId)) {
            return badRequest(reply, 'Invalid parent ID');
          }
          // If parentId is provided, check if the parent comment exists
          const exists = await Comment.exists({ _id: parentId });
          if (!exists) {
            return notFound(reply, 'Parent comment not found');
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
        return success('Comments created successfully', comment);
      } catch (error) {
        console.error('Error creating comment:', error);
        return serverError(reply);
      }
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
          400: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' },
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
      try {
        const { id } = request.params;
        const { text } = request.body;

        //Validate the Id
        if (!isValidObjectId(id)) {
          return badRequest(reply, 'Invalid comment ID');
        }

        // Update the comment
        const updated = await Comment.findByIdAndUpdate(
          id,
          { text },
          { new: true }
        );

        // Check if comment exists
        if (!updated) {
          return notFound(reply, 'Comment not found');
        }
        return success('Comments updated successfully', updated);
      } catch (error) {
        console.error('Error updating comment:', error);
        return serverError(reply);
      }
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
      try {
        const { id } = request.params;
        if (!isValidObjectId(id)) {
          return badRequest(reply, 'Invalid comment ID');
        }
        const deleted = await Comment.findByIdAndDelete(id);
        if (!deleted) {
          return notFound(reply, 'Comment not found');
        }
        // Decrement counter for parent if parentId exists
        if (deleted.parentId && mongoose.isValidObjectId(deleted.parentId)) {
          await Comment.findByIdAndUpdate(deleted.parentId, {
            $inc: { totalSubComments: -1 },
          });
        }
        return success('Comments deleted successfully', deleted);
      } catch (error) {
        console.error('Error deleting comment:', error);
        return serverError(reply);
      }
    }
  );
}
