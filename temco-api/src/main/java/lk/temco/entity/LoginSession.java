package lk.temco.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_session")
public class LoginSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "ip")
    private String ip;

    @Column(name = "user_login_id")
    private Integer userLoginId;

    @Column(name = "general_organization_profile_id")
    private Integer generalOrganizationProfileId;

    @Column(name = "user_login_group_id")
    private Integer userLoginGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_login_id", insertable = false, updatable = false)
    private UserLogin userLogin;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public Integer getUserLoginId() { return userLoginId; }
    public void setUserLoginId(Integer userLoginId) { this.userLoginId = userLoginId; }

    public Integer getGeneralOrganizationProfileId() { return generalOrganizationProfileId; }
    public void setGeneralOrganizationProfileId(Integer generalOrganizationProfileId) { this.generalOrganizationProfileId = generalOrganizationProfileId; }

    public Integer getUserLoginGroupId() { return userLoginGroupId; }
    public void setUserLoginGroupId(Integer userLoginGroupId) { this.userLoginGroupId = userLoginGroupId; }

    public UserLogin getUserLogin() { return userLogin; }
    public void setUserLogin(UserLogin userLogin) { this.userLogin = userLogin; }
}
