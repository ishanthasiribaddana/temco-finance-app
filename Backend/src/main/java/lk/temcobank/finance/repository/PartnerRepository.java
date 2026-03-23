package lk.temcobank.finance.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import lk.temcobank.finance.entity.Partner;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PartnerRepository {

    @PersistenceContext(unitName = "financePU")
    private EntityManager em;

    public List<Partner> findAll() {
        TypedQuery<Partner> query = em.createQuery("SELECT p FROM Partner p ORDER BY p.partnerName", Partner.class);
        return query.getResultList();
    }

    public List<Partner> findByType(Partner.PartnerType type) {
        TypedQuery<Partner> query = em.createQuery(
            "SELECT p FROM Partner p WHERE p.partnerType = :type OR p.partnerType = 'BOTH' ORDER BY p.partnerName", 
            Partner.class);
        query.setParameter("type", type);
        return query.getResultList();
    }

    public Optional<Partner> findById(Integer id) {
        Partner partner = em.find(Partner.class, id);
        return Optional.ofNullable(partner);
    }

    public Optional<Partner> findByPartnerCode(String partnerCode) {
        TypedQuery<Partner> query = em.createQuery(
            "SELECT p FROM Partner p WHERE p.partnerCode = :code", Partner.class);
        query.setParameter("code", partnerCode);
        List<Partner> results = query.getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Optional<Partner> findByUserProfileId(Integer userProfileId) {
        TypedQuery<Partner> query = em.createQuery(
            "SELECT p FROM Partner p WHERE p.userProfileId = :profileId", Partner.class);
        query.setParameter("profileId", userProfileId);
        List<Partner> results = query.getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Transactional
    public Partner save(Partner partner) {
        if (partner.getId() == null) {
            em.persist(partner);
            return partner;
        } else {
            return em.merge(partner);
        }
    }

    @Transactional
    public void delete(Integer id) {
        Partner partner = em.find(Partner.class, id);
        if (partner != null) {
            em.remove(partner);
        }
    }

    public long countByType(Partner.PartnerType type) {
        TypedQuery<Long> query = em.createQuery(
            "SELECT COUNT(p) FROM Partner p WHERE p.partnerType = :type OR p.partnerType = 'BOTH'", Long.class);
        query.setParameter("type", type);
        return query.getSingleResult();
    }

    public long countAll() {
        TypedQuery<Long> query = em.createQuery("SELECT COUNT(p) FROM Partner p", Long.class);
        return query.getSingleResult();
    }

    public String generatePartnerCode(Partner.PartnerType type) {
        String prefix = type == Partner.PartnerType.CUSTOMER ? "C" : "V";
        TypedQuery<Long> query = em.createQuery(
            "SELECT COUNT(p) FROM Partner p WHERE p.partnerCode LIKE :prefix", Long.class);
        query.setParameter("prefix", prefix + "%");
        long count = query.getSingleResult() + 1;
        return String.format("%s%05d", prefix, count);
    }
}
