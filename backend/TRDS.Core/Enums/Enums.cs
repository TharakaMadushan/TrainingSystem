namespace TRDS.Core.Enums;

public enum UserType
{
    Employee,
    SuperUser
}

public enum ScopeType
{
    Self,
    DirectReports,
    Department,
    Cluster,
    Location,
    Company,
    Custom
}

public enum TrainingMode
{
    Online,
    Classroom,
    Hybrid
}

public enum TrainingStatus
{
    NotStarted,
    InProgress,
    Completed,
    Overdue,
    Failed
}

public enum ApprovalAction
{
    Pending,
    Approved,
    Rejected,
    OnHold,
    Returned
}

public enum AssignmentType
{
    Individual,
    Department,
    Designation,
    Cluster,
    Team,
    Bulk
}

public enum Priority
{
    Low,
    Normal,
    High,
    Critical
}

public enum AssessmentType
{
    MCQ,
    Theory,
    Practical,
    Mixed
}

public enum CertificateStatus
{
    Active,
    Expired,
    Revoked,
    Renewed
}

public enum ScheduleStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled,
    Rescheduled
}
