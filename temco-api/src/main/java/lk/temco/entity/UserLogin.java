package lk.temco.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_login")
public class UserLogin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "max_login_attempt")
    private Integer maxLoginAttempt;

    @Column(name = "count_attempt")
    private Integer countAttempt;

    @Column(name = "user_role_id")
    private Integer userRoleId;

    @Column(name = "general_user_profile_id")
    private Integer generalUserProfileId;

    @Column(name = "general_organization_profile_id")
    private Integer generalOrganizationProfileId;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "general_user_profile_id", insertable = false, updatable = false)
    private GeneralUserProfile userProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_role_id", insertable = false, updatable = false)
    private UserRole userRole;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getMaxLoginAttempt() { return maxLoginAttempt; }
    public void setMaxLoginAttempt(Integer maxLoginAttempt) { this.maxLoginAttempt = maxLoginAttempt; }

    public Integer getCountAttempt() { return countAttempt; }
    public void setCountAttempt(Integer countAttempt) { this.countAttempt = countAttempt; }

    public Integer getUserRoleId() { return userRoleId; }
    public void setUserRoleId(Integer userRoleId) { this.userRoleId = userRoleId; }

    public Integer getGeneralUserProfileId() { return generalUserProfileId; }
    public void setGeneralUserProfileId(Integer generalUserProfileId) { this.generalUserProfileId = generalUserProfileId; }

    public Integer getGeneralOrganizationProfileId() { return generalOrganizationProfileId; }
    public void setGeneralOrganizationProfileId(Integer generalOrganizationProfileId) { this.generalOrganizationProfileId = generalOrganizationProfileId; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public GeneralUserProfile getUserProfile() { return userProfile; }
    public void setUserProfile(GeneralUserProfile userProfile) { this.userProfile = userProfile; }

    public UserRole getUserRole() { return userRole; }
    public void setUserRole(UserRole userRole) { this.userRole = userRole; }
}
