import { FastifyReply } from 'fastify';

export const badRequest = (reply: FastifyReply, message: string) =>
  reply.code(400).send({ status: 'failure', message });

export const notFound = (reply: FastifyReply, message: string) =>
  reply.code(404).send({ status: 'failure', message });

export const serverError = (reply: FastifyReply) =>
  reply.code(500).send({ status: 'failure', message: 'Internal Server Error' });
