-- ============================================
-- TRDS - Seed Data
-- Default roles, permissions, menus, SuperUser
-- ============================================

USE [TRDSDB]
GO

-- =============================================
-- 1. ROLES
-- =============================================
SET IDENTITY_INSERT [dbo].[Roles] ON

MERGE INTO [dbo].[Roles] AS target
USING (VALUES
    (1,  'EMPLOYEE',        'Employee',             'Regular employee',                 1, 1, 1),
    (2,  'MANAGER',         'Manager',              'Team manager with direct reports',  1, 1, 2),
    (3,  'HR_OFFICER',      'HR Officer',           'HR team member',                   1, 1, 3),
    (4,  'HR_ADMIN',        'HR Admin',             'Senior HR administrator',          1, 1, 4),
    (5,  'HOD',             'Department HOD',       'Head of department',               1, 1, 5),
    (6,  'CLUSTER_MGR',     'Cluster Manager',      'Cluster/branch manager',           1, 1, 6),
    (7,  'TECH_LEAD',       'Tech Lead',            'Technical team lead',              1, 1, 7),
    (8,  'TRAINING_COORD',  'Training Coordinator', 'Manages training operations',      1, 1, 8),
    (9,  'SUPERUSER',       'SuperUser',            'System super user',                1, 1, 9),
    (10, 'SYSADMIN',        'System Admin',         'Full system administrator',        1, 1, 10),
    (11, 'AUDITOR',         'Auditor / ReadOnly',   'Read-only audit access',           1, 1, 11)
) AS source ([Id], [RoleCode], [RoleName], [Description], [IsSystemRole], [IsActive], [SortOrder])
ON target.[RoleCode] = source.[RoleCode]
WHEN NOT MATCHED THEN
    INSERT ([Id], [RoleCode], [RoleName], [Description], [IsSystemRole], [IsActive], [SortOrder])
    VALUES (source.[Id], source.[RoleCode], source.[RoleName], source.[Description], source.[IsSystemRole], source.[IsActive], source.[SortOrder]);

SET IDENTITY_INSERT [dbo].[Roles] OFF
PRINT 'Roles seeded.'
GO

-- =============================================
-- 2. PERMISSIONS
-- =============================================
SET IDENTITY_INSERT [dbo].[Permissions] ON

MERGE INTO [dbo].[Permissions] AS target
USING (VALUES
    -- Dashboard
    (1,  'Dashboard.View',            'View Dashboard',               'DASHBOARD'),
    -- Training
    (10, 'Training.View',             'View Training Catalog',        'TRAINING'),
    (11, 'Training.Create',           'Create Training',              'TRAINING'),
    (12, 'Training.Edit',             'Edit Training',                'TRAINING'),
    (13, 'Training.Delete',           'Delete Training',              'TRAINING'),
    -- Assignment
    (20, 'Assignment.ViewOwn',        'View Own Assignments',         'ASSIGNMENT'),
    (21, 'Assignment.ViewTeam',       'View Team Assignments',        'ASSIGNMENT'),
    (22, 'Assignment.Create',         'Create Assignment',            'ASSIGNMENT'),
    (23, 'Assignment.Edit',           'Edit Assignment',              'ASSIGNMENT'),
    (24, 'Assignment.BulkAssign',     'Bulk Assign Training',         'ASSIGNMENT'),
    -- Approval
    (30, 'Approval.View',            'View Approvals',               'APPROVAL'),
    (31, 'Approval.Approve',         'Approve/Reject Requests',      'APPROVAL'),
    -- Schedule
    (40, 'Schedule.View',            'View Schedules',               'SCHEDULE'),
    (41, 'Schedule.Create',          'Create Schedule',              'SCHEDULE'),
    (42, 'Schedule.Edit',            'Edit Schedule',                'SCHEDULE'),
    -- Attendance
    (50, 'Attendance.View',          'View Attendance',              'ATTENDANCE'),
    (51, 'Attendance.Mark',          'Mark Attendance',              'ATTENDANCE'),
    -- Assessment
    (60, 'Assessment.View',          'View Assessments',             'ASSESSMENT'),
    (61, 'Assessment.Create',        'Create Assessment',            'ASSESSMENT'),
    (62, 'Assessment.Publish',       'Publish Results',              'ASSESSMENT'),
    -- Certificate
    (70, 'Certificate.View',         'View Certificates',            'CERTIFICATE'),
    (71, 'Certificate.Issue',        'Issue Certificate',            'CERTIFICATE'),
    -- Reports
    (80, 'Report.View',              'View Reports',                 'REPORT'),
    (81, 'Report.Export',            'Export Reports',               'REPORT'),
    -- Admin
    (90, 'Admin.UserManagement',     'Manage Users',                 'ADMIN'),
    (91, 'Admin.RoleManagement',     'Manage Roles',                 'ADMIN'),
    (92, 'Admin.MenuManagement',     'Manage Menus',                 'ADMIN'),
    (93, 'Admin.ScopeManagement',    'Manage Scope Filters',         'ADMIN'),
    (94, 'Admin.Settings',           'Manage Settings',              'ADMIN'),
    -- Audit
    (100, 'Audit.View',              'View Audit Logs',              'AUDIT'),
    -- Notifications
    (110, 'Notification.View',       'View Notifications',           'NOTIFICATION')
) AS source ([Id], [PermissionCode], [PermissionName], [ModuleCode])
ON target.[PermissionCode] = source.[PermissionCode]
WHEN NOT MATCHED THEN
    INSERT ([Id], [PermissionCode], [PermissionName], [ModuleCode])
    VALUES (source.[Id], source.[PermissionCode], source.[PermissionName], source.[ModuleCode]);

