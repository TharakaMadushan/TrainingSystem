-- ============================================
-- TRDS - HR Schema
-- References MasterEmployee from HRIS_GSM_QA_2025_10_11
-- Local tables: Departments, Designations,
--   Clusters, Locations, EmployeeHierarchy
-- ============================================

USE [TRDSDB]
GO

-- =============================================
-- Departments
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Departments]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Departments] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [DepartmentCode]    NVARCHAR(50) NOT NULL,
        [DepartmentName]    NVARCHAR(200) NOT NULL,
        [IsActive]          BIT NOT NULL DEFAULT 1,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]         NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]      DATETIME NULL,
        [ModifiedBy]        NVARCHAR(100) NULL,
        CONSTRAINT [UQ_Departments_Code] UNIQUE ([DepartmentCode])
    )
    PRINT 'Table [Departments] created.'
END
GO

-- =============================================
-- Designations
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Designations]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Designations] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [DesignationCode]   NVARCHAR(50) NOT NULL,
        [DesignationName]   NVARCHAR(200) NOT NULL,
        [IsActive]          BIT NOT NULL DEFAULT 1,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]         NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]      DATETIME NULL,
        [ModifiedBy]        NVARCHAR(100) NULL,
        CONSTRAINT [UQ_Designations_Code] UNIQUE ([DesignationCode])
    )
    PRINT 'Table [Designations] created.'
END
GO

-- =============================================
-- Clusters
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Clusters]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Clusters] (
        [Id]            INT IDENTITY(1,1) PRIMARY KEY,
        [ClusterCode]   NVARCHAR(50) NOT NULL,
        [ClusterName]   NVARCHAR(200) NOT NULL,
        [IsActive]      BIT NOT NULL DEFAULT 1,
        [CreatedDate]   DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]     NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]  DATETIME NULL,
        [ModifiedBy]    NVARCHAR(100) NULL,
        CONSTRAINT [UQ_Clusters_Code] UNIQUE ([ClusterCode])
    )
    PRINT 'Table [Clusters] created.'
END
GO

-- =============================================
-- Locations
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Locations]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Locations] (
        [Id]            INT IDENTITY(1,1) PRIMARY KEY,
        [LocationCode]  NVARCHAR(50) NOT NULL,
        [LocationName]  NVARCHAR(200) NOT NULL,
        [Address]       NVARCHAR(500) NULL,
        [IsActive]      BIT NOT NULL DEFAULT 1,
        [CreatedDate]   DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]     NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]  DATETIME NULL,
        [ModifiedBy]    NVARCHAR(100) NULL,
        CONSTRAINT [UQ_Locations_Code] UNIQUE ([LocationCode])
    )
    PRINT 'Table [Locations] created.'
END
GO

-- =============================================
-- EmployeeHierarchy: Reporting structure
-- References MasterEmployee from HRIS database via linked reference
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EmployeeHierarchy]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[EmployeeHierarchy] (
        [Id]                    INT IDENTITY(1,1) PRIMARY KEY,
        [EmployeeNo]            NVARCHAR(50) NOT NULL,
        [ManagerEmployeeNo]     NVARCHAR(50) NULL,
        [DepartmentId]          INT NULL,
        [DesignationId]         INT NULL,
        [ClusterId]             INT NULL,
        [LocationId]            INT NULL,
        [HierarchyLevel]        INT NOT NULL DEFAULT 0,
        [IsActive]              BIT NOT NULL DEFAULT 1,
        [LastSyncDate]          DATETIME NULL,
        [CreatedDate]           DATETIME NOT NULL DEFAULT GETDATE(),
        [ModifiedDate]          DATETIME NULL,
        CONSTRAINT [FK_EmployeeHierarchy_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments]([Id]),
        CONSTRAINT [FK_EmployeeHierarchy_DesignationId] FOREIGN KEY ([DesignationId]) REFERENCES [dbo].[Designations]([Id]),
        CONSTRAINT [FK_EmployeeHierarchy_ClusterId] FOREIGN KEY ([ClusterId]) REFERENCES [dbo].[Clusters]([Id]),
        CONSTRAINT [FK_EmployeeHierarchy_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [dbo].[Locations]([Id])
    )
    CREATE UNIQUE INDEX [IX_EmployeeHierarchy_EmployeeNo] ON [dbo].[EmployeeHierarchy] ([EmployeeNo])
    CREATE INDEX [IX_EmployeeHierarchy_ManagerNo] ON [dbo].[EmployeeHierarchy] ([ManagerEmployeeNo])
    CREATE INDEX [IX_EmployeeHierarchy_DepartmentId] ON [dbo].[EmployeeHierarchy] ([DepartmentId])
    CREATE INDEX [IX_EmployeeHierarchy_ClusterId] ON [dbo].[EmployeeHierarchy] ([ClusterId])
    PRINT 'Table [EmployeeHierarchy] created.'
END
GO

-- =============================================
-- View: vw_EmployeeDetails
-- Joins local hierarchy with HRIS MasterEmployee
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_EmployeeDetails')
    DROP VIEW [dbo].[vw_EmployeeDetails]
GO

CREATE VIEW [dbo].[vw_EmployeeDetails]
AS
SELECT 
    eh.[EmployeeNo],
    me.[EmployeeName],
    me.[DocumentEmployeeNo],
    d.[DepartmentCode],
    d.[DepartmentName],
    des.[DesignationCode],
    des.[DesignationName],
    c.[ClusterCode],
    c.[ClusterName],
    l.[LocationCode],
    l.[LocationName],
    eh.[ManagerEmployeeNo],
    mgr.[EmployeeName] AS [ManagerName],
    eh.[HierarchyLevel],
    eh.[IsActive]
FROM [dbo].[EmployeeHierarchy] eh
LEFT JOIN [HRIS_GSM_QA_2025_10_11].[dbo].[MasterEmployee] me ON eh.[EmployeeNo] = me.[DocumentEmployeeNo]
LEFT JOIN [dbo].[Departments] d ON eh.[DepartmentId] = d.[Id]
LEFT JOIN [dbo].[Designations] des ON eh.[DesignationId] = des.[Id]
LEFT JOIN [dbo].[Clusters] c ON eh.[ClusterId] = c.[Id]
LEFT JOIN [dbo].[Locations] l ON eh.[LocationId] = l.[Id]
LEFT JOIN [HRIS_GSM_QA_2025_10_11].[dbo].[MasterEmployee] mgr ON eh.[ManagerEmployeeNo] = mgr.[DocumentEmployeeNo]
GO

PRINT '=========================================='
PRINT 'HR schema creation complete.'
PRINT '=========================================='
GO
