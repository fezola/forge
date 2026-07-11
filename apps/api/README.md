# @forge/api — API Gateway

## What it is
The NestJS API gateway. Entry point for all external requests. Routes to appropriate engines.

## Why it exists
Single entry point enforcing authentication, rate limiting, validation, and observability.

## Dependencies
- @forge/auth-engine — authentication use cases
- @forge/database-engine — database operations
- @forge/storage-engine — file storage operations
- @forge/connector-core — external service connections
- @forge/types — shared type definitions

## Depended on by
- apps/dashboard (via HTTP)
- apps/plugin (via HTTP)
- packages/sdk (via HTTP)