SET IDENTITY_INSERT [dbo].[Permissions] OFF
PRINT 'Permissions seeded.'
GO

-- =============================================
-- 3. ROLE-PERMISSION MAPPINGS
-- =============================================
-- Employee: own assignments, dashboard, notifications
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.Id, p.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Permissions] p
WHERE r.RoleCode = 'EMPLOYEE' AND p.PermissionCode IN (
    'Dashboard.View','Assignment.ViewOwn','Schedule.View','Assessment.View',
    'Certificate.View','Notification.View'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RolePermissions] rp WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id)

-- Manager: team view + approvals
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.Id, p.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Permissions] p
WHERE r.RoleCode = 'MANAGER' AND p.PermissionCode IN (
    'Dashboard.View','Assignment.ViewOwn','Assignment.ViewTeam','Assignment.Create',
    'Approval.View','Approval.Approve','Schedule.View','Attendance.View',
    'Assessment.View','Certificate.View','Report.View','Notification.View'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RolePermissions] rp WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id)

-- HR Officer
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.Id, p.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Permissions] p
WHERE r.RoleCode = 'HR_OFFICER' AND p.PermissionCode IN (
    'Dashboard.View','Training.View','Assignment.ViewOwn','Assignment.ViewTeam','Assignment.Create',
    'Approval.View','Approval.Approve','Schedule.View','Schedule.Create',
    'Attendance.View','Attendance.Mark','Assessment.View','Certificate.View',
    'Certificate.Issue','Report.View','Report.Export','Notification.View'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RolePermissions] rp WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id)

-- HR Admin: everything HR + training creation
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.Id, p.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Permissions] p
WHERE r.RoleCode = 'HR_ADMIN' AND p.PermissionCode IN (
    'Dashboard.View','Training.View','Training.Create','Training.Edit','Training.Delete',
    'Assignment.ViewOwn','Assignment.ViewTeam','Assignment.Create','Assignment.Edit','Assignment.BulkAssign',
    'Approval.View','Approval.Approve','Schedule.View','Schedule.Create','Schedule.Edit',
    'Attendance.View','Attendance.Mark','Assessment.View','Assessment.Create','Assessment.Publish',
    'Certificate.View','Certificate.Issue','Report.View','Report.Export','Notification.View'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RolePermissions] rp WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id)

-- Training Coordinator: full training module access
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.Id, p.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Permissions] p
WHERE r.RoleCode = 'TRAINING_COORD' AND p.PermissionCode IN (
    'Dashboard.View','Training.View','Training.Create','Training.Edit',
    'Assignment.ViewOwn','Assignment.ViewTeam','Assignment.Create','Assignment.Edit','Assignment.BulkAssign',
    'Schedule.View','Schedule.Create','Schedule.Edit',
    'Attendance.View','Attendance.Mark','Assessment.View','Assessment.Create','Assessment.Publish',
    'Certificate.View','Certificate.Issue','Report.View','Report.Export','Notification.View'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RolePermissions] rp WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id)

