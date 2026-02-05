package lk.temco.ejb;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

import lk.temco.entity.FinPartner;
import lk.temco.entity.FinPartnerType;
import lk.temco.entity.FinPartnerHasType;
import lk.temco.entity.GeneralUserProfile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Stateless
public class PartnerService {

    @PersistenceContext(unitName = "temcoPU")
    private EntityManager em;

    // ==================== PARTNER TYPES ====================
    
    @SuppressWarnings("unchecked")
    public List<Object[]> getAllPartnerTypes() {
        // Load all partner types from fin_partner_type table
        String sql = "SELECT id, type_code, type_name, description " +
                     "FROM fin_partner_type " +
                     "WHERE is_active = 1 " +
                     "ORDER BY id";
        return em.createNativeQuery(sql).getResultList();
    }

    public Optional<FinPartnerType> getPartnerTypeById(Integer id) {
        FinPartnerType type = em.find(FinPartnerType.class, id);
        return Optional.ofNullable(type);
    }

    // ==================== PARTNERS ====================

    public List<Object[]> getAllPartners(Integer typeId) {
        // Map partner types based on partner_code prefix since DB has incorrect partner_type_id values
        // MBR- = Member (1), EMP- = Employee (2), C = Customer (3), V/other = Vendor (4)
        String sql = "SELECT p.id, p.partner_code, p.partner_name, " +
                     "CASE " +
                     "  WHEN p.partner_code LIKE 'MBR-%' THEN 1 " +
                     "  WHEN p.partner_code LIKE 'EMP-%' THEN 2 " +
                     "  WHEN p.partner_code LIKE 'C%' THEN 3 " +
                     "  ELSE 4 " +
                     "END as computed_type_id, " +
                     "CASE " +
                     "  WHEN p.partner_code LIKE 'MBR-%' THEN 'MEMBER' " +
                     "  WHEN p.partner_code LIKE 'EMP-%' THEN 'EMPLOYEE' " +
                     "  WHEN p.partner_code LIKE 'C%' THEN 'CUSTOMER' " +
                     "  ELSE 'VENDOR' " +
                     "END as type_code, " +
                     "p.tax_id, p.credit_limit, p.payment_terms_days, p.is_active, " +
                     "gup.email, gup.mobile_no, gup.home_phone, gup.address1, gup.address2, gup.address3 " +
                     "FROM fin_partner p " +
                     "LEFT JOIN general_user_profile gup ON p.user_profile_id = gup.id " +
                     "WHERE p.is_active = 1";
        
        if (typeId != null) {
            // Filter by computed type based on partner_code prefix
            sql += " AND CASE " +
                   "  WHEN p.partner_code LIKE 'MBR-%' THEN 1 " +
                   "  WHEN p.partner_code LIKE 'EMP-%' THEN 2 " +
                   "  WHEN p.partner_code LIKE 'C%' THEN 3 " +
                   "  ELSE 4 " +
                   "END = :typeId";
        }
        sql += " ORDER BY p.id";

        var query = em.createNativeQuery(sql);
        if (typeId != null) {
            query.setParameter("typeId", typeId);
        }
        
        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results;
    }

