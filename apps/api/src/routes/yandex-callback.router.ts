import { yandexWebmasterCallback } from '@/controllers/yandex-oauth-callback.controller';
import type { FastifyPluginCallback } from 'fastify';

const router: FastifyPluginCallback = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/callback',
    handler: yandexWebmasterCallback,
  });
};

export default router;