-- HOD & Cluster Manager: department/cluster scope + approvals
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.Id, p.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Permissions] p
WHERE r.RoleCode IN ('HOD', 'CLUSTER_MGR') AND p.PermissionCode IN (
    'Dashboard.View','Assignment.ViewOwn','Assignment.ViewTeam','Assignment.Create',
    'Approval.View','Approval.Approve','Schedule.View',
    'Attendance.View','Assessment.View','Certificate.View',
    'Report.View','Report.Export','Notification.View'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RolePermissions] rp WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id)

-- System Admin: ALL permissions
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.Id, p.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Permissions] p
WHERE r.RoleCode = 'SYSADMIN'
AND NOT EXISTS (SELECT 1 FROM [dbo].[RolePermissions] rp WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id)

-- SuperUser: same as System Admin  
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.Id, p.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Permissions] p
WHERE r.RoleCode = 'SUPERUSER'
AND NOT EXISTS (SELECT 1 FROM [dbo].[RolePermissions] rp WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id)

-- Auditor: read-only across all modules
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.Id, p.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Permissions] p
WHERE r.RoleCode = 'AUDITOR' AND p.PermissionCode IN (
    'Dashboard.View','Training.View','Assignment.ViewOwn','Assignment.ViewTeam',
    'Approval.View','Schedule.View','Attendance.View','Assessment.View',
    'Certificate.View','Report.View','Report.Export','Audit.View','Notification.View'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RolePermissions] rp WHERE rp.RoleId = r.Id AND rp.PermissionId = p.Id)

PRINT 'Role-Permission mappings seeded.'
GO

-- =============================================
-- 4. MENUS (Dynamic sidebar navigation)
-- =============================================
SET IDENTITY_INSERT [dbo].[Menus] ON

MERGE INTO [dbo].[Menus] AS target
USING (VALUES
    -- Top-level menus
    (1,   NULL, 'DASHBOARD',        'Dashboard',            'LayoutDashboard',  '/dashboard',           'DASHBOARD',    1),
    (2,   NULL, 'MY_TRAININGS',     'My Trainings',         'BookOpen',         '/my-trainings',        'ASSIGNMENT',   2),
    (3,   NULL, 'TEAM_TRAININGS',   'Team Trainings',       'Users',            '/team-trainings',      'ASSIGNMENT',   3),
    (4,   NULL, 'ASSIGN_TRAINING',  'Assign Training',      'UserPlus',         '/assign-training',     'ASSIGNMENT',   4),
    (5,   NULL, 'TRAINING_CATALOG', 'Training Catalog',     'Library',          '/training-catalog',    'TRAINING',     5),
    (6,   NULL, 'TRAINING_REQ',     'Training Requests',    'FileText',         '/training-requests',   'APPROVAL',     6),
    (7,   NULL, 'APPROVALS',        'Approvals',            'CheckSquare',      '/approvals',           'APPROVAL',     7),
    (8,   NULL, 'SCHEDULES',        'Schedules',            'Calendar',         '/schedules',           'SCHEDULE',     8),
    (9,   NULL, 'ATTENDANCE',       'Attendance',           'ClipboardCheck',   '/attendance',          'ATTENDANCE',   9),
    (10,  NULL, 'ASSESSMENTS',      'Assessments',          'Award',            '/assessments',         'ASSESSMENT',   10),
    (11,  NULL, 'CERTIFICATES',     'Certificates',         'Shield',           '/certificates',        'CERTIFICATE',  11),
    (12,  NULL, 'REPORTS',          'Reports',              'BarChart3',        '/reports',             'REPORT',       12),
    -- Administration section
    (20,  NULL, 'ADMIN',            'Administration',       'Settings',         NULL,                   'ADMIN',        20),
    (21,  20,   'USER_MGMT',        'User Management',      'UserCog',          '/admin/users',         'ADMIN',        1),
    (22,  20,   'ROLE_MGMT',        'Role Management',      'ShieldCheck',      '/admin/roles',         'ADMIN',        2),
    (23,  20,   'MENU_MGMT',        'Menu Management',      'Menu',             '/admin/menus',         'ADMIN',        3),
    (24,  20,   'SCOPE_MGMT',       'Scope Filter Mgmt',    'Filter',           '/admin/scope-filters', 'ADMIN',        4),
    (25,  20,   'AUDIT_LOGS',       'Audit Logs',           'FileSearch',       '/audit-logs',          'AUDIT',        5),
    (26,  20,   'SETTINGS',         'Settings',             'Sliders',          '/settings',            'ADMIN',        6)
) AS source ([Id], [ParentId], [MenuCode], [MenuName], [Icon], [Route], [ModuleCode], [SortOrder])
ON target.[MenuCode] = source.[MenuCode]
WHEN NOT MATCHED THEN
    INSERT ([Id], [ParentId], [MenuCode], [MenuName], [Icon], [Route], [ModuleCode], [SortOrder])
    VALUES (source.[Id], source.[ParentId], source.[MenuCode], source.[MenuName], source.[Icon], source.[Route], source.[ModuleCode], source.[SortOrder]);

