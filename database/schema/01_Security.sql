-- ============================================
-- TRDS - Security Schema
-- Tables: SecurityUsers, Roles, Permissions,
--         UserRoles, RolePermissions, Menus,
--         RoleMenus, UserScopeFilters, LoginAudit
-- ============================================

USE [TRDSDB]
GO

-- =============================================
-- SecurityUsers: SuperUser accounts
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SecurityUsers]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[SecurityUsers] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [Username]          NVARCHAR(100) NOT NULL,
        [PasswordHash]      NVARCHAR(500) NOT NULL,
        [Salt]              NVARCHAR(200) NOT NULL,
        [DisplayName]       NVARCHAR(200) NOT NULL,
        [Email]             NVARCHAR(200) NULL,
        [IsActive]          BIT NOT NULL DEFAULT 1,
        [IsLocked]          BIT NOT NULL DEFAULT 0,
        [FailedLoginAttempts] INT NOT NULL DEFAULT 0,
        [LastLoginDate]     DATETIME NULL,
        [LockoutEndDate]    DATETIME NULL,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]         NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]      DATETIME NULL,
        [ModifiedBy]        NVARCHAR(100) NULL,
        CONSTRAINT [UQ_SecurityUsers_Username] UNIQUE ([Username])
    )
    PRINT 'Table [SecurityUsers] created.'
END
GO

-- =============================================
-- Roles
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Roles] (
        [Id]            INT IDENTITY(1,1) PRIMARY KEY,
        [RoleCode]      NVARCHAR(50) NOT NULL,
        [RoleName]      NVARCHAR(200) NOT NULL,
        [Description]   NVARCHAR(500) NULL,
        [IsSystemRole]  BIT NOT NULL DEFAULT 0,
        [IsActive]      BIT NOT NULL DEFAULT 1,
        [SortOrder]     INT NOT NULL DEFAULT 0,
        [CreatedDate]   DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]     NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]  DATETIME NULL,
        [ModifiedBy]    NVARCHAR(100) NULL,
        CONSTRAINT [UQ_Roles_RoleCode] UNIQUE ([RoleCode])
    )
    PRINT 'Table [Roles] created.'
END
GO

-- =============================================
-- Permissions
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Permissions]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Permissions] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [PermissionCode]    NVARCHAR(100) NOT NULL,
        [PermissionName]    NVARCHAR(200) NOT NULL,
        [ModuleCode]        NVARCHAR(50) NOT NULL,
        [Description]       NVARCHAR(500) NULL,
        [IsActive]          BIT NOT NULL DEFAULT 1,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [UQ_Permissions_Code] UNIQUE ([PermissionCode])
    )
    PRINT 'Table [Permissions] created.'
END
GO

-- =============================================
-- UserRoles: Maps employees/superusers to roles (supports multiple)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserRoles]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[UserRoles] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [UserType]          NVARCHAR(20) NOT NULL,  -- 'Employee' or 'SuperUser'
        [EmployeeNo]        NVARCHAR(50) NULL,      -- For employee-type users
        [SecurityUserId]    INT NULL,               -- For superuser-type users
        [RoleId]            INT NOT NULL,
        [IsActive]          BIT NOT NULL DEFAULT 1,
        [AssignedDate]      DATETIME NOT NULL DEFAULT GETDATE(),
        [AssignedBy]        NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        CONSTRAINT [FK_UserRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles]([Id]),
        CONSTRAINT [FK_UserRoles_SecurityUserId] FOREIGN KEY ([SecurityUserId]) REFERENCES [dbo].[SecurityUsers]([Id]),
        CONSTRAINT [CK_UserRoles_UserType] CHECK ([UserType] IN ('Employee', 'SuperUser'))
    )
    CREATE INDEX [IX_UserRoles_EmployeeNo] ON [dbo].[UserRoles] ([EmployeeNo]) WHERE [EmployeeNo] IS NOT NULL
    CREATE INDEX [IX_UserRoles_SecurityUserId] ON [dbo].[UserRoles] ([SecurityUserId]) WHERE [SecurityUserId] IS NOT NULL
    PRINT 'Table [UserRoles] created.'
END
GO

-- =============================================
-- RolePermissions
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RolePermissions]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[RolePermissions] (
        [Id]            INT IDENTITY(1,1) PRIMARY KEY,
        [RoleId]        INT NOT NULL,
        [PermissionId]  INT NOT NULL,
        [IsActive]      BIT NOT NULL DEFAULT 1,
        [AssignedDate]  DATETIME NOT NULL DEFAULT GETDATE(),
        [AssignedBy]    NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        CONSTRAINT [FK_RolePermissions_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles]([Id]),
        CONSTRAINT [FK_RolePermissions_PermissionId] FOREIGN KEY ([PermissionId]) REFERENCES [dbo].[Permissions]([Id]),
        CONSTRAINT [UQ_RolePermissions] UNIQUE ([RoleId], [PermissionId])
    )
    PRINT 'Table [RolePermissions] created.'
