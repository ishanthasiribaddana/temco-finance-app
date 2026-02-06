package lk.temco.rest.dto;

public class UserResponse {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String nic;
    private Integer roleId;
    private String roleCode;

    public UserResponse() {}

    public UserResponse(Integer id, String username, String fullName, String email, String nic, Integer roleId, String roleCode) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.nic = nic;
        this.roleId = roleId;
        this.roleCode = roleCode;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }

    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
}
