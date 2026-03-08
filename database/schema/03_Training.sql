-- ============================================
-- TRDS - Training Schema
-- Tables: TrainingCategory, TrainingMaster,
--         TrainingAssignment, TrainingAssignmentDetail,
--         TrainingApproval, TrainingSchedule,
--         TrainingAttendance, TrainingAssessment,
--         TrainingCertificate, TrainingAttachment
-- ============================================

USE [TRDSDB]
GO

-- =============================================
-- TrainingCategory
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingCategory]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingCategory] (
        [Id]            INT IDENTITY(1,1) PRIMARY KEY,
        [CategoryCode]  NVARCHAR(50) NOT NULL,
        [CategoryName]  NVARCHAR(200) NOT NULL,
        [Description]   NVARCHAR(500) NULL,
        [ParentId]      INT NULL,
        [IsActive]      BIT NOT NULL DEFAULT 1,
        [SortOrder]     INT NOT NULL DEFAULT 0,
        [CreatedDate]   DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]     NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]  DATETIME NULL,
        [ModifiedBy]    NVARCHAR(100) NULL,
        CONSTRAINT [UQ_TrainingCategory_Code] UNIQUE ([CategoryCode]),
        CONSTRAINT [FK_TrainingCategory_ParentId] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[TrainingCategory]([Id])
    )
    PRINT 'Table [TrainingCategory] created.'
END
GO

-- =============================================
-- TrainingMaster
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingMaster]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingMaster] (
        [Id]                    INT IDENTITY(1,1) PRIMARY KEY,
        [TrainingCode]          NVARCHAR(50) NOT NULL,
        [Title]                 NVARCHAR(300) NOT NULL,
        [CategoryId]            INT NULL,
        [Description]           NVARCHAR(MAX) NULL,
        [DurationHours]         DECIMAL(6,2) NULL,
        [TrainingMode]          NVARCHAR(20) NOT NULL DEFAULT 'Online',  -- Online, Classroom, Hybrid
        [TrainerName]           NVARCHAR(200) NULL,
        [TrainerEmployeeNo]     NVARCHAR(50) NULL,
        [ValidityMonths]        INT NULL,
        [RetrainingIntervalMonths] INT NULL,
        [IsMandatory]           BIT NOT NULL DEFAULT 0,
        [PassMark]              DECIMAL(5,2) NULL,
        [MaxAttempts]           INT NULL DEFAULT 3,
        [IsActive]              BIT NOT NULL DEFAULT 1,
        [CreatedDate]           DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]             NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]          DATETIME NULL,
        [ModifiedBy]            NVARCHAR(100) NULL,
        CONSTRAINT [UQ_TrainingMaster_Code] UNIQUE ([TrainingCode]),
        CONSTRAINT [FK_TrainingMaster_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[TrainingCategory]([Id]),
        CONSTRAINT [CK_TrainingMaster_Mode] CHECK ([TrainingMode] IN ('Online','Classroom','Hybrid'))
    )
    CREATE INDEX [IX_TrainingMaster_CategoryId] ON [dbo].[TrainingMaster] ([CategoryId])
    CREATE INDEX [IX_TrainingMaster_IsMandatory] ON [dbo].[TrainingMaster] ([IsMandatory])
    PRINT 'Table [TrainingMaster] created.'
END
GO

