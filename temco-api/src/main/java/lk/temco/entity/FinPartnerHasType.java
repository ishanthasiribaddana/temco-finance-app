package lk.temco.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fin_partner_has_type")
public class FinPartnerHasType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "partner_id", nullable = false)
    private Integer partnerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", insertable = false, updatable = false)
    private FinPartner partner;

    @Column(name = "partner_type_id", nullable = false)
    private Integer partnerTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_type_id", insertable = false, updatable = false)
    private FinPartnerType partnerType;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getPartnerId() { return partnerId; }
    public void setPartnerId(Integer partnerId) { this.partnerId = partnerId; }

    public FinPartner getPartner() { return partner; }
    public void setPartner(FinPartner partner) { this.partner = partner; }

    public Integer getPartnerTypeId() { return partnerTypeId; }
    public void setPartnerTypeId(Integer partnerTypeId) { this.partnerTypeId = partnerTypeId; }

    public FinPartnerType getPartnerType() { return partnerType; }
    public void setPartnerType(FinPartnerType partnerType) { this.partnerType = partnerType; }

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
