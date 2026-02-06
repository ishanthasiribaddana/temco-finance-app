package lk.temco.rest;

import javax.ejb.EJB;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import lk.temco.ejb.AuthService;
import lk.temco.entity.GeneralUserProfile;
import lk.temco.entity.UserLogin;
import lk.temco.entity.UserRole;
import lk.temco.rest.dto.LoginRequest;
import lk.temco.rest.dto.SignupRequest;
import lk.temco.rest.dto.UserResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @EJB
    private AuthService authService;

    private static final String AUTH_COOKIE_NAME = "auth_token";
    private static final String COOKIE_DOMAIN = ".temcobank.com";
    private static final int COOKIE_MAX_AGE = 86400; // 24 hours

    @POST
    @Path("/login")
    public Response login(LoginRequest request, @Context HttpServletRequest httpRequest, @Context HttpServletResponse httpResponse) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return errorResponse(400, "Username and password are required");
        }

        String ip = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");

        AuthService.LoginResult result = authService.login(
            request.getUsername(), 
            request.getPassword(), 
            ip, 
            userAgent != null ? userAgent : ""
        );

        if (!result.success()) {
            return errorResponse(401, result.error());
        }

        UserLogin user = result.user();
        GeneralUserProfile profile = user.getUserProfile();
        UserRole role = user.getUserRole();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", result.token());
        response.put("expiresAt", result.expiresAt().toString());
        
        UserResponse userResponse = new UserResponse(
            user.getId(),
            user.getUsername(),
            profile != null ? profile.getFullName() : "",
            profile != null ? profile.getEmail() : "",
            profile != null ? profile.getNic() : "",
            user.getUserRoleId(),
            role != null ? role.getRoleCode() : null
        );
        response.put("user", userResponse);

        // Set shared cookie for SSO across all subdomains
        Cookie authCookie = new Cookie(AUTH_COOKIE_NAME, result.token());
        authCookie.setDomain(COOKIE_DOMAIN);
        authCookie.setPath("/");
        authCookie.setHttpOnly(true);
        authCookie.setSecure(true); // HTTPS only
        authCookie.setMaxAge(COOKIE_MAX_AGE);
        httpResponse.addCookie(authCookie);

        return Response.ok(response).build();
    }

    @POST
    @Path("/logout")
    public Response logout(@HeaderParam("Authorization") String authHeader, @Context HttpServletResponse httpResponse) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return errorResponse(400, "No token provided");
        }

        String token = authHeader.substring(7);
        boolean success = authService.logout(token);

        // Clear the SSO cookie
        Cookie authCookie = new Cookie(AUTH_COOKIE_NAME, "");
        authCookie.setDomain(COOKIE_DOMAIN);
        authCookie.setPath("/");
        authCookie.setHttpOnly(true);
        authCookie.setSecure(true);
        authCookie.setMaxAge(0); // Delete cookie
        httpResponse.addCookie(authCookie);

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Logged out successfully" : "Logout failed");

        return Response.ok(response).build();
    }

    @GET
    @Path("/me")
    public Response getCurrentUser(@HeaderParam("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return errorResponse(401, "No token provided");
        }

        String token = authHeader.substring(7);
        Optional<UserLogin> userOpt = authService.validateTokenFresh(token);

        if (userOpt.isEmpty()) {
            return errorResponse(401, "Invalid or expired token");
        }

        UserLogin user = userOpt.get();
        GeneralUserProfile profile = user.getUserProfile();
        UserRole role = user.getUserRole();

        UserResponse userResponse = new UserResponse(
            user.getId(),
            user.getUsername(),
            profile != null ? profile.getFullName() : "",
            profile != null ? profile.getEmail() : "",
            profile != null ? profile.getNic() : "",
            user.getUserRoleId(),
            role != null ? role.getRoleCode() : null
        );

        Map<String, Object> response = new HashMap<>();
        response.put("user", userResponse);

        return Response.ok(response).build();
    }

    @POST
    @Path("/signup")
    public Response signup(SignupRequest request) {
        if (request.getNic() == null || request.getFirstName() == null || 
            request.getLastName() == null || request.getEmail() == null ||
            request.getPassword() == null || request.getPassword().isEmpty()) {
            return errorResponse(400, "All fields are required including password");
        }

        if (request.getPassword().length() < 6) {
            return errorResponse(400, "Password must be at least 6 characters");
        }

        AuthService.SignupResult result = authService.signup(
            request.getNic(),
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(),
            request.getPassword()
        );

        if (!result.success()) {
            return errorResponse(409, result.error());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("userId", result.userId());
        response.put("email", request.getEmail());
        response.put("message", "Registration successful! You can now login with your email and password.");

        return Response.ok(response).build();
    }

    @GET
    @Path("/check-nic/{nic}")
    public Response checkNic(@PathParam("nic") String nic) {
        boolean exists = authService.checkNicExists(nic);

        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);

        return Response.ok(response).build();
    }

    @GET
    @Path("/health")
    public Response health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("application", "TEMCO Finance API (Java EE)");
        return Response.ok(response).build();
    }

    // ==================== CHANGE PASSWORD (Authenticated) ====================
    @POST
    @Path("/change-password")
    public Response changePassword(@HeaderParam("Authorization") String authHeader, Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return errorResponse(401, "Authentication required");
        }

        String token = authHeader.substring(7);
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return errorResponse(400, "Current password and new password are required");
        }

        AuthService.VerifyOtpResult result = authService.changePassword(token, currentPassword, newPassword);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        if (result.success()) {
            response.put("message", "Password changed successfully");
        } else {
            response.put("error", result.error());
        }

        return result.success() ? Response.ok(response).build() : errorResponse(400, result.error());
    }

    // ==================== FORGOT PASSWORD (Request OTP) ====================
    @POST
    @Path("/forgot-password")
    public Response forgotPassword(Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            return errorResponse(400, "Email is required");
        }

        AuthService.OtpResult result = authService.requestPasswordReset(email);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "If the email exists, a password reset code has been sent to " + result.maskedEmail());

        return Response.ok(response).build();
    }

    // ==================== RESET PASSWORD (Verify OTP) ====================
    @POST
    @Path("/reset-password")
    public Response resetPasswordWithOtp(Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return errorResponse(400, "Email, OTP, and new password are required");
        }

        AuthService.VerifyOtpResult result = authService.verifyOtpAndResetPassword(email, otp, newPassword);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        if (result.success()) {
            response.put("message", "Password has been reset successfully");
        } else {
            response.put("error", result.error());
        }

        return result.success() ? Response.ok(response).build() : errorResponse(400, result.error());
    }

    // ==================== REQUEST ACCOUNT UNLOCK ====================
    @POST
    @Path("/request-unlock")
    public Response requestUnlock(Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            return errorResponse(400, "Email is required");
        }

        AuthService.OtpResult result = authService.requestAccountUnlock(email);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        if (result.success()) {
            response.put("message", "Unlock code sent to " + result.maskedEmail());
        } else {
            response.put("error", result.error());
        }

        return result.success() ? Response.ok(response).build() : errorResponse(400, result.error());
    }

    // ==================== VERIFY OTP & UNLOCK ACCOUNT ====================
    @POST
    @Path("/unlock-account")
    public Response unlockAccount(Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return errorResponse(400, "Email and OTP are required");
        }

        AuthService.VerifyOtpResult result = authService.verifyOtpAndUnlockAccount(email, otp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        if (result.success()) {
            response.put("message", "Account unlocked successfully. You can now login.");
        } else {
            response.put("error", result.error());
        }

        return result.success() ? Response.ok(response).build() : errorResponse(400, result.error());
    }

    private Response errorResponse(int status, String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return Response.status(status).entity(error).build();
    }
}
