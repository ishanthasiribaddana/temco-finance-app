package lk.temco.rest;

import javax.ejb.EJB;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import lk.temco.ejb.CustomerService;
import lk.temco.entity.GeneralUserProfile;

import java.util.*;

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CustomerResource {

    @EJB
    private CustomerService customerService;

    @GET
    @Path("/customers")
    public Response getCustomers() {
        try {
            List<GeneralUserProfile> users = customerService.getAllCustomers(100);

            List<Map<String, Object>> result = new ArrayList<>();
            for (GeneralUserProfile user : users) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", user.getId());
                map.put("partnerCode", "C" + String.format("%04d", user.getId()));
                map.put("partnerName", user.getFullName() != null ? user.getFullName() : 
                    ((user.getFirstName() != null ? user.getFirstName() : "") + " " + 
                     (user.getLastName() != null ? user.getLastName() : "")).trim());
                map.put("partnerType", "CUSTOMER");
                map.put("taxId", user.getNic() != null ? user.getNic() : "");
                map.put("email", user.getEmail() != null ? user.getEmail() : "");
                map.put("phone", user.getMobileNo() != null ? user.getMobileNo() : 
                    (user.getHomePhone() != null ? user.getHomePhone() : ""));
                map.put("address", buildAddress(user));
                map.put("creditLimit", 100000);
                map.put("paymentTermsDays", 30);
                map.put("isActive", user.getIsActive() != null && user.getIsActive());
                result.add(map);
            }

            return Response.ok(result).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(500).entity(error).build();
        }
    }

    @GET
    @Path("/customers/count")
    public Response getCustomerCount() {
        try {
            long count = customerService.getCustomerCount();
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(500).entity(error).build();
        }
    }

    private String buildAddress(GeneralUserProfile user) {
        List<String> parts = new ArrayList<>();
        if (user.getAddress1() != null && !user.getAddress1().isEmpty()) parts.add(user.getAddress1());
        if (user.getAddress2() != null && !user.getAddress2().isEmpty()) parts.add(user.getAddress2());
        if (user.getAddress3() != null && !user.getAddress3().isEmpty()) parts.add(user.getAddress3());
        return String.join(", ", parts);
    }
}
