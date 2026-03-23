package lk.temco.rest;

import javax.ejb.EJB;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import lk.temco.ejb.AuthService;
import lk.temco.ejb.PartnerService;
import lk.temco.entity.UserLogin;

import java.security.SecureRandom;
import java.util.*;

@Path("/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminResource {

    private static final int SUPER_ADMIN_ROLE_ID = 10;

    @EJB
    private AuthService authService;

    @EJB
    private PartnerService partnerService;

    @GET
    @Path("/partners")
    public Response getPartnersGroupedByType(@HeaderParam("Authorization") String authHeader) {
        Response authCheck = checkSuperAdmin(authHeader);
        if (authCheck != null) return authCheck;

        try {
            List<Object[]> types = partnerService.getAllPartnerTypes();
            List<Map<String, Object>> result = new ArrayList<>();

            for (Object[] type : types) {
                Integer typeId = ((Number) type[0]).intValue();
                String typeCode = (String) type[1];
                String typeName = (String) type[2];

                List<Object[]> partners = partnerService.getAllPartners(typeId);
                List<Map<String, Object>> partnerList = new ArrayList<>();

                for (Object[] p : partners) {
                    Map<String, Object> partner = new LinkedHashMap<>();
                    partner.put("id", p[0]);
                    partner.put("partnerCode", p[1]);
                    partner.put("partnerName", p[2]);
                    partner.put("email", p[8] != null ? p[8] : "");
                    partner.put("mobile", p[9] != null ? p[9] : "");
                    partner.put("isActive", p[7] != null && ((Number) p[7]).intValue() == 1);
                    partnerList.add(partner);
                }

                Map<String, Object> typeGroup = new LinkedHashMap<>();
                typeGroup.put("typeId", typeId);
                typeGroup.put("typeCode", typeCode);
                typeGroup.put("typeName", typeName);
                typeGroup.put("partnerCount", partnerList.size());
                typeGroup.put("partners", partnerList);
                result.add(typeGroup);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", result);
            return Response.ok(response).build();

        } catch (Exception e) {
            return errorResponse(500, "Failed to fetch partners: " + e.getMessage());
        }
    }

    @POST
    @Path("/partners/{partnerId}/send-reset-link")
    public Response sendPasswordResetLink(
            @HeaderParam("Authorization") String authHeader,
            @PathParam("partnerId") Integer partnerId) {
        
        Response authCheck = checkSuperAdmin(authHeader);
        if (authCheck != null) return authCheck;

        try {
            Optional<String> emailOpt = getPartnerEmail(partnerId);
            if (emailOpt.isEmpty()) {
                return errorResponse(404, "Partner not found or has no email");
            }

            String email = emailOpt.get();
            AuthService.OtpResult result = authService.requestPasswordReset(email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.success());
            response.put("message", "Password reset link sent to " + result.maskedEmail());
            return Response.ok(response).build();

        } catch (Exception e) {
            return errorResponse(500, "Failed to send reset link: " + e.getMessage());
        }
    }

    @POST
    @Path("/partners/{partnerId}/set-password")
    public Response setPartnerPassword(
            @HeaderParam("Authorization") String authHeader,
            @PathParam("partnerId") Integer partnerId,
            Map<String, String> body) {
        
        Response authCheck = checkSuperAdmin(authHeader);
        if (authCheck != null) return authCheck;

        String newPassword = body.get("password");
        if (newPassword == null || newPassword.length() < 6) {
            return errorResponse(400, "Password must be at least 6 characters");
        }

        try {
            Optional<String> emailOpt = getPartnerEmail(partnerId);
            if (emailOpt.isEmpty()) {
                return errorResponse(404, "Partner not found or has no email");
            }

            String email = emailOpt.get();
            boolean success = authService.resetPassword(email, newPassword);

            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "Password updated successfully" : "Failed to update password");
            return Response.ok(response).build();

        } catch (Exception e) {
            return errorResponse(500, "Failed to set password: " + e.getMessage());
        }
    }

    @GET
    @Path("/generate-password")
    public Response generateStrongPassword(@HeaderParam("Authorization") String authHeader) {
        Response authCheck = checkSuperAdmin(authHeader);
        if (authCheck != null) return authCheck;

        String password = generateStrongPassword(12);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("password", password);
        return Response.ok(response).build();
    }

    private String generateStrongPassword(int length) {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "!@#$%^&*";
        String all = upper + lower + digits + special;

        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        // Ensure at least 2 of each type
        password.append(upper.charAt(random.nextInt(upper.length())));
        password.append(upper.charAt(random.nextInt(upper.length())));
        password.append(lower.charAt(random.nextInt(lower.length())));
        password.append(lower.charAt(random.nextInt(lower.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(special.charAt(random.nextInt(special.length())));
        password.append(special.charAt(random.nextInt(special.length())));

        // Fill remaining with random from all
        for (int i = 8; i < length; i++) {
            password.append(all.charAt(random.nextInt(all.length())));
        }

        // Shuffle the password
        char[] chars = password.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }

        return new String(chars);
    }

    private Optional<String> getPartnerEmail(Integer partnerId) {
        try {
            var partnerOpt = partnerService.getPartnerById(partnerId);
            if (partnerOpt.isEmpty()) {
                return Optional.empty();
            }
            var partner = partnerOpt.get();
            var profile = partner.getUserProfile();
            if (profile == null || profile.getEmail() == null) {
                return Optional.empty();
            }
            return Optional.of(profile.getEmail());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private Response checkSuperAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return errorResponse(401, "Authentication required");
        }

        String token = authHeader.substring(7);
        Optional<UserLogin> userOpt = authService.validateToken(token);

        if (userOpt.isEmpty()) {
            return errorResponse(401, "Invalid or expired token");
        }

        UserLogin user = userOpt.get();
        Integer roleId = user.getUserRoleId();

        if (roleId == null || roleId != SUPER_ADMIN_ROLE_ID) {
            return errorResponse(403, "Access denied. Super Admin role required.");
        }

        return null;
    }

    private Response errorResponse(int status, String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return Response.status(status).entity(error).build();
    }
}