-- =============================================
-- TrainingAssignment: Bulk assignment header
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingAssignment]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingAssignment] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [TrainingId]        INT NOT NULL,
        [AssignmentType]    NVARCHAR(30) NOT NULL,  -- Individual, Department, Designation, Cluster, Team, Bulk
        [AssignmentScope]   NVARCHAR(500) NULL,     -- JSON: scope details (dept IDs, team IDs, etc.)
        [AssignedByEmployeeNo] NVARCHAR(50) NOT NULL,
        [DueDate]           DATE NULL,
        [Priority]          NVARCHAR(20) NOT NULL DEFAULT 'Normal',  -- Low, Normal, High, Critical
        [IsMandatory]       BIT NOT NULL DEFAULT 0,
        [IsRecurring]       BIT NOT NULL DEFAULT 0,
        [RecurrenceMonths]  INT NULL,
        [Notes]             NVARCHAR(MAX) NULL,
        [Status]            NVARCHAR(20) NOT NULL DEFAULT 'Active',  -- Active, Cancelled, Completed
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]         NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]      DATETIME NULL,
        [ModifiedBy]        NVARCHAR(100) NULL,
        CONSTRAINT [FK_TrainingAssignment_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[TrainingMaster]([Id]),
        CONSTRAINT [CK_TrainingAssignment_Type] CHECK ([AssignmentType] IN ('Individual','Department','Designation','Cluster','Team','Bulk')),
        CONSTRAINT [CK_TrainingAssignment_Priority] CHECK ([Priority] IN ('Low','Normal','High','Critical')),
        CONSTRAINT [CK_TrainingAssignment_Status] CHECK ([Status] IN ('Active','Cancelled','Completed'))
    )
    CREATE INDEX [IX_TrainingAssignment_TrainingId] ON [dbo].[TrainingAssignment] ([TrainingId])
    CREATE INDEX [IX_TrainingAssignment_AssignedBy] ON [dbo].[TrainingAssignment] ([AssignedByEmployeeNo])
    CREATE INDEX [IX_TrainingAssignment_DueDate] ON [dbo].[TrainingAssignment] ([DueDate])
    PRINT 'Table [TrainingAssignment] created.'
END
GO

-- =============================================
-- TrainingAssignmentDetail: Per-employee assignment
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingAssignmentDetail]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingAssignmentDetail] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [AssignmentId]      INT NOT NULL,
        [EmployeeNo]        NVARCHAR(50) NOT NULL,
        [Status]            NVARCHAR(20) NOT NULL DEFAULT 'NotStarted',  -- NotStarted, InProgress, Completed, Overdue, Failed
        [CompletionPercent] DECIMAL(5,2) NOT NULL DEFAULT 0,
        [StartedDate]       DATETIME NULL,
        [CompletedDate]     DATETIME NULL,
        [DueDate]           DATE NULL,
        [Score]             DECIMAL(5,2) NULL,
        [IsPassed]          BIT NULL,
        [Remarks]           NVARCHAR(1000) NULL,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [ModifiedDate]      DATETIME NULL,
        CONSTRAINT [FK_TrainingAssignmentDetail_AssignmentId] FOREIGN KEY ([AssignmentId]) REFERENCES [dbo].[TrainingAssignment]([Id]),
        CONSTRAINT [CK_TrainingAssignmentDetail_Status] CHECK ([Status] IN ('NotStarted','InProgress','Completed','Overdue','Failed'))
    )
    CREATE INDEX [IX_TrainingAssignmentDetail_AssignmentId] ON [dbo].[TrainingAssignmentDetail] ([AssignmentId])
    CREATE INDEX [IX_TrainingAssignmentDetail_EmployeeNo] ON [dbo].[TrainingAssignmentDetail] ([EmployeeNo])
    CREATE INDEX [IX_TrainingAssignmentDetail_Status] ON [dbo].[TrainingAssignmentDetail] ([Status])
    CREATE INDEX [IX_TrainingAssignmentDetail_DueDate] ON [dbo].[TrainingAssignmentDetail] ([DueDate])
    PRINT 'Table [TrainingAssignmentDetail] created.'
END
GO