SET IDENTITY_INSERT [dbo].[Menus] OFF
PRINT 'Menus seeded.'
GO

-- =============================================
-- 5. ROLE-MENU MAPPINGS
-- =============================================
-- Employee: Dashboard, My Trainings, Schedules, Assessments, Certificates
INSERT INTO [dbo].[RoleMenus] ([RoleId], [MenuId])
SELECT r.Id, m.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Menus] m
WHERE r.RoleCode = 'EMPLOYEE' AND m.MenuCode IN (
    'DASHBOARD','MY_TRAININGS','TRAINING_REQ','SCHEDULES','ASSESSMENTS','CERTIFICATES'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RoleMenus] rm WHERE rm.RoleId = r.Id AND rm.MenuId = m.Id)

-- Manager: + Team Trainings, Assign Training, Approvals, Attendance, Reports
INSERT INTO [dbo].[RoleMenus] ([RoleId], [MenuId])
SELECT r.Id, m.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Menus] m
WHERE r.RoleCode = 'MANAGER' AND m.MenuCode IN (
    'DASHBOARD','MY_TRAININGS','TEAM_TRAININGS','ASSIGN_TRAINING','APPROVALS',
    'SCHEDULES','ATTENDANCE','ASSESSMENTS','CERTIFICATES','REPORTS'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RoleMenus] rm WHERE rm.RoleId = r.Id AND rm.MenuId = m.Id)

-- HR Officer / HR Admin / Training Coordinator: broad training access
INSERT INTO [dbo].[RoleMenus] ([RoleId], [MenuId])
SELECT r.Id, m.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Menus] m
WHERE r.RoleCode IN ('HR_OFFICER','HR_ADMIN','TRAINING_COORD') AND m.MenuCode IN (
    'DASHBOARD','MY_TRAININGS','TEAM_TRAININGS','ASSIGN_TRAINING','TRAINING_CATALOG',
    'TRAINING_REQ','APPROVALS','SCHEDULES','ATTENDANCE','ASSESSMENTS','CERTIFICATES','REPORTS'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RoleMenus] rm WHERE rm.RoleId = r.Id AND rm.MenuId = m.Id)

-- HOD / Cluster Manager / Tech Lead
INSERT INTO [dbo].[RoleMenus] ([RoleId], [MenuId])
SELECT r.Id, m.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Menus] m
WHERE r.RoleCode IN ('HOD','CLUSTER_MGR','TECH_LEAD') AND m.MenuCode IN (
    'DASHBOARD','MY_TRAININGS','TEAM_TRAININGS','ASSIGN_TRAINING','APPROVALS',
    'SCHEDULES','ATTENDANCE','ASSESSMENTS','CERTIFICATES','REPORTS'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RoleMenus] rm WHERE rm.RoleId = r.Id AND rm.MenuId = m.Id)

