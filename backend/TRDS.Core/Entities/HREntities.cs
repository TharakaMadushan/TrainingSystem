namespace TRDS.Core.Entities;

public class Department
{
    public int Id { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }
}

public class Designation
{
    public int Id { get; set; }
    public string DesignationCode { get; set; } = string.Empty;
    public string DesignationName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }
}

public class Cluster
{
    public int Id { get; set; }
    public string ClusterCode { get; set; } = string.Empty;
    public string ClusterName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }
}

public class Location
{
    public int Id { get; set; }
    public string LocationCode { get; set; } = string.Empty;
    public string LocationName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }
}

public class EmployeeHierarchy
{
    public int Id { get; set; }
    public string EmployeeNo { get; set; } = string.Empty;
    public string? ManagerEmployeeNo { get; set; }
    public int? DepartmentId { get; set; }
    public int? DesignationId { get; set; }
    public int? ClusterId { get; set; }
    public int? LocationId { get; set; }
    public int HierarchyLevel { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastSyncDate { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public DateTime? ModifiedDate { get; set; }

    public Department? Department { get; set; }
    public Designation? Designation { get; set; }
    public Cluster? Cluster { get; set; }
    public Location? Location { get; set; }
}
