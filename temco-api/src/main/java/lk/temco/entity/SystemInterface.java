package lk.temco.entity;

import javax.persistence.*;

@Entity
@Table(name = "system_interface")
public class SystemInterface {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "interface_code", nullable = false, unique = true)
    private String interfaceCode;

    @Column(name = "interface_name", nullable = false)
    private String interfaceName;

    @Column(name = "description")
    private String description;

    @Column(name = "parent_id")
    private Integer parentId;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getInterfaceCode() { return interfaceCode; }
    public void setInterfaceCode(String interfaceCode) { this.interfaceCode = interfaceCode; }

    public String getInterfaceName() { return interfaceName; }
    public void setInterfaceName(String interfaceName) { this.interfaceName = interfaceName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getParentId() { return parentId; }
    public void setParentId(Integer parentId) { this.parentId = parentId; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
