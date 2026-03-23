package lk.temco.ejb;

import lk.temco.entity.UserRoleHasSystemInterface;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Stateless
public class PermissionService {

    @PersistenceContext
    private EntityManager em;

    public Optional<UserRoleHasSystemInterface> getPermission(Integer userRoleId, String interfaceCode) {
        // Try with native query - system_interface uses interface_name as identifier
        try {
            var nativeQuery = em.createNativeQuery(
                "SELECT ursi.* FROM user_role_has_system_interface ursi " +
                "JOIN system_interface si ON ursi.system_interface_id = si.id " +
                "WHERE ursi.user_role_id = ? AND si.interface_name = ? " +
                "AND ursi.is_active = 1",
                UserRoleHasSystemInterface.class
            );
            nativeQuery.setParameter(1, userRoleId);
            nativeQuery.setParameter(2, interfaceCode);
            
            var result = nativeQuery.getSingleResult();
            return Optional.of((UserRoleHasSystemInterface) result);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public boolean canView(Integer userRoleId, String interfaceCode) {
        return getPermission(userRoleId, interfaceCode)
            .map(p -> Boolean.TRUE.equals(p.getCanView()))
            .orElse(false);
    }

    public boolean canCreate(Integer userRoleId, String interfaceCode) {
        return getPermission(userRoleId, interfaceCode)
            .map(p -> Boolean.TRUE.equals(p.getCanCreate()))
            .orElse(false);
    }

    public boolean canEdit(Integer userRoleId, String interfaceCode) {
        return getPermission(userRoleId, interfaceCode)
            .map(p -> Boolean.TRUE.equals(p.getCanEdit()))
            .orElse(false);
    }

    public boolean canDelete(Integer userRoleId, String interfaceCode) {
        return getPermission(userRoleId, interfaceCode)
            .map(p -> Boolean.TRUE.equals(p.getCanDelete()))
            .orElse(false);
    }

    public Map<String, Boolean> getPermissions(Integer userRoleId, String interfaceCode) {
        Map<String, Boolean> perms = new HashMap<>();
        Optional<UserRoleHasSystemInterface> perm = getPermission(userRoleId, interfaceCode);
        
        if (perm.isPresent()) {
            UserRoleHasSystemInterface p = perm.get();
            perms.put("canView", Boolean.TRUE.equals(p.getCanView()));
            perms.put("canCreate", Boolean.TRUE.equals(p.getCanCreate()));
            perms.put("canEdit", Boolean.TRUE.equals(p.getCanEdit()));
            perms.put("canDelete", Boolean.TRUE.equals(p.getCanDelete()));
        } else {
            perms.put("canView", false);
            perms.put("canCreate", false);
            perms.put("canEdit", false);
            perms.put("canDelete", false);
        }
        
        return perms;
    }

    public List<Map<String, Object>> getAllPermissionsForRole(Integer userRoleId) {
        TypedQuery<UserRoleHasSystemInterface> query = em.createQuery(
            "SELECT p FROM UserRoleHasSystemInterface p " +
            "JOIN FETCH p.systemInterface si " +
            "WHERE p.userRoleId = :roleId AND p.isActive = true AND si.isActive = true",
            UserRoleHasSystemInterface.class
        );
        query.setParameter("roleId", userRoleId);

        return query.getResultList().stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("interfaceCode", p.getSystemInterface().getInterfaceCode());
            map.put("interfaceName", p.getSystemInterface().getInterfaceName());
            map.put("canView", p.getCanView());
            map.put("canCreate", p.getCanCreate());
            map.put("canEdit", p.getCanEdit());
            map.put("canDelete", p.getCanDelete());
            return map;
        }).toList();
    }
}
