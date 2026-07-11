# @forge/connector-core — Connector Core

## What it is
NestJS library module for integrating with external services via REST, GraphQL, Webhooks, and WebSockets.

## Why it exists
Isolates external communication logic so connectors can be managed, tested, and executed independently.

## Architecture
- domain/ — IConnectorRepository, IConnectorExecutor interfaces
- application/ — ConnectorService (CRUD + execute use cases)
- infrastructure/ — AxiosConnectorExecutor, PrismaConnectorRepository
- presentation/ — ConnectorCoreModule

## Dependencies
- @nestjs/axios, axios — HTTP execution
- @prisma/client — connector configuration persistence
- @forge/types — shared type definitions

## Depended on by
- apps/api (future modules)
