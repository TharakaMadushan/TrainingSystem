namespace TRDS.Core.Entities;

public class TrainingCategory
{
    public int Id { get; set; }
    public string CategoryCode { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }

    public TrainingCategory? Parent { get; set; }
    public ICollection<TrainingCategory> Children { get; set; } = new List<TrainingCategory>();
    public ICollection<TrainingMaster> Trainings { get; set; } = new List<TrainingMaster>();
}

public class TrainingMaster
{
    public int Id { get; set; }
    public string TrainingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? Description { get; set; }
    public decimal? DurationHours { get; set; }
    public string TrainingMode { get; set; } = "Online";
    public string? TrainerName { get; set; }
    public string? TrainerEmployeeNo { get; set; }
    public int? ValidityMonths { get; set; }
    public int? RetrainingIntervalMonths { get; set; }
    public bool IsMandatory { get; set; }
    public decimal? PassMark { get; set; }
    public int? MaxAttempts { get; set; } = 3;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }

    public TrainingCategory? Category { get; set; }
    public ICollection<TrainingAssignment> Assignments { get; set; } = new List<TrainingAssignment>();
    public ICollection<TrainingSchedule> Schedules { get; set; } = new List<TrainingSchedule>();
}

public class TrainingAssignment
{
    public int Id { get; set; }
    public int TrainingId { get; set; }
    public string AssignmentType { get; set; } = "Individual";
    public string? AssignmentScope { get; set; }
    public string AssignedByEmployeeNo { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string Priority { get; set; } = "Normal";
    public bool IsMandatory { get; set; }
    public bool IsRecurring { get; set; }
    public int? RecurrenceMonths { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }

    public TrainingMaster Training { get; set; } = null!;
    public ICollection<TrainingAssignmentDetail> Details { get; set; } = new List<TrainingAssignmentDetail>();
}

public class TrainingAssignmentDetail
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public string EmployeeNo { get; set; } = string.Empty;
    public string Status { get; set; } = "NotStarted";
    public decimal CompletionPercent { get; set; }
    public DateTime? StartedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal? Score { get; set; }
    public bool? IsPassed { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public DateTime? ModifiedDate { get; set; }

    public TrainingAssignment Assignment { get; set; } = null!;
}

public class TrainingApproval
{
    public int Id { get; set; }
    public string ReferenceType { get; set; } = string.Empty;
    public int ReferenceId { get; set; }
    public string RequestedByEmployeeNo { get; set; } = string.Empty;
    public string ApproverEmployeeNo { get; set; } = string.Empty;
    public int ApprovalLevel { get; set; } = 1;
    public string Action { get; set; } = "Pending";
    public string? Remarks { get; set; }
    public DateTime? ActionDate { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
}

public class TrainingSchedule
{
    public int Id { get; set; }
    public int TrainingId { get; set; }
    public string ScheduleCode { get; set; } = string.Empty;
    public string? SessionTitle { get; set; }
    public string? Venue { get; set; }
    public string? MeetingLink { get; set; }
    public string? TrainerName { get; set; }
    public string? TrainerEmployeeNo { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int? Capacity { get; set; }
    public string Status { get; set; } = "Scheduled";
    public string? Notes { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }

    public TrainingMaster Training { get; set; } = null!;
    public ICollection<TrainingAttendance> Attendances { get; set; } = new List<TrainingAttendance>();
}

public class TrainingAttendance
{
    public int Id { get; set; }
    public int ScheduleId { get; set; }
    public string EmployeeNo { get; set; } = string.Empty;
    public bool IsPresent { get; set; }
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public string? TrainerRemarks { get; set; }
    public decimal? Score { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public DateTime? ModifiedDate { get; set; }

    public TrainingSchedule Schedule { get; set; } = null!;
}

public class TrainingAssessment
{
    public int Id { get; set; }
    public int TrainingId { get; set; }
    public string EmployeeNo { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = "MCQ";
    public int AttemptNumber { get; set; } = 1;
    public decimal TotalMarks { get; set; }
    public decimal ObtainedMarks { get; set; }
    public decimal PassMark { get; set; }
    public bool IsPassed { get; set; }
    public DateTime AssessmentDate { get; set; } = DateTime.Now;
    public string? Remarks { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public DateTime? ModifiedDate { get; set; }

    public TrainingMaster Training { get; set; } = null!;
}

public class TrainingCertificate
{
    public int Id { get; set; }
    public int TrainingId { get; set; }
    public string EmployeeNo { get; set; } = string.Empty;
    public string CertificateNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? IssuedByEmployeeNo { get; set; }
    public string? CertificateFilePath { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime? RenewalDate { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public DateTime? ModifiedDate { get; set; }

    public TrainingMaster Training { get; set; } = null!;
}

public class TrainingAttachment
{
    public int Id { get; set; }
    public string ReferenceType { get; set; } = string.Empty;
    public int ReferenceId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public long? FileSizeBytes { get; set; }
    public string UploadedByEmployeeNo { get; set; } = string.Empty;
    public DateTime UploadedDate { get; set; } = DateTime.Now;
    public string? Description { get; set; }
}