-- System Admin / SuperUser: everything
INSERT INTO [dbo].[RoleMenus] ([RoleId], [MenuId])
SELECT r.Id, m.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Menus] m
WHERE r.RoleCode IN ('SYSADMIN','SUPERUSER')
AND NOT EXISTS (SELECT 1 FROM [dbo].[RoleMenus] rm WHERE rm.RoleId = r.Id AND rm.MenuId = m.Id)

-- Auditor: read-only everything + admin menus for audit
INSERT INTO [dbo].[RoleMenus] ([RoleId], [MenuId])
SELECT r.Id, m.Id FROM [dbo].[Roles] r CROSS JOIN [dbo].[Menus] m
WHERE r.RoleCode = 'AUDITOR' AND m.MenuCode IN (
    'DASHBOARD','MY_TRAININGS','TEAM_TRAININGS','TRAINING_CATALOG','APPROVALS',
    'SCHEDULES','ATTENDANCE','ASSESSMENTS','CERTIFICATES','REPORTS','ADMIN','AUDIT_LOGS'
) AND NOT EXISTS (SELECT 1 FROM [dbo].[RoleMenus] rm WHERE rm.RoleId = r.Id AND rm.MenuId = m.Id)

PRINT 'Role-Menu mappings seeded.'
GO

-- =============================================
-- 6. DEFAULT SUPERUSER (admin/admin)
-- Password: Admin@123 (SHA256 hashed with salt)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM [dbo].[SecurityUsers] WHERE [Username] = 'admin')
BEGIN
    DECLARE @Salt NVARCHAR(200) = 'TRDS_DEFAULT_SALT_2025'
    DECLARE @PasswordHash NVARCHAR(500) = CONVERT(NVARCHAR(500), HASHBYTES('SHA2_256', 'Admin@123' + @Salt), 2)
    
    INSERT INTO [dbo].[SecurityUsers] ([Username], [PasswordHash], [Salt], [DisplayName], [Email], [IsActive])
    VALUES ('admin', @PasswordHash, @Salt, 'System Administrator', 'admin@company.com', 1)
    
    -- Assign SuperUser + SysAdmin roles
    DECLARE @AdminId INT = SCOPE_IDENTITY()
    INSERT INTO [dbo].[UserRoles] ([UserType], [SecurityUserId], [RoleId])
    SELECT 'SuperUser', @AdminId, Id FROM [dbo].[Roles] WHERE RoleCode IN ('SUPERUSER', 'SYSADMIN')
    
    -- Set company-wide scope for admin
    INSERT INTO [dbo].[UserScopeFilters] ([UserType], [SecurityUserId], [ScopeType])
    VALUES ('SuperUser', @AdminId, 'Company')
    
    PRINT 'Default SuperUser [admin] created with password: Admin@123'
END
GO

-- =============================================
-- 7. SAMPLE TRAINING CATEGORIES
-- =============================================
MERGE INTO [dbo].[TrainingCategory] AS target
USING (VALUES
    ('COMPLIANCE',  'Compliance & Regulatory',  'Mandatory compliance and regulatory trainings', 1),
    ('SAFETY',      'Health & Safety',          'Workplace health and safety trainings', 2),
    ('TECHNICAL',   'Technical Skills',         'Technical and professional skills development', 3),
    ('SOFT_SKILLS', 'Soft Skills',              'Communication, leadership, and interpersonal skills', 4),
    ('ONBOARDING',  'Onboarding',              'New employee onboarding programs', 5),
    ('MANAGEMENT',  'Management & Leadership',  'Management and leadership development', 6),
    ('IT_SECURITY', 'IT & Cyber Security',      'Information technology and cybersecurity awareness', 7),
    ('PRODUCT',     'Product Training',         'Product knowledge and updates', 8)
) AS source ([CategoryCode], [CategoryName], [Description], [SortOrder])
ON target.[CategoryCode] = source.[CategoryCode]
WHEN NOT MATCHED THEN
    INSERT ([CategoryCode], [CategoryName], [Description], [SortOrder])
    VALUES (source.[CategoryCode], source.[CategoryName], source.[Description], source.[SortOrder]);

PRINT 'Training categories seeded.'
GO

PRINT '=========================================='
PRINT 'Seed data insertion complete.'
PRINT '=========================================='
GO
