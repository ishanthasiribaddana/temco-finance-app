package lk.temco.ejb;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import lk.temco.entity.GeneralUserProfile;

import java.util.List;

@Stateless
public class CustomerService {

    @PersistenceContext(unitName = "temcoPU")
    private EntityManager em;

    public List<GeneralUserProfile> getAllCustomers(int limit) {
        return em.createQuery(
            "SELECT u FROM GeneralUserProfile u WHERE u.isActive = true ORDER BY u.id",
            GeneralUserProfile.class
        ).setMaxResults(limit).getResultList();
    }

    public long getCustomerCount() {
        return em.createQuery(
            "SELECT COUNT(u) FROM GeneralUserProfile u WHERE u.isActive = true",
            Long.class
        ).getSingleResult();
    }
}
