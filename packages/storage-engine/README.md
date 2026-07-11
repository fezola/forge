# @forge/storage-engine — Storage Engine

## What it is
NestJS library module for multi-provider file storage (S3, GCS, Azure, Local).

## Why it exists
Abstracts file storage behind a clean interface so the API gateway handles files without provider-specific code.

## Architecture
- domain/ — IStorageRepository, IFileStorageProvider interfaces
- application/ — StorageService (upload, list, delete use cases)
- infrastructure/ — S3FileStorageProvider, PrismaStorageRepository
- presentation/ — StorageEngineModule

## Dependencies
- @aws-sdk/client-s3, @aws-sdk/s3-request-presigner — S3 interactions
- @prisma/client — storage configuration persistence
- @forge/types — shared type definitions

## Depended on by
- apps/api (ProjectModule)