-- =============================================
-- TrainingApproval: Approval workflow
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingApproval]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingApproval] (
        [Id]                    INT IDENTITY(1,1) PRIMARY KEY,
        [ReferenceType]         NVARCHAR(30) NOT NULL,  -- TrainingRequest, AssignmentApproval
        [ReferenceId]           INT NOT NULL,
        [RequestedByEmployeeNo] NVARCHAR(50) NOT NULL,
        [ApproverEmployeeNo]    NVARCHAR(50) NOT NULL,
        [ApprovalLevel]         INT NOT NULL DEFAULT 1,
        [Action]                NVARCHAR(20) NOT NULL DEFAULT 'Pending',  -- Pending, Approved, Rejected, OnHold, Returned
        [Remarks]               NVARCHAR(1000) NULL,
        [ActionDate]            DATETIME NULL,
        [CreatedDate]           DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [CK_TrainingApproval_Action] CHECK ([Action] IN ('Pending','Approved','Rejected','OnHold','Returned'))
    )
    CREATE INDEX [IX_TrainingApproval_ReferenceId] ON [dbo].[TrainingApproval] ([ReferenceType], [ReferenceId])
    CREATE INDEX [IX_TrainingApproval_Approver] ON [dbo].[TrainingApproval] ([ApproverEmployeeNo], [Action])
    PRINT 'Table [TrainingApproval] created.'
END
GO

-- =============================================
-- TrainingSchedule
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingSchedule]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingSchedule] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [TrainingId]        INT NOT NULL,
        [ScheduleCode]      NVARCHAR(50) NOT NULL,
        [SessionTitle]      NVARCHAR(300) NULL,
        [Venue]             NVARCHAR(300) NULL,
        [MeetingLink]       NVARCHAR(500) NULL,
        [TrainerName]       NVARCHAR(200) NULL,
        [TrainerEmployeeNo] NVARCHAR(50) NULL,
        [StartDateTime]     DATETIME NOT NULL,
        [EndDateTime]       DATETIME NOT NULL,
        [Capacity]          INT NULL,
        [Status]            NVARCHAR(20) NOT NULL DEFAULT 'Scheduled',  -- Scheduled, InProgress, Completed, Cancelled, Rescheduled
        [Notes]             NVARCHAR(1000) NULL,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [CreatedBy]         NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
        [ModifiedDate]      DATETIME NULL,
        [ModifiedBy]        NVARCHAR(100) NULL,
        CONSTRAINT [FK_TrainingSchedule_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[TrainingMaster]([Id]),
        CONSTRAINT [UQ_TrainingSchedule_Code] UNIQUE ([ScheduleCode]),
        CONSTRAINT [CK_TrainingSchedule_Status] CHECK ([Status] IN ('Scheduled','InProgress','Completed','Cancelled','Rescheduled'))
    )
    CREATE INDEX [IX_TrainingSchedule_TrainingId] ON [dbo].[TrainingSchedule] ([TrainingId])
    CREATE INDEX [IX_TrainingSchedule_StartDate] ON [dbo].[TrainingSchedule] ([StartDateTime])
    PRINT 'Table [TrainingSchedule] created.'
END
GO

-- =============================================
-- TrainingAttendance
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingAttendance]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingAttendance] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [ScheduleId]        INT NOT NULL,
        [EmployeeNo]        NVARCHAR(50) NOT NULL,
        [IsPresent]         BIT NOT NULL DEFAULT 0,
        [CheckInTime]       DATETIME NULL,
        [CheckOutTime]      DATETIME NULL,
        [TrainerRemarks]    NVARCHAR(1000) NULL,
        [Score]             DECIMAL(5,2) NULL,
        [IsCompleted]       BIT NOT NULL DEFAULT 0,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [ModifiedDate]      DATETIME NULL,
        CONSTRAINT [FK_TrainingAttendance_ScheduleId] FOREIGN KEY ([ScheduleId]) REFERENCES [dbo].[TrainingSchedule]([Id]),
        CONSTRAINT [UQ_TrainingAttendance] UNIQUE ([ScheduleId], [EmployeeNo])
    )
    CREATE INDEX [IX_TrainingAttendance_EmployeeNo] ON [dbo].[TrainingAttendance] ([EmployeeNo])
    PRINT 'Table [TrainingAttendance] created.'
END
GO

