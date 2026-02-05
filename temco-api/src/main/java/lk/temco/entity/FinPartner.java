package lk.temco.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fin_partner")
public class FinPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "partner_code", nullable = false, unique = true, length = 20)
    private String partnerCode;

    @Column(name = "partner_name", nullable = false, length = 200)
    private String partnerName;

    @Column(name = "partner_type_id", nullable = false)
    private Integer partnerTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_type_id", insertable = false, updatable = false)
    private FinPartnerType partnerType;

    @Column(name = "user_profile_id", nullable = false, unique = true)
    private Integer userProfileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", insertable = false, updatable = false)
    private GeneralUserProfile userProfile;

    @Column(name = "tax_id", length = 50)
    private String taxId;

    @Column(name = "credit_limit", precision = 18, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Column(name = "payment_terms_days")
    private Integer paymentTermsDays = 30;

    @Column(name = "default_account_id")
    private Integer defaultAccountId;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getPartnerCode() { return partnerCode; }
    public void setPartnerCode(String partnerCode) { this.partnerCode = partnerCode; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public Integer getPartnerTypeId() { return partnerTypeId; }
    public void setPartnerTypeId(Integer partnerTypeId) { this.partnerTypeId = partnerTypeId; }

    public FinPartnerType getPartnerType() { return partnerType; }
    public void setPartnerType(FinPartnerType partnerType) { this.partnerType = partnerType; }

    public Integer getUserProfileId() { return userProfileId; }
    public void setUserProfileId(Integer userProfileId) { this.userProfileId = userProfileId; }

    public GeneralUserProfile getUserProfile() { return userProfile; }
    public void setUserProfile(GeneralUserProfile userProfile) { this.userProfile = userProfile; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }

    public Integer getPaymentTermsDays() { return paymentTermsDays; }
    public void setPaymentTermsDays(Integer paymentTermsDays) { this.paymentTermsDays = paymentTermsDays; }

    public Integer getDefaultAccountId() { return defaultAccountId; }
    public void setDefaultAccountId(Integer defaultAccountId) { this.defaultAccountId = defaultAccountId; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
