namespace TRDS.Core.Entities;

public class ActivityAudit
{
    public long Id { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string RecordId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? ChangedFields { get; set; }
    public string? UserType { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.Now;
}

public class ErrorLog
{
    public long Id { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public string? StackTrace { get; set; }
    public string? Source { get; set; }
    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }
    public string? RequestBody { get; set; }
    public string? UserId { get; set; }
    public string? IPAddress { get; set; }
    public string Severity { get; set; } = "Error";
    public DateTime Timestamp { get; set; } = DateTime.Now;
}

public class NotificationLog
{
    public long Id { get; set; }
    public string RecipientEmployeeNo { get; set; } = string.Empty;
    public string NotificationType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadDate { get; set; }
    public bool IsSent { get; set; }
    public DateTime? SentDate { get; set; }
    public string Channel { get; set; } = "InApp";
    public DateTime CreatedDate { get; set; } = DateTime.Now;
}

public class UserPreference
{
    public int Id { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string? EmployeeNo { get; set; }
    public int? SecurityUserId { get; set; }
    public string ThemeMode { get; set; } = "Light";
    public bool SidebarCollapsed { get; set; }
    public int DefaultPageSize { get; set; } = 20;
    public string? DashboardLayout { get; set; }
    public DateTime ModifiedDate { get; set; } = DateTime.Now;
}
