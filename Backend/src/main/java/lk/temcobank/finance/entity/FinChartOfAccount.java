package lk.temcobank.finance.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "fin_chart_of_account")
public class FinChartOfAccount implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "account_code", nullable = false, unique = true, length = 20)
    private String accountCode;

    @Column(name = "account_name", nullable = false, length = 150)
    private String accountName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private FinChartOfAccount parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    private List<FinChartOfAccount> children;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_category_id", nullable = false)
    private FinAccountCategory accountCategory;

    @Column(name = "account_level")
    private Integer accountLevel = 1;

    @Column(name = "is_header")
    private Boolean isHeader = false;

    @Column(name = "is_posting")
    private Boolean isPosting = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "normal_balance", nullable = false)
    private NormalBalance normalBalance;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_system")
    private Boolean isSystem = false;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum NormalBalance {
        DEBIT, CREDIT
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public FinChartOfAccount getParent() { return parent; }
    public void setParent(FinChartOfAccount parent) { this.parent = parent; }

    public List<FinChartOfAccount> getChildren() { return children; }
    public void setChildren(List<FinChartOfAccount> children) { this.children = children; }

    public FinAccountCategory getAccountCategory() { return accountCategory; }
    public void setAccountCategory(FinAccountCategory accountCategory) { this.accountCategory = accountCategory; }

    public Integer getAccountLevel() { return accountLevel; }
    public void setAccountLevel(Integer accountLevel) { this.accountLevel = accountLevel; }

    public Boolean getIsHeader() { return isHeader; }
    public void setIsHeader(Boolean isHeader) { this.isHeader = isHeader; }

    public Boolean getIsPosting() { return isPosting; }
    public void setIsPosting(Boolean isPosting) { this.isPosting = isPosting; }

    public NormalBalance getNormalBalance() { return normalBalance; }
    public void setNormalBalance(NormalBalance normalBalance) { this.normalBalance = normalBalance; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsSystem() { return isSystem; }
    public void setIsSystem(Boolean isSystem) { this.isSystem = isSystem; }

    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