END
GO

-- =============================================
-- Menus: Dynamic menu structure
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Menus]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Menus] (
        [Id]            INT IDENTITY(1,1) PRIMARY KEY,
        [ParentId]      INT NULL,
        [MenuCode]      NVARCHAR(50) NOT NULL,
        [MenuName]      NVARCHAR(200) NOT NULL,
        [Icon]          NVARCHAR(100) NULL,
        [Route]         NVARCHAR(300) NULL,
        [ModuleCode]    NVARCHAR(50) NULL,
        [SortOrder]     INT NOT NULL DEFAULT 0,
        [IsActive]      BIT NOT NULL DEFAULT 1,
        [IsVisible]     BIT NOT NULL DEFAULT 1,
        [Description]   NVARCHAR(500) NULL,
        [CreatedDate]   DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]     NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]  DATETIME NULL,
        [ModifiedBy]    NVARCHAR(100) NULL,
        CONSTRAINT [FK_Menus_ParentId] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Menus]([Id]),
        CONSTRAINT [UQ_Menus_MenuCode] UNIQUE ([MenuCode])
    )
    PRINT 'Table [Menus] created.'
END
GO

-- =============================================
-- RoleMenus: Maps roles to menus
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RoleMenus]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[RoleMenus] (
        [Id]        INT IDENTITY(1,1) PRIMARY KEY,
        [RoleId]    INT NOT NULL,
        [MenuId]    INT NOT NULL,
        [IsActive]  BIT NOT NULL DEFAULT 1,
        [AssignedDate] DATETIME NOT NULL DEFAULT GETDATE(),
        [AssignedBy]   NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        CONSTRAINT [FK_RoleMenus_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles]([Id]),
        CONSTRAINT [FK_RoleMenus_MenuId] FOREIGN KEY ([MenuId]) REFERENCES [dbo].[Menus]([Id]),
        CONSTRAINT [UQ_RoleMenus] UNIQUE ([RoleId], [MenuId])
    )
    PRINT 'Table [RoleMenus] created.'
END
GO

-- =============================================
-- UserScopeFilters: Data-scope filtering per user
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserScopeFilters]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[UserScopeFilters] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [UserType]          NVARCHAR(20) NOT NULL,
        [EmployeeNo]        NVARCHAR(50) NULL,
        [SecurityUserId]    INT NULL,
        [ScopeType]         NVARCHAR(50) NOT NULL,  -- Self, DirectReports, Department, Cluster, Location, Company, Custom
        [ScopeValue]        NVARCHAR(500) NULL,      -- JSON or CSV for custom scopes (e.g., specific dept IDs)
        [IsActive]          BIT NOT NULL DEFAULT 1,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]         NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]      DATETIME NULL,
        [ModifiedBy]        NVARCHAR(100) NULL,
        CONSTRAINT [FK_UserScopeFilters_SecurityUserId] FOREIGN KEY ([SecurityUserId]) REFERENCES [dbo].[SecurityUsers]([Id]),
        CONSTRAINT [CK_UserScopeFilters_ScopeType] CHECK ([ScopeType] IN ('Self','DirectReports','Department','Cluster','Location','Company','Custom'))
    )
    CREATE INDEX [IX_UserScopeFilters_EmployeeNo] ON [dbo].[UserScopeFilters] ([EmployeeNo]) WHERE [EmployeeNo] IS NOT NULL
    PRINT 'Table [UserScopeFilters] created.'
END
GO

-- =============================================
-- LoginAudit
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LoginAudit]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[LoginAudit] (
        [Id]            BIGINT IDENTITY(1,1) PRIMARY KEY,
        [UserType]      NVARCHAR(20) NOT NULL,
        [Username]      NVARCHAR(200) NOT NULL,
        [IPAddress]     NVARCHAR(50) NULL,
        [UserAgent]     NVARCHAR(500) NULL,
        [IsSuccess]     BIT NOT NULL,
        [FailureReason] NVARCHAR(500) NULL,
        [LoginDate]     DATETIME NOT NULL DEFAULT GETDATE()
    )
    CREATE INDEX [IX_LoginAudit_LoginDate] ON [dbo].[LoginAudit] ([LoginDate] DESC)
    CREATE INDEX [IX_LoginAudit_Username] ON [dbo].[LoginAudit] ([Username])
    PRINT 'Table [LoginAudit] created.'
END
GO

PRINT '=========================================='
PRINT 'Security schema creation complete.'
PRINT '=========================================='
GO
