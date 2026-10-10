#!/usr/bin/env node
//
// FORK (Openpanel RU): публичная регистрация выпилена. Учётные записи
// задаёт администратор напрямую в БД этим скриптом — создание нового
// пользователя и сброс/смена пароля существующего.
//
// Использование (внутри контейнера API, из каталога self-hosting):
//   docker compose exec op-api node /app/apps/api/scripts/create-user.mjs <email> <пароль> [Имя] [Фамилия]
//
// Примеры:
//   docker compose exec op-api node /app/apps/api/scripts/create-user.mjs admin@example.com 'S3cretP@ss'
//   docker compose exec op-api node /app/apps/api/scripts/create-user.mjs admin@example.com 'НовыйПароль'   # сменит пароль существующему
//
// Скрипт сам подключается к БД через DATABASE_URL из окружения контейнера.
// Пароль хэшируется argon2id с теми же параметрами, что и при обычном входе.

import { createRequire } from 'node:module';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..');

/**
 * Прод-образ собирается с изолированным pnpm-линкером, а RUNNER-слой
 * копирует только корневой node_modules — где именно лежат @prisma/client
 * и @node-rs/argon2 зависит от того, восстановил ли pnpm пер-пакетные
 * ссылки при `pnpm db:codegen`. Пробуем несколько стратегий резолва.
 */
async function resolveModule(name, fallbackPackageDirs) {
  // 1) обычный резолв из самого скрипта (apps/api — прямой deps)
  try {
    return await import(name);
  } catch {}

  // 2) резолв от package.json конкретных пакетов
  for (const dir of fallbackPackageDirs) {
    try {
      const req = createRequire(path.join(repoRoot, dir, 'package.json'));
      return await import(req.resolve(name));
    } catch {}
  }

  // 3) резолв от корня репо/контейнера
  try {
    const req = createRequire(path.join(repoRoot, 'package.json'));
    return await import(req.resolve(name));
  } catch {}

  console.error(
    `Не удалось загрузить модуль "${name}".\n` +
      'Запустите скрипт через pnpm, чтобы он видел зависимости пакета:\n' +
      '  docker compose exec op-api pnpm --dir /app/apps/api exec node scripts/create-user.mjs <email> <пароль>',
  );
  process.exit(1);
}

const { PrismaClient } = await resolveModule('@prisma/client', [
  path.join('packages', 'db'),
]);
const { hash } = await resolveModule('@node-rs/argon2', [
  path.join('packages', 'auth'),
]);

// Параметры argon2id — 1:1 с packages/auth/src/password.ts (hashPassword)
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

function printUsage() {
  console.error(
    'Использование: node create-user.mjs <email> <пароль> [Имя] [Фамилия]\n' +
      'Если пользователь с таким email уже есть — будет обновлён его пароль.',
  );
}

async function main() {
  const [email, password, firstName = '', lastName = ''] =
    process.argv.slice(2);

  if (!email || !password) {
    printUsage();
    process.exit(1);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`Некорректный email: ${email}`);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Пароль должен быть не короче 8 символов.');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await hash(password, ARGON2_OPTIONS);

    const existing = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (existing) {
      const emailAccount = existing.accounts.find(
        (account) => account.provider === 'email',
      );
      if (emailAccount) {
        await prisma.account.update({
          where: { id: emailAccount.id },
          data: { password: passwordHash },
        });
        console.log(
          `Пароль обновлён для ${email} (user id: ${existing.id}). Старые сессии остаются активными — при необходимости удалите их в таблице sessions.`,
        );
      } else {
        await prisma.account.create({
          data: {
            userId: existing.id,
            email,
            provider: 'email',
            password: passwordHash,
          },
        });
        console.log(
          `К существующему пользователю ${email} (id: ${existing.id}) добавлен вход по паролю.`,
        );
      }
      return;
    }

    const user = await prisma.user.create({
      data: {
        id: `user_${randomBytes(13).toString('base64url')}`,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        accounts: {
          create: {
            email,
            provider: 'email',
            password: passwordHash,
          },
        },
      },
    });

    console.log(`Пользователь создан: ${email} (id: ${user.id})`);
    console.log(
      'Теперь войдите в панель с этим email и паролем. После первого входа панель предложит создать организацию и проект.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Ошибка:', error?.message ?? error);
  process.exit(1);
});