    public Optional<FinPartner> getPartnerById(Integer id) {
        try {
            FinPartner partner = em.createQuery(
                "SELECT p FROM FinPartner p " +
                "LEFT JOIN FETCH p.userProfile " +
                "LEFT JOIN FETCH p.partnerType " +
                "WHERE p.id = :id",
                FinPartner.class
            ).setParameter("id", id).getSingleResult();
            return Optional.of(partner);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public long getPartnerCount() {
        return em.createQuery("SELECT COUNT(p) FROM FinPartner p WHERE p.isActive = true", Long.class)
                 .getSingleResult();
    }

    // ==================== CREATE PARTNER ====================

    public record CreatePartnerResult(boolean success, String error, FinPartner partner) {}

    public CreatePartnerResult createPartner(Integer userProfileId, List<Integer> partnerTypeIds) {
        // Validate user profile exists
        GeneralUserProfile userProfile = em.find(GeneralUserProfile.class, userProfileId);
        if (userProfile == null) {
            return new CreatePartnerResult(false, "User profile not found", null);
        }

        // Check if partner already exists for this user
        List<FinPartner> existing = em.createQuery(
            "SELECT p FROM FinPartner p WHERE p.userProfileId = :userProfileId",
            FinPartner.class
        ).setParameter("userProfileId", userProfileId).getResultList();

        if (!existing.isEmpty()) {
            return new CreatePartnerResult(false, "Partner already exists for this user", null);
        }

        // Get the primary type (first in list)
        Integer primaryTypeId = partnerTypeIds.get(0);
        FinPartnerType primaryType = em.find(FinPartnerType.class, primaryTypeId);
        if (primaryType == null) {
            return new CreatePartnerResult(false, "Invalid partner type", null);
        }

        // Generate partner code
        String partnerCode = generatePartnerCode(primaryType.getTypeCode());

        // Create partner
        FinPartner partner = new FinPartner();
        partner.setPartnerCode(partnerCode);
        partner.setPartnerName(userProfile.getFullName());
        partner.setPartnerTypeId(primaryTypeId);
        partner.setUserProfileId(userProfileId);
        partner.setTaxId(userProfile.getNic());
        partner.setCreditLimit(new BigDecimal("100000.00"));
        partner.setPaymentTermsDays(30);
        partner.setIsActive(true);
        em.persist(partner);
        em.flush(); // Get the generated ID

        // Create junction table entries for all types
        for (int i = 0; i < partnerTypeIds.size(); i++) {
            Integer typeId = partnerTypeIds.get(i);
            FinPartnerHasType hasType = new FinPartnerHasType();
            hasType.setPartnerId(partner.getId());
            hasType.setPartnerTypeId(typeId);
            hasType.setIsPrimary(i == 0); // First is primary
            em.persist(hasType);
        }

        return new CreatePartnerResult(true, null, partner);
    }

    private String generatePartnerCode(String typeCode) {
        // Get max ID to generate next code
        Long maxId = em.createQuery("SELECT COALESCE(MAX(p.id), 0) FROM FinPartner p", Long.class)
                       .getSingleResult();
        
        String prefix;
        switch (typeCode.toUpperCase()) {
            case "CUSTOMER":
                prefix = "C";
                break;
            case "VENDOR":
                prefix = "V";
                break;
            case "EMPLOYEE":
                prefix = "E";
                break;
            default:
                prefix = "P";
        }
        
        return prefix + String.format("%04d", maxId + 1);
    }

    // ==================== USER LOOKUP ====================

    public Optional<GeneralUserProfile> lookupUserByNic(String nic) {
        try {
            GeneralUserProfile user = em.createQuery(
                "SELECT u FROM GeneralUserProfile u WHERE u.nic = :nic",
                GeneralUserProfile.class
            ).setParameter("nic", nic).getSingleResult();
            return Optional.of(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public boolean isUserAlreadyPartner(Integer userProfileId) {
        Long count = em.createQuery(
            "SELECT COUNT(p) FROM FinPartner p WHERE p.userProfileId = :userProfileId",
            Long.class
        ).setParameter("userProfileId", userProfileId).getSingleResult();
        return count > 0;
    }

    // ==================== SEARCH ====================

    public List<GeneralUserProfile> searchUsers(String name, int limit) {
        return em.createQuery(
            "SELECT u FROM GeneralUserProfile u WHERE " +
            "(u.fullName LIKE :name OR u.firstName LIKE :name) " +
            "ORDER BY u.id",
            GeneralUserProfile.class
        )
        .setParameter("name", "%" + name + "%")
        .setMaxResults(limit)
        .getResultList();
    }

    // ==================== FIX DATA ====================

    public int fixPartnerTypeIds() {
        int total = 0;
        
        // Fix Members (MBR- prefix should be type 1)
        total += em.createNativeQuery(
            "UPDATE fin_partner SET partner_type_id = 1 WHERE partner_code LIKE 'MBR-%' AND partner_type_id != 1"
        ).executeUpdate();
        
        // Fix Employees (EMP- prefix should be type 2)
        total += em.createNativeQuery(
            "UPDATE fin_partner SET partner_type_id = 2 WHERE partner_code LIKE 'EMP-%' AND partner_type_id != 2"
        ).executeUpdate();
        
        // Fix Customers (C prefix, not MBR-, should be type 3)
        total += em.createNativeQuery(
            "UPDATE fin_partner SET partner_type_id = 3 WHERE partner_code LIKE 'C%' AND partner_code NOT LIKE 'MBR-%' AND partner_type_id != 3"
        ).executeUpdate();
        
        return total;
    }

    // ==================== GENERIC COUNT ====================

    public long getTableCount(String tableName) {
        // Only allow specific tables for security
        String[] allowedTables = {"fin_partner", "fin_partner_type", "general_user_profile", "user_login"};
        boolean allowed = false;
        for (String t : allowedTables) {
            if (t.equalsIgnoreCase(tableName)) {
                allowed = true;
                break;
            }
        }
        if (!allowed) {
            return -1;
        }

        try {
            return ((Number) em.createNativeQuery("SELECT COUNT(*) FROM " + tableName)
                              .getSingleResult()).longValue();
        } catch (Exception e) {
            return -1;
        }
    }
}
