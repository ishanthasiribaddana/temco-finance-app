package lk.temcobank.finance.dto;

import lk.temcobank.finance.entity.Partner;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PartnerDTO {

    private Integer id;
    private String partnerCode;
    private String partnerName;
    private String partnerType;
    private Integer userProfileId;
    private Integer organizationId;
    private String taxId;
    private BigDecimal creditLimit;
    private Integer paymentTermsDays;
    private Integer defaultAccountId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PartnerDTO() {}

    public PartnerDTO(Partner entity) {
        this.id = entity.getId();
        this.partnerCode = entity.getPartnerCode();
        this.partnerName = entity.getPartnerName();
        this.partnerType = entity.getPartnerType().name();
        this.userProfileId = entity.getUserProfileId();
        this.organizationId = entity.getOrganizationId();
        this.taxId = entity.getTaxId();
        this.creditLimit = entity.getCreditLimit();
        this.paymentTermsDays = entity.getPaymentTermsDays();
        this.defaultAccountId = entity.getDefaultAccountId();
        this.isActive = entity.getIsActive();
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getPartnerCode() { return partnerCode; }
    public void setPartnerCode(String partnerCode) { this.partnerCode = partnerCode; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public String getPartnerType() { return partnerType; }
    public void setPartnerType(String partnerType) { this.partnerType = partnerType; }

    public Integer getUserProfileId() { return userProfileId; }
    public void setUserProfileId(Integer userProfileId) { this.userProfileId = userProfileId; }

    public Integer getOrganizationId() { return organizationId; }
    public void setOrganizationId(Integer organizationId) { this.organizationId = organizationId; }

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
