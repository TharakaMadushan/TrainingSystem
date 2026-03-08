-- ============================================
-- TRDS - Employee Training Assignment System
-- Database Creation Script
-- ============================================

USE [master]
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'TRDSDB')
BEGIN
    CREATE DATABASE [TRDSDB]
END
GO

USE [TRDSDB]
GO

PRINT 'TRDSDB database created/verified successfully.'
GO
