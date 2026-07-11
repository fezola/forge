# @forge/auth-engine — Authentication Engine

## What it is
NestJS library module providing JWT authentication, password hashing, and session management.

## Why it exists
Isolated auth logic so the API gateway and other services can reuse authentication without duplication.

## Architecture (Clean Architecture / DDD)
- domain/ — Interfaces (IAuthRepository, ITokenService, IPasswordHasher) and value objects (Email, Password, RefreshToken)
- application/ — AuthService (register, login, refresh, logout use cases)
- infrastructure/ — JwtTokenService, BcryptPasswordHasher, RedisAuthRepository, JwtStrategy
- presentation/ — AuthEngineModule (DI wiring and exports)

## Dependencies
- @nestjs/jwt, @nestjs/passport, passport, passport-jwt — JWT handling
- bcrypt — password hashing
- ioredis — refresh token storage
- @forge/types — shared type definitions

## Depended on by
- apps/api (AuthModule, UserModule)
- packages/database-engine (optional)
