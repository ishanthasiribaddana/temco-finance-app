package lk.temco.rest.dto;

public class SignupRequest {
    private String nic;
    private String firstName;
    private String lastName;
    private String email;
    private String password;

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
