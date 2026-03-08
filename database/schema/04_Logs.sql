-- ============================================
-- TRDS - Logs Schema
-- Tables: ActivityAudit, ErrorLog, NotificationLog
-- ============================================

USE [TRDSDB]
GO

-- =============================================
-- ActivityAudit: Full audit trail
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ActivityAudit]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[ActivityAudit] (
        [Id]            BIGINT IDENTITY(1,1) PRIMARY KEY,
        [TableName]     NVARCHAR(100) NOT NULL,
        [RecordId]      NVARCHAR(50) NOT NULL,
        [Action]        NVARCHAR(20) NOT NULL,  -- Insert, Update, Delete, StatusChange
        [OldValues]     NVARCHAR(MAX) NULL,     -- JSON
        [NewValues]     NVARCHAR(MAX) NULL,     -- JSON
        [ChangedFields] NVARCHAR(MAX) NULL,     -- JSON array of changed field names
        [UserType]      NVARCHAR(20) NULL,
        [UserId]        NVARCHAR(100) NOT NULL,
        [IPAddress]     NVARCHAR(50) NULL,
        [UserAgent]     NVARCHAR(500) NULL,
        [Timestamp]     DATETIME NOT NULL DEFAULT GETDATE()
    )
    CREATE INDEX [IX_ActivityAudit_TableName] ON [dbo].[ActivityAudit] ([TableName], [RecordId])
    CREATE INDEX [IX_ActivityAudit_Timestamp] ON [dbo].[ActivityAudit] ([Timestamp] DESC)
    CREATE INDEX [IX_ActivityAudit_UserId] ON [dbo].[ActivityAudit] ([UserId])
    PRINT 'Table [ActivityAudit] created.'
END
GO

-- =============================================
-- ErrorLog
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ErrorLog]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[ErrorLog] (
        [Id]            BIGINT IDENTITY(1,1) PRIMARY KEY,
        [ErrorMessage]  NVARCHAR(MAX) NOT NULL,
        [StackTrace]    NVARCHAR(MAX) NULL,
        [Source]        NVARCHAR(500) NULL,
        [RequestPath]   NVARCHAR(500) NULL,
        [RequestMethod] NVARCHAR(10) NULL,
        [RequestBody]   NVARCHAR(MAX) NULL,
        [UserId]        NVARCHAR(100) NULL,
        [IPAddress]     NVARCHAR(50) NULL,
        [Severity]      NVARCHAR(20) NOT NULL DEFAULT 'Error',  -- Info, Warning, Error, Critical
        [Timestamp]     DATETIME NOT NULL DEFAULT GETDATE()
    )
    CREATE INDEX [IX_ErrorLog_Timestamp] ON [dbo].[ErrorLog] ([Timestamp] DESC)
    CREATE INDEX [IX_ErrorLog_Severity] ON [dbo].[ErrorLog] ([Severity])
    PRINT 'Table [ErrorLog] created.'
END
GO

-- =============================================
-- NotificationLog
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NotificationLog]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[NotificationLog] (
        [Id]                    BIGINT IDENTITY(1,1) PRIMARY KEY,
        [RecipientEmployeeNo]   NVARCHAR(50) NOT NULL,
        [NotificationType]      NVARCHAR(50) NOT NULL,  -- TrainingAssigned, DueReminder, OverdueAlert, ApprovalPending, Completed, CertExpiry
        [Title]                 NVARCHAR(300) NOT NULL,
        [Message]               NVARCHAR(MAX) NULL,
        [ReferenceType]         NVARCHAR(50) NULL,
        [ReferenceId]           INT NULL,
        [IsRead]                BIT NOT NULL DEFAULT 0,
        [ReadDate]              DATETIME NULL,
        [IsSent]                BIT NOT NULL DEFAULT 0,
        [SentDate]              DATETIME NULL,
        [Channel]               NVARCHAR(20) NOT NULL DEFAULT 'InApp',  -- InApp, Email, Both
        [CreatedDate]           DATETIME NOT NULL DEFAULT GETDATE()
    )
    CREATE INDEX [IX_NotificationLog_Recipient] ON [dbo].[NotificationLog] ([RecipientEmployeeNo], [IsRead])
    CREATE INDEX [IX_NotificationLog_CreatedDate] ON [dbo].[NotificationLog] ([CreatedDate] DESC)
    PRINT 'Table [NotificationLog] created.'
END
GO

-- =============================================
-- UserPreferences
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserPreferences]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[UserPreferences] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [UserType]          NVARCHAR(20) NOT NULL,
        [EmployeeNo]        NVARCHAR(50) NULL,
        [SecurityUserId]    INT NULL,
        [ThemeMode]         NVARCHAR(10) NOT NULL DEFAULT 'Light',  -- Light, Dark
        [SidebarCollapsed]  BIT NOT NULL DEFAULT 0,
        [DefaultPageSize]   INT NOT NULL DEFAULT 20,
        [DashboardLayout]   NVARCHAR(MAX) NULL,  -- JSON for custom widget arrangement
        [ModifiedDate]      DATETIME NOT NULL DEFAULT GETDATE()
    )
    CREATE INDEX [IX_UserPreferences_EmployeeNo] ON [dbo].[UserPreferences] ([EmployeeNo]) WHERE [EmployeeNo] IS NOT NULL
    PRINT 'Table [UserPreferences] created.'
END
GO

PRINT '=========================================='
PRINT 'Logs schema creation complete.'
PRINT '=========================================='
GO