-- =============================================
-- TrainingAssessment
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingAssessment]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingAssessment] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [TrainingId]        INT NOT NULL,
        [EmployeeNo]        NVARCHAR(50) NOT NULL,
        [AssessmentType]    NVARCHAR(30) NOT NULL DEFAULT 'MCQ',  -- MCQ, Theory, Practical, Mixed
        [AttemptNumber]     INT NOT NULL DEFAULT 1,
        [TotalMarks]        DECIMAL(6,2) NOT NULL,
        [ObtainedMarks]     DECIMAL(6,2) NOT NULL,
        [PassMark]          DECIMAL(6,2) NOT NULL,
        [IsPassed]          BIT NOT NULL DEFAULT 0,
        [AssessmentDate]    DATETIME NOT NULL DEFAULT GETDATE(),
        [Remarks]           NVARCHAR(1000) NULL,
        [IsPublished]       BIT NOT NULL DEFAULT 0,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [ModifiedDate]      DATETIME NULL,
        CONSTRAINT [FK_TrainingAssessment_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[TrainingMaster]([Id]),
        CONSTRAINT [CK_TrainingAssessment_Type] CHECK ([AssessmentType] IN ('MCQ','Theory','Practical','Mixed'))
    )
    CREATE INDEX [IX_TrainingAssessment_TrainingId] ON [dbo].[TrainingAssessment] ([TrainingId])
    CREATE INDEX [IX_TrainingAssessment_EmployeeNo] ON [dbo].[TrainingAssessment] ([EmployeeNo])
    PRINT 'Table [TrainingAssessment] created.'
END
GO

-- =============================================
-- TrainingCertificate
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingCertificate]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingCertificate] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [TrainingId]        INT NOT NULL,
        [EmployeeNo]        NVARCHAR(50) NOT NULL,
        [CertificateNumber] NVARCHAR(100) NOT NULL,
        [IssueDate]         DATE NOT NULL,
        [ExpiryDate]        DATE NULL,
        [IssuedByEmployeeNo] NVARCHAR(50) NULL,
        [CertificateFilePath] NVARCHAR(500) NULL,
        [Status]            NVARCHAR(20) NOT NULL DEFAULT 'Active',  -- Active, Expired, Revoked, Renewed
        [RenewalDate]       DATE NULL,
        [Remarks]           NVARCHAR(1000) NULL,
        [CreatedDate]       DATETIME NOT NULL DEFAULT GETDATE(),
        [ModifiedDate]      DATETIME NULL,
        CONSTRAINT [FK_TrainingCertificate_TrainingId] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[TrainingMaster]([Id]),
        CONSTRAINT [UQ_TrainingCertificate_Number] UNIQUE ([CertificateNumber]),
        CONSTRAINT [CK_TrainingCertificate_Status] CHECK ([Status] IN ('Active','Expired','Revoked','Renewed'))
    )
    CREATE INDEX [IX_TrainingCertificate_EmployeeNo] ON [dbo].[TrainingCertificate] ([EmployeeNo])
    CREATE INDEX [IX_TrainingCertificate_ExpiryDate] ON [dbo].[TrainingCertificate] ([ExpiryDate])
    PRINT 'Table [TrainingCertificate] created.'
END
GO

-- =============================================
-- TrainingAttachment
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrainingAttachment]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TrainingAttachment] (
        [Id]                INT IDENTITY(1,1) PRIMARY KEY,
        [ReferenceType]     NVARCHAR(30) NOT NULL,  -- Training, Assignment, Certificate, Schedule
        [ReferenceId]       INT NOT NULL,
        [FileName]          NVARCHAR(300) NOT NULL,
        [FileType]          NVARCHAR(50) NULL,
        [FilePath]          NVARCHAR(500) NOT NULL,
        [FileSizeBytes]     BIGINT NULL,
        [UploadedByEmployeeNo] NVARCHAR(50) NOT NULL,
        [UploadedDate]      DATETIME NOT NULL DEFAULT GETDATE(),
        [Description]       NVARCHAR(500) NULL
    )
    CREATE INDEX [IX_TrainingAttachment_Reference] ON [dbo].[TrainingAttachment] ([ReferenceType], [ReferenceId])
    PRINT 'Table [TrainingAttachment] created.'
END
GO

PRINT '=========================================='
PRINT 'Training schema creation complete.'
PRINT '=========================================='
GO
