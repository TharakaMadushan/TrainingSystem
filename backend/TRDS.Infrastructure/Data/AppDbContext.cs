using Microsoft.EntityFrameworkCore;
using TRDS.Core.Entities;

namespace TRDS.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Security
    public DbSet<SecurityUser> SecurityUsers => Set<SecurityUser>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Menu> Menus => Set<Menu>();
    public DbSet<RoleMenu> RoleMenus => Set<RoleMenu>();
    public DbSet<UserScopeFilter> UserScopeFilters => Set<UserScopeFilter>();
    public DbSet<LoginAudit> LoginAudits => Set<LoginAudit>();

    // HR
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Designation> Designations => Set<Designation>();
    public DbSet<Cluster> Clusters => Set<Cluster>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<EmployeeHierarchy> EmployeeHierarchies => Set<EmployeeHierarchy>();

    // Training
    public DbSet<TrainingCategory> TrainingCategories => Set<TrainingCategory>();
    public DbSet<TrainingMaster> TrainingMasters => Set<TrainingMaster>();
    public DbSet<TrainingAssignment> TrainingAssignments => Set<TrainingAssignment>();
    public DbSet<TrainingAssignmentDetail> TrainingAssignmentDetails => Set<TrainingAssignmentDetail>();
    public DbSet<TrainingApproval> TrainingApprovals => Set<TrainingApproval>();
    public DbSet<TrainingSchedule> TrainingSchedules => Set<TrainingSchedule>();
    public DbSet<TrainingAttendance> TrainingAttendances => Set<TrainingAttendance>();
    public DbSet<TrainingAssessment> TrainingAssessments => Set<TrainingAssessment>();
    public DbSet<TrainingCertificate> TrainingCertificates => Set<TrainingCertificate>();
    public DbSet<TrainingAttachment> TrainingAttachments => Set<TrainingAttachment>();

    // Logs
    public DbSet<ActivityAudit> ActivityAudits => Set<ActivityAudit>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();
    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Security
        modelBuilder.Entity<SecurityUser>(e =>
        {
            e.ToTable("SecurityUsers");
            e.HasIndex(x => x.Username).IsUnique();
        });

        modelBuilder.Entity<Role>(e =>
        {
            e.ToTable("Roles");
            e.HasIndex(x => x.RoleCode).IsUnique();
        });

        modelBuilder.Entity<Permission>(e =>
        {
            e.ToTable("Permissions");
            e.HasIndex(x => x.PermissionCode).IsUnique();
        });

        modelBuilder.Entity<UserRole>(e =>
        {
            e.ToTable("UserRoles");
            e.HasOne(x => x.Role).WithMany(r => r.UserRoles).HasForeignKey(x => x.RoleId);
            e.HasOne(x => x.SecurityUser).WithMany(s => s.UserRoles).HasForeignKey(x => x.SecurityUserId);
        });

        modelBuilder.Entity<RolePermission>(e =>
        {
            e.ToTable("RolePermissions");
            e.HasOne(x => x.Role).WithMany(r => r.RolePermissions).HasForeignKey(x => x.RoleId);
            e.HasOne(x => x.Permission).WithMany(p => p.RolePermissions).HasForeignKey(x => x.PermissionId);
            e.HasIndex(x => new { x.RoleId, x.PermissionId }).IsUnique();
        });

        modelBuilder.Entity<Menu>(e =>
        {
            e.ToTable("Menus");
            e.HasIndex(x => x.MenuCode).IsUnique();
            e.HasOne(x => x.Parent).WithMany(m => m.Children).HasForeignKey(x => x.ParentId);
        });

        modelBuilder.Entity<RoleMenu>(e =>
        {
            e.ToTable("RoleMenus");
            e.HasOne(x => x.Role).WithMany(r => r.RoleMenus).HasForeignKey(x => x.RoleId);
            e.HasOne(x => x.Menu).WithMany(m => m.RoleMenus).HasForeignKey(x => x.MenuId);
            e.HasIndex(x => new { x.RoleId, x.MenuId }).IsUnique();
        });

        modelBuilder.Entity<UserScopeFilter>(e =>
        {
            e.ToTable("UserScopeFilters");
            e.HasOne(x => x.SecurityUser).WithMany(s => s.UserScopeFilters).HasForeignKey(x => x.SecurityUserId);
        });

        modelBuilder.Entity<LoginAudit>(e =>
        {
            e.ToTable("LoginAudit");
            e.HasIndex(x => x.LoginDate).IsDescending();
        });

        // HR
        modelBuilder.Entity<Department>(e => { e.ToTable("Departments"); e.HasIndex(x => x.DepartmentCode).IsUnique(); });
        modelBuilder.Entity<Designation>(e => { e.ToTable("Designations"); e.HasIndex(x => x.DesignationCode).IsUnique(); });
        modelBuilder.Entity<Cluster>(e => { e.ToTable("Clusters"); e.HasIndex(x => x.ClusterCode).IsUnique(); });
        modelBuilder.Entity<Location>(e => { e.ToTable("Locations"); e.HasIndex(x => x.LocationCode).IsUnique(); });

        modelBuilder.Entity<EmployeeHierarchy>(e =>
        {
            e.ToTable("EmployeeHierarchy");
            e.HasIndex(x => x.EmployeeNo).IsUnique();
            e.HasOne(x => x.Department).WithMany().HasForeignKey(x => x.DepartmentId);
            e.HasOne(x => x.Designation).WithMany().HasForeignKey(x => x.DesignationId);
            e.HasOne(x => x.Cluster).WithMany().HasForeignKey(x => x.ClusterId);
            e.HasOne(x => x.Location).WithMany().HasForeignKey(x => x.LocationId);
        });

        // Training
        modelBuilder.Entity<TrainingCategory>(e =>
        {
            e.ToTable("TrainingCategory");
            e.HasIndex(x => x.CategoryCode).IsUnique();
            e.HasOne(x => x.Parent).WithMany(c => c.Children).HasForeignKey(x => x.ParentId);
        });

        modelBuilder.Entity<TrainingMaster>(e =>
        {
            e.ToTable("TrainingMaster");
            e.HasIndex(x => x.TrainingCode).IsUnique();
            e.HasOne(x => x.Category).WithMany(c => c.Trainings).HasForeignKey(x => x.CategoryId);
        });

        modelBuilder.Entity<TrainingAssignment>(e =>
        {
            e.ToTable("TrainingAssignment");
            e.HasOne(x => x.Training).WithMany(t => t.Assignments).HasForeignKey(x => x.TrainingId);
        });

        modelBuilder.Entity<TrainingAssignmentDetail>(e =>
        {
            e.ToTable("TrainingAssignmentDetail");
            e.HasOne(x => x.Assignment).WithMany(a => a.Details).HasForeignKey(x => x.AssignmentId);
        });

        modelBuilder.Entity<TrainingApproval>(e => { e.ToTable("TrainingApproval"); });

        modelBuilder.Entity<TrainingSchedule>(e =>
        {
            e.ToTable("TrainingSchedule");
            e.HasIndex(x => x.ScheduleCode).IsUnique();
            e.HasOne(x => x.Training).WithMany(t => t.Schedules).HasForeignKey(x => x.TrainingId);
        });

        modelBuilder.Entity<TrainingAttendance>(e =>
        {
            e.ToTable("TrainingAttendance");
            e.HasOne(x => x.Schedule).WithMany(s => s.Attendances).HasForeignKey(x => x.ScheduleId);
            e.HasIndex(x => new { x.ScheduleId, x.EmployeeNo }).IsUnique();
        });

        modelBuilder.Entity<TrainingAssessment>(e =>
        {
            e.ToTable("TrainingAssessment");
            e.HasOne(x => x.Training).WithMany().HasForeignKey(x => x.TrainingId);
        });

        modelBuilder.Entity<TrainingCertificate>(e =>
        {
            e.ToTable("TrainingCertificate");
            e.HasIndex(x => x.CertificateNumber).IsUnique();
            e.HasOne(x => x.Training).WithMany().HasForeignKey(x => x.TrainingId);
        });

        modelBuilder.Entity<TrainingAttachment>(e => { e.ToTable("TrainingAttachment"); });

        // Logs
        modelBuilder.Entity<ActivityAudit>(e => { e.ToTable("ActivityAudit"); e.HasIndex(x => x.Timestamp).IsDescending(); });
        modelBuilder.Entity<ErrorLog>(e => { e.ToTable("ErrorLog"); e.HasIndex(x => x.Timestamp).IsDescending(); });
        modelBuilder.Entity<NotificationLog>(e => { e.ToTable("NotificationLog"); });
        modelBuilder.Entity<UserPreference>(e => { e.ToTable("UserPreferences"); });
    }
}
