// ============ Auth Types ============
export interface LoginRequest {
    username: string;
    password: string;
    rememberMe: boolean;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    refreshToken?: string;
    expiresAt?: string;
    profile?: UserProfile;
    errorMessage?: string;
}

export interface UserProfile {
    userType: string;
    employeeNo: string;
    employeeName: string;
    designation?: string;
    department?: string;
    cluster?: string;
    location?: string;
    managerEmployeeNo?: string;
    managerName?: string;
    email?: string;
    roles: string[];
    permissions: string[];
    scopeFilter?: ScopeFilter;
    menuItems: MenuItem[];
    preferences?: UserPreference;
}

export interface ScopeFilter {
    scopeType: string;
    scopeValue?: string;
}

export interface UserPreference {
    themeMode: 'Light' | 'Dark';
    sidebarCollapsed: boolean;
    defaultPageSize: number;
    dashboardLayout?: string;
}

// ============ Menu Types ============
export interface MenuItem {
    id: number;
    parentId?: number;
    menuCode: string;
    menuName: string;
    icon?: string;
    route?: string;
    moduleCode?: string;
    sortOrder: number;
    children: MenuItem[];
}

// ============ Dashboard Types ============
export interface DashboardResponse {
    widgets: DashboardWidget[];
    userRole: string;
}

export interface DashboardWidget {
    id: string;
    title: string;
    type: string;
    data: unknown;
    icon?: string;
    color?: string;
    order: number;
}

export interface TrainingStat {
    pendingCount: number;
    overdueCount: number;
    completedCount: number;
    inProgressCount: number;
    totalAssigned: number;
    compliancePercent: number;
    pendingApprovals: number;
    upcomingSessions: number;
    expiringCertificates: number;
}

// ============ Training Types ============
export interface Training {
    id: number;
    trainingCode: string;
    title: string;
    categoryName?: string;
    categoryId?: number;
    description?: string;
    durationHours?: number;
    trainingMode: string;
    trainerName?: string;
    validityMonths?: number;
    retrainingIntervalMonths?: number;
    isMandatory: boolean;
    passMark?: number;
    maxAttempts?: number;
    isActive: boolean;
}

export interface Assignment {
    id: number;
    trainingTitle: string;
    trainingCode: string;
    assignmentType: string;
    assignedBy: string;
    dueDate?: string;
    priority: string;
    isMandatory: boolean;
    status: string;
    totalAssigned: number;
    completedCount: number;
    createdDate: string;
}

export interface AssignmentDetail {
    id: number;
    employeeNo: string;
    employeeName?: string;
    department?: string;
    status: string;
    completionPercent: number;
    dueDate?: string;
    completedDate?: string;
    score?: number;
    isPassed?: boolean;
}

// ============ Approval Types ============
export interface Approval {
    id: number;
    referenceType: string;
    referenceId: number;
    requestedBy: string;
    requestedByName: string;
    approverEmployeeNo: string;
    approvalLevel: number;
    action: string;
    remarks?: string;
    actionDate?: string;
    createdDate: string;
    trainingTitle?: string;
}

// ============ Schedule Types ============
export interface Schedule {
    id: number;
    scheduleCode: string;
    sessionTitle?: string;
    trainingTitle: string;
    venue?: string;
    meetingLink?: string;
    trainerName?: string;
    startDateTime: string;
    endDateTime: string;
    capacity?: number;
    enrolledCount: number;
    status: string;
}

// ============ Notification Types ============
export interface Notification {
    id: number;
    notificationType: string;
    title: string;
    message?: string;
    referenceType?: string;
    referenceId?: number;
    isRead: boolean;
    createdDate: string;
}

// ============ Employee Types ============
export interface EmployeeLookup {
    employeeNo: string;
    employeeName: string;
    department?: string;
    designation?: string;
    cluster?: string;
    location?: string;
}

// ============ Certificate Types ============
export interface Certificate {
    id: number;
    certificateNumber: string;
    trainingTitle: string;
    employeeNo: string;
    employeeName?: string;
    issueDate: string;
    expiryDate?: string;
    status: string;
    daysToExpiry?: number;
}

// ============ Common Types ============
export interface PagedRequest {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortDirection?: string;
    searchTerm?: string;
    filters?: Record<string, string>;
}

export interface PagedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

export interface LookupItem {
    id: number;
    code: string;
    name: string;
}

export interface RoleDto {
    id: number;
    roleCode: string;
    roleName: string;
    description?: string;
    isSystemRole: boolean;
    isActive: boolean;
    userCount: number;
    permissions: string[];
}

// ============ Report Types ============
export interface ReportFilter {
    dateFrom?: string;
    dateTo?: string;
    departmentId?: number;
    clusterId?: number;
    categoryId?: number;
    status?: string;
    employeeNo?: string;
    reportType: string;
}

export interface AuditLog {
    id: number;
    tableName: string;
    recordId: string;
    action: string;
    oldValues?: string;
    newValues?: string;
    userId: string;
    timestamp: string;
}
