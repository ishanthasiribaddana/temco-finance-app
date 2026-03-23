package lk.temco.rest;

import javax.ejb.EJB;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import lk.temco.ejb.PartnerService;
import lk.temco.entity.FinPartner;
import lk.temco.entity.FinPartnerType;
import lk.temco.entity.GeneralUserProfile;

import java.util.*;

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PartnerResource {

    @EJB
    private PartnerService partnerService;

    // ==================== PARTNER TYPES ====================

    @GET
    @Path("/partner-types")
    public Response getPartnerTypes() {
        try {
            List<Object[]> types = partnerService.getAllPartnerTypes();
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Object[] row : types) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", row[0]);
                map.put("typeCode", row[1]);
                map.put("typeName", row[2]);
                map.put("description", row[3]);
                result.add(map);
            }
            
            return Response.ok(result).build();
        } catch (Exception e) {
            // Fallback to static types if table doesn't exist
            List<Map<String, Object>> fallback = new ArrayList<>();
            fallback.add(createTypeMap(1, "CUSTOMER", "Customer"));
            fallback.add(createTypeMap(2, "VENDOR", "Vendor"));
            fallback.add(createTypeMap(3, "EMPLOYEE", "Employee"));
            return Response.ok(fallback).build();
        }
    }

    private Map<String, Object> createTypeMap(int id, String code, String name) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("typeCode", code);
        map.put("typeName", name);
        return map;
    }

    // ==================== PARTNERS ====================

    @GET
    @Path("/partners")
    public Response getPartners(@QueryParam("typeId") Integer typeId) {
        try {
            List<Object[]> partners = partnerService.getAllPartners(typeId);
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Object[] row : partners) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", row[0]);
                map.put("partnerCode", row[1]);
                map.put("partnerName", row[2]);
                map.put("partnerTypeId", row[3]);
                map.put("partnerType", row[4] != null ? row[4] : "UNKNOWN");
                map.put("taxId", row[5]);
                map.put("creditLimit", row[6]);
                map.put("paymentTermsDays", row[7]);
                map.put("isActive", row[8] != null && (row[8] instanceof Boolean ? (Boolean) row[8] : ((Number) row[8]).intValue() == 1));
                map.put("email", row[9]);
                map.put("phone", row[10] != null ? row[10] : row[11]);
                map.put("address", buildAddress((String) row[12], (String) row[13], (String) row[14]));
                
                result.add(map);
            }
            
            return Response.ok(result).build();
        } catch (Exception e) {
            return errorResponse(500, "Error fetching partners: " + e.getMessage());
        }
    }

    private String buildAddress(String addr1, String addr2, String addr3) {
        List<String> parts = new ArrayList<>();
        if (addr1 != null && !addr1.isEmpty()) parts.add(addr1);
        if (addr2 != null && !addr2.isEmpty()) parts.add(addr2);
        if (addr3 != null && !addr3.isEmpty()) parts.add(addr3);
        return String.join(", ", parts);
    }

    @POST
    @Path("/partners")
    public Response createPartner(Map<String, Object> body) {
        try {
            Integer userProfileId = (Integer) body.get("userProfileId");
            @SuppressWarnings("unchecked")
            List<Integer> partnerTypes = (List<Integer>) body.get("partnerTypes");

            if (userProfileId == null || partnerTypes == null || partnerTypes.isEmpty()) {
                return errorResponse(400, "userProfileId and partnerTypes are required");
            }

            PartnerService.CreatePartnerResult result = partnerService.createPartner(userProfileId, partnerTypes);

            if (!result.success()) {
                return errorResponse(400, result.error());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("partnerId", result.partner().getId());
            response.put("partnerCode", result.partner().getPartnerCode());
            response.put("message", "Partner created successfully");

            return Response.status(201).entity(response).build();
        } catch (Exception e) {
            return errorResponse(500, "Error creating partner: " + e.getMessage());
        }
    }

    // ==================== USER LOOKUP ====================

    @GET
    @Path("/lookup-by-nic/{nic}")
    public Response lookupByNic(@PathParam("nic") String nic) {
        try {
            Optional<GeneralUserProfile> userOpt = partnerService.lookupUserByNic(nic);

            Map<String, Object> response = new HashMap<>();
            if (userOpt.isPresent()) {
                GeneralUserProfile user = userOpt.get();
                response.put("found", true);
                response.put("id", user.getId());
                response.put("fullName", user.getFullName());
                response.put("nic", user.getNic());
                response.put("phone", user.getMobileNo() != null ? user.getMobileNo() : user.getHomePhone());
                response.put("email", user.getEmail());
                response.put("isAlreadyPartner", partnerService.isUserAlreadyPartner(user.getId()));
            } else {
                response.put("found", false);
            }

            return Response.ok(response).build();
        } catch (Exception e) {
            return errorResponse(500, "Error looking up user: " + e.getMessage());
        }
    }

    // ==================== SEARCH USER ====================

    @GET
    @Path("/search-user")
    public Response searchUser(@QueryParam("name") String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                return Response.ok(new ArrayList<>()).build();
            }

            List<GeneralUserProfile> users = partnerService.searchUsers(name, 10);

            List<Map<String, Object>> result = new ArrayList<>();
            for (GeneralUserProfile user : users) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", user.getId());
                map.put("nic", user.getNic());
                map.put("firstName", user.getFirstName());
                map.put("lastName", user.getLastName());
                map.put("fullName", user.getFullName());
                map.put("email", user.getEmail());
                result.add(map);
            }

            return Response.ok(result).build();
        } catch (Exception e) {
            return errorResponse(500, "Error searching users: " + e.getMessage());
        }
    }

    // ==================== COUNT ====================

    @GET
    @Path("/count/{table}")
    public Response getCount(@PathParam("table") String table) {
        try {
            long count = partnerService.getTableCount(table);
            if (count < 0) {
                return errorResponse(400, "Invalid table name");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            return Response.ok(response).build();
        } catch (Exception e) {
            return errorResponse(500, "Error getting count: " + e.getMessage());
        }
    }

    private Response errorResponse(int status, String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return Response.status(status).entity(error).build();
    }

    @POST
    @Path("/admin/fix-partner-types")
    public Response fixPartnerTypes() {
        try {
            int updated = partnerService.fixPartnerTypeIds();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("updatedRecords", updated);
            response.put("message", "Partner type IDs corrected based on partner_code prefix");
            return Response.ok(response).build();
        } catch (Exception e) {
            return errorResponse(500, "Error fixing partner types: " + e.getMessage());
        }
    }
}
