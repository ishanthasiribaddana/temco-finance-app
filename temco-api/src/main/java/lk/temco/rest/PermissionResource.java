package lk.temco.rest;

import lk.temco.ejb.AuthService;
import lk.temco.ejb.PermissionService;
import lk.temco.entity.UserLogin;

import javax.ejb.EJB;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Path("/permissions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PermissionResource {

    @EJB
    private AuthService authService;

    @EJB
    private PermissionService permissionService;

    @GET
    @Path("/check/{interfaceCode}")
    public Response checkPermission(
            @HeaderParam("Authorization") String authHeader,
            @PathParam("interfaceCode") String interfaceCode) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return errorResponse(401, "No token provided");
        }

        String token = authHeader.substring(7);
        Optional<UserLogin> userOpt = authService.validateToken(token);

        if (userOpt.isEmpty()) {
            return errorResponse(401, "Invalid or expired token");
        }

        UserLogin user = userOpt.get();
        Integer roleId = user.getUserRoleId();

        if (roleId == null) {
            return errorResponse(403, "User has no role assigned");
        }

        Map<String, Boolean> permissions = permissionService.getPermissions(roleId, interfaceCode);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("interfaceCode", interfaceCode);
        response.put("permissions", permissions);

        return Response.ok(response).build();
    }

    @GET
    @Path("/my-permissions")
    public Response getMyPermissions(@HeaderParam("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return errorResponse(401, "No token provided");
        }

        String token = authHeader.substring(7);
        Optional<UserLogin> userOpt = authService.validateToken(token);

        if (userOpt.isEmpty()) {
            return errorResponse(401, "Invalid or expired token");
        }

        UserLogin user = userOpt.get();
        Integer roleId = user.getUserRoleId();

        if (roleId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("permissions", java.util.Collections.emptyList());
            return Response.ok(response).build();
        }

        var permissions = permissionService.getAllPermissionsForRole(roleId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("roleId", roleId);
        response.put("permissions", permissions);

        return Response.ok(response).build();
    }

    private Response errorResponse(int status, String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        return Response.status(status).entity(error).build();
    }
}
