package lk.temco.entity;

import javax.persistence.*;

@Entity
@Table(name = "user_role_has_system_interface")
public class UserRoleHasSystemInterface {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_role_id", nullable = false)
    private Integer userRoleId;

    @Column(name = "system_interface_id", nullable = false)
    private Integer systemInterfaceId;

    @Column(name = "can_view")
    private Boolean canView = true;

    @Column(name = "can_create")
    private Boolean canCreate = false;

    @Column(name = "can_edit")
    private Boolean canEdit = false;

    @Column(name = "can_delete")
    private Boolean canDelete = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_role_id", insertable = false, updatable = false)
    private UserRole userRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_interface_id", insertable = false, updatable = false)
    private SystemInterface systemInterface;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUserRoleId() { return userRoleId; }
    public void setUserRoleId(Integer userRoleId) { this.userRoleId = userRoleId; }

    public Integer getSystemInterfaceId() { return systemInterfaceId; }
    public void setSystemInterfaceId(Integer systemInterfaceId) { this.systemInterfaceId = systemInterfaceId; }

    public Boolean getCanView() { return canView; }
    public void setCanView(Boolean canView) { this.canView = canView; }

    public Boolean getCanCreate() { return canCreate; }
    public void setCanCreate(Boolean canCreate) { this.canCreate = canCreate; }

    public Boolean getCanEdit() { return canEdit; }
    public void setCanEdit(Boolean canEdit) { this.canEdit = canEdit; }

    public Boolean getCanDelete() { return canDelete; }
    public void setCanDelete(Boolean canDelete) { this.canDelete = canDelete; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public UserRole getUserRole() { return userRole; }
    public void setUserRole(UserRole userRole) { this.userRole = userRole; }

    public SystemInterface getSystemInterface() { return systemInterface; }
    public void setSystemInterface(SystemInterface systemInterface) { this.systemInterface = systemInterface; }
}
