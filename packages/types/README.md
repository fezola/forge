# @forge/types — Shared Types

## What it is
Pure TypeScript package containing all shared interfaces, types, and DTOs used across the Forge monorepo.

## Why it exists
Prevents circular dependencies and ensures type consistency between packages. Every engine and app imports from here rather than defining duplicate types.

## Dependencies
- None (zero-dependency)

## Depended on by
- All packages and apps in the monorepo
