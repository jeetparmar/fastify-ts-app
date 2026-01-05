import { FastifyInstance } from 'fastify';
import Comment from '../models/Comment';
import mongoose from 'mongoose';

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
      if (!mongoose.isValidObjectId(id)) {
        return reply
          .code(400)
          .send({ status: 'failure', message: 'Invalid comment ID' });
      }

      try {
        const comment = await Comment.findById(id);
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
      } catch (error) {
        console.error('Error fetching comment:', error);
        return reply
          .code(500)
          .send({ status: 'failure', message: 'Internal Server Error' });
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
          return reply
            .code(400)
            .send({ status: 'failure', message: 'Invalid parentId' });
        }
        // Build the filter based on parentId
        const filter = parentId ? { parentId } : { parentId: null };

        // Fetch comments from the database
        const comments = await Comment.find(filter).sort({ createdAt: -1 });
        return {
          status: 'success',
          message: 'Comments fetched successfully',
          data: comments,
        };
      } catch (error) {
        console.error('Error fetching comments:', error);
        return reply
          .code(500)
          .send({ status: 'failure', message: 'Internal Server Error' });
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
        if (parentId && !mongoose.isValidObjectId(parentId)) {
          return reply
            .code(400)
            .send({ status: 'failure', message: 'Invalid parentId' });
        }
        // If parentId is provided, check if the parent comment exists
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
      } catch (error) {
        console.error('Error creating comment:', error);
        return reply
          .code(500)
          .send({ status: 'failure', message: 'Internal Server Error' });
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
        if (!mongoose.isValidObjectId(id)) {
          return reply
            .code(400)
            .send({ status: 'failure', message: 'Invalid comment ID' });
        }

        // Update the comment
        const updated = await Comment.findByIdAndUpdate(
          id,
          { text },
          { new: true }
        );

        // Check if comment exists
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
      } catch (error) {
        console.error('Error updating comment:', error);
        return reply
          .code(500)
          .send({ status: 'failure', message: 'Internal Server Error' });
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
        if (!mongoose.isValidObjectId(request.params.id)) {
          return reply
            .code(400)
            .send({ status: 'failure', message: 'Invalid comment ID' });
        }
        const deleted = await Comment.findByIdAndDelete(request.params.id);
        if (!deleted) {
          return reply
            .code(404)
            .send({ status: 'failure', message: 'Comment not found' });
        }
        // Decrement counter for parent if parentId exists
        if (deleted.parentId && mongoose.isValidObjectId(deleted.parentId)) {
          await Comment.findByIdAndUpdate(deleted.parentId, {
            $inc: { totalSubComments: -1 },
          });
        }
        return {
          status: 'success',
          message: 'Comment deleted successfully',
          data: deleted,
        };
      } catch (error) {
        console.error('Error deleting comment:', error);
        return reply
          .code(500)
          .send({ status: 'failure', message: 'Internal Server Error' });
      }
    }
  );
}
