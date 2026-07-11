# @forge/database-engine — Database Engine

## What it is
NestJS library module for multi-tenant database provisioning and query execution via Prisma.

## Why it exists
Abstracts database management so projects can have isolated databases without leaking connection logic into the API gateway.

## Architecture
- domain/ — IDatabaseRepository, IQueryExecutor interfaces, connection value objects
- application/ — DatabaseService (list, create, query use cases)
- infrastructure/ — PrismaDatabaseRepository, PrismaQueryExecutor
- presentation/ — DatabaseEngineModule

## Dependencies
- @prisma/client — database ORM and query execution
- @forge/types — shared type definitions

## Depended on by
- apps/api (ProjectModule)
