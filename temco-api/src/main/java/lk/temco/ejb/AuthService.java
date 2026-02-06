package lk.temco.ejb;

import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import lk.temco.entity.*;
import lk.temco.util.OtpUtil;
import lk.temco.util.PasswordUtil;
import lk.temco.util.TokenUtil;

import java.time.LocalDateTime;
import java.util.Optional;

@Stateless
public class AuthService {

    @PersistenceContext(unitName = "temcoPU")
    private EntityManager em;

    public record LoginResult(boolean success, String token, String error, UserLogin user, LocalDateTime expiresAt) {}
    public record SignupResult(boolean success, String error, Integer userId, String tempPassword) {}
    public record OtpResult(boolean success, String error, String maskedEmail) {}
    public record VerifyOtpResult(boolean success, String error) {}

    public LoginResult login(String username, String password, String ipAddress, String userAgent) {
        // Find user with profile and role
        TypedQuery<UserLogin> query = em.createQuery(
            "SELECT u FROM UserLogin u LEFT JOIN FETCH u.userProfile LEFT JOIN FETCH u.userRole WHERE u.username = :username", 
            UserLogin.class
        );
        query.setParameter("username", username);
        
        UserLogin user;
        try {
            user = query.getSingleResult();
        } catch (Exception e) {
            logAttempt(username, ipAddress, userAgent, false, "User not found");
            return new LoginResult(false, null, "Invalid username or password", null, null);
        }

        // Check if active
        if (user.getIsActive() == null || !user.getIsActive()) {
            logAttempt(username, ipAddress, userAgent, false, "User inactive");
            return new LoginResult(false, null, "Account is inactive. Please contact support.", null, null);
        }

        // Check max attempts
        int maxAttempts = user.getMaxLoginAttempt() != null ? user.getMaxLoginAttempt() : 5;
        int currentAttempts = user.getCountAttempt() != null ? user.getCountAttempt() : 0;
        if (currentAttempts >= maxAttempts) {
            logAttempt(username, ipAddress, userAgent, false, "Max attempts exceeded");
            return new LoginResult(false, null, "Account locked. Too many failed attempts.", null, null);
        }

        // Verify password
        if (!PasswordUtil.verifyPassword(password, user.getPassword())) {
            user.setCountAttempt(currentAttempts + 1);
            em.merge(user);
            logAttempt(username, ipAddress, userAgent, false, "Invalid password");
            return new LoginResult(false, null, "Invalid username or password", null, null);
        }

        // Success - generate token
        String token = TokenUtil.generateToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);

        // Create session token
        ComSessionToken sessionToken = new ComSessionToken();
        sessionToken.setUserLoginId(user.getId());
        sessionToken.setTokenHash(token);
        sessionToken.setTokenType(ComSessionToken.TokenType.ACCESS);
        sessionToken.setIssuedAt(LocalDateTime.now());
        sessionToken.setExpiresAt(expiresAt);
        sessionToken.setIpAddress(ipAddress);
        sessionToken.setUserAgent(userAgent);
        sessionToken.setIsActive(true);
        em.persist(sessionToken);

        // Create login session
        LoginSession loginSession = new LoginSession();
        loginSession.setUserLoginId(user.getId());
        loginSession.setStartTime(LocalDateTime.now());
        loginSession.setIp(ipAddress);
        em.persist(loginSession);

        // Update user
        user.setCountAttempt(0);
        user.setLastLoginAt(LocalDateTime.now());
        em.merge(user);

        logAttempt(username, ipAddress, userAgent, true, null);

        return new LoginResult(true, token, null, user, expiresAt);
    }

    public boolean logout(String token) {
        TypedQuery<ComSessionToken> query = em.createQuery(
            "SELECT t FROM ComSessionToken t WHERE t.tokenHash = :token", 
            ComSessionToken.class
        );
        query.setParameter("token", token);

        try {
            ComSessionToken sessionToken = query.getSingleResult();
            sessionToken.setIsActive(false);
            sessionToken.setRevokedAt(LocalDateTime.now());
            em.merge(sessionToken);

            // End login session
            em.createQuery(
                "UPDATE LoginSession s SET s.endTime = :now WHERE s.userLoginId = :userId AND s.endTime IS NULL"
            )
            .setParameter("now", LocalDateTime.now())
            .setParameter("userId", sessionToken.getUserLoginId())
            .executeUpdate();

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Optional<UserLogin> validateToken(String token) {
        TypedQuery<ComSessionToken> query = em.createQuery(
            "SELECT t FROM ComSessionToken t JOIN FETCH t.userLogin u LEFT JOIN FETCH u.userProfile " +
            "WHERE t.tokenHash = :token AND t.isActive = true AND t.expiresAt > :now",
            ComSessionToken.class
        );
        query.setParameter("token", token);
        query.setParameter("now", LocalDateTime.now());

        try {
            ComSessionToken sessionToken = query.getSingleResult();
            return Optional.of(sessionToken.getUserLogin());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<UserLogin> validateTokenFresh(String token) {
        TypedQuery<ComSessionToken> query = em.createQuery(
            "SELECT t FROM ComSessionToken t " +
            "WHERE t.tokenHash = :token AND t.isActive = true AND t.expiresAt > :now",
            ComSessionToken.class
        );
        query.setParameter("token", token);
        query.setParameter("now", LocalDateTime.now());

        try {
            ComSessionToken sessionToken = query.getSingleResult();
            Integer userId = sessionToken.getUserLoginId();
            
            // Fresh query to get user with latest data including role
            UserLogin user = em.createQuery(
                "SELECT u FROM UserLogin u LEFT JOIN FETCH u.userProfile LEFT JOIN FETCH u.userRole WHERE u.id = :id",
                UserLogin.class
            ).setParameter("id", userId).getSingleResult();
            
            return Optional.of(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public SignupResult signup(String nic, String firstName, String lastName, String email, String password) {
        // Check if NIC exists
        Long nicCount = em.createQuery("SELECT COUNT(u) FROM GeneralUserProfile u WHERE u.nic = :nic", Long.class)
            .setParameter("nic", nic)
            .getSingleResult();
        
        if (nicCount > 0) {
            return new SignupResult(false, "A user with this NIC already exists", null, null);
        }

        // Check if email exists
        Long emailCount = em.createQuery("SELECT COUNT(u) FROM UserLogin u WHERE u.username = :email", Long.class)
            .setParameter("email", email)
            .getSingleResult();
        
        if (emailCount > 0) {
            return new SignupResult(false, "This email is already registered", null, null);
        }

        // Use user-provided password or generate temp password
        String userPassword = (password != null && !password.isEmpty()) ? password : PasswordUtil.generateTempPassword();
        String hashedPassword = PasswordUtil.hashPassword(userPassword);
        String fullName = firstName + " " + lastName;

        // Create user profile
        GeneralUserProfile profile = new GeneralUserProfile();
        profile.setNic(nic);
        profile.setFirstName(firstName);
        profile.setLastName(lastName);
        profile.setFullName(fullName);
        profile.setEmail(email);
        profile.setProfileCreatedDate(LocalDateTime.now());
        profile.setIsActive(true);
        profile.setVerificationToken("");
        em.persist(profile);
        em.flush();

        // Create user login
        UserLogin userLogin = new UserLogin();
        userLogin.setUsername(email);
        userLogin.setPassword(hashedPassword);
        userLogin.setIsActive(true);
        userLogin.setGeneralUserProfileId(profile.getId());
        userLogin.setMaxLoginAttempt(5);
        userLogin.setCountAttempt(0);
        userLogin.setUpdatedAt(LocalDateTime.now());
        em.persist(userLogin);

        return new SignupResult(true, null, profile.getId(), null);
    }

    public boolean checkNicExists(String nic) {
        Long count = em.createQuery("SELECT COUNT(u) FROM GeneralUserProfile u WHERE u.nic = :nic", Long.class)
            .setParameter("nic", nic)
            .getSingleResult();
        return count > 0;
    }

    public UserLogin findUserByUsername(String username) {
        try {
            return em.createQuery("SELECT u FROM UserLogin u WHERE u.username = :username", UserLogin.class)
                .setParameter("username", username)
                .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean resetPassword(String username, String newPassword) {
        UserLogin user = findUserByUsername(username);
        if (user == null) {
            return false;
        }
        String hashedPassword = PasswordUtil.hashPassword(newPassword);
        user.setPassword(hashedPassword);
        user.setCountAttempt(0);
        em.merge(user);
        return true;
    }

    // ==================== CHANGE PASSWORD ====================
    public VerifyOtpResult changePassword(String token, String currentPassword, String newPassword) {
        Optional<UserLogin> userOpt = validateToken(token);
        if (userOpt.isEmpty()) {
            return new VerifyOtpResult(false, "Invalid or expired session");
        }

        UserLogin user = userOpt.get();
        
        // Verify current password
        if (!PasswordUtil.verifyPassword(currentPassword, user.getPassword())) {
            return new VerifyOtpResult(false, "Current password is incorrect");
        }

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            return new VerifyOtpResult(false, "New password must be at least 6 characters");
        }

        // Update password
        String hashedPassword = PasswordUtil.hashPassword(newPassword);
        user.setPassword(hashedPassword);
        user.setUpdatedAt(LocalDateTime.now());
        em.merge(user);
        return new VerifyOtpResult(true, null);
    }

    // ==================== FORGOT PASSWORD (Request OTP) ====================
    public OtpResult requestPasswordReset(String email) {
        UserLogin user = findUserByUsername(email);
        if (user == null) {
            // Don't reveal if user exists
            return new OtpResult(true, null, maskEmail(email));
        }

        // Invalidate any existing OTPs
        em.createQuery("UPDATE PasswordResetToken t SET t.isUsed = true WHERE t.userLoginId = :userId AND t.isUsed = false")
            .setParameter("userId", user.getId())
            .executeUpdate();

        // Generate new OTP
        String otp = OtpUtil.generateOtp();
        
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserLoginId(user.getId());
        resetToken.setToken(otp);
        resetToken.setTokenType(PasswordResetToken.TokenType.PASSWORD_RESET);
        resetToken.setCreatedAt(LocalDateTime.now());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15)); // 15 min expiry
        resetToken.setIsUsed(false);
        em.persist(resetToken);

        // TODO: Integrate email service to send OTP
        return new OtpResult(true, null, maskEmail(email));
    }

    // ==================== VERIFY OTP & RESET PASSWORD ====================
    public VerifyOtpResult verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        UserLogin user = findUserByUsername(email);
        if (user == null) {
            return new VerifyOtpResult(false, "Invalid request");
        }

        // Find valid OTP
        try {
            PasswordResetToken token = em.createQuery(
                "SELECT t FROM PasswordResetToken t WHERE t.userLoginId = :userId " +
                "AND t.token = :otp AND t.tokenType = :type AND t.isUsed = false AND t.expiresAt > :now",
                PasswordResetToken.class)
                .setParameter("userId", user.getId())
                .setParameter("otp", otp)
                .setParameter("type", PasswordResetToken.TokenType.PASSWORD_RESET)
                .setParameter("now", LocalDateTime.now())
                .getSingleResult();

            // Mark OTP as used
            token.setIsUsed(true);
            token.setUsedAt(LocalDateTime.now());
            em.merge(token);

            // Reset password
            if (newPassword == null || newPassword.length() < 6) {
                return new VerifyOtpResult(false, "Password must be at least 6 characters");
            }

            String hashedPassword = PasswordUtil.hashPassword(newPassword);
            user.setPassword(hashedPassword);
            user.setCountAttempt(0); // Reset failed attempts
            user.setUpdatedAt(LocalDateTime.now());
            em.merge(user);
            return new VerifyOtpResult(true, null);

        } catch (Exception e) {
            return new VerifyOtpResult(false, "Invalid or expired OTP");
        }
    }

    // ==================== REQUEST ACCOUNT UNLOCK ====================
    public OtpResult requestAccountUnlock(String email) {
        UserLogin user = findUserByUsername(email);
        if (user == null) {
            return new OtpResult(false, "Account not found", null);
        }

        int maxAttempts = user.getMaxLoginAttempt() != null ? user.getMaxLoginAttempt() : 5;
        int currentAttempts = user.getCountAttempt() != null ? user.getCountAttempt() : 0;

        if (currentAttempts < maxAttempts) {
            return new OtpResult(false, "Account is not locked", null);
        }

        // Invalidate any existing unlock OTPs
        em.createQuery("UPDATE PasswordResetToken t SET t.isUsed = true WHERE t.userLoginId = :userId AND t.tokenType = :type AND t.isUsed = false")
            .setParameter("userId", user.getId())
            .setParameter("type", PasswordResetToken.TokenType.ACCOUNT_UNLOCK)
            .executeUpdate();

        // Generate OTP
        String otp = OtpUtil.generateOtp();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserLoginId(user.getId());
        resetToken.setToken(otp);
        resetToken.setTokenType(PasswordResetToken.TokenType.ACCOUNT_UNLOCK);
        resetToken.setCreatedAt(LocalDateTime.now());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        resetToken.setIsUsed(false);
        em.persist(resetToken);

        // TODO: Integrate email service to send OTP
        return new OtpResult(true, null, maskEmail(email));
    }

    // ==================== VERIFY OTP & UNLOCK ACCOUNT ====================
    public VerifyOtpResult verifyOtpAndUnlockAccount(String email, String otp) {
        UserLogin user = findUserByUsername(email);
        if (user == null) {
            return new VerifyOtpResult(false, "Account not found");
        }

        try {
            PasswordResetToken token = em.createQuery(
                "SELECT t FROM PasswordResetToken t WHERE t.userLoginId = :userId " +
                "AND t.token = :otp AND t.tokenType = :type AND t.isUsed = false AND t.expiresAt > :now",
                PasswordResetToken.class)
                .setParameter("userId", user.getId())
                .setParameter("otp", otp)
                .setParameter("type", PasswordResetToken.TokenType.ACCOUNT_UNLOCK)
                .setParameter("now", LocalDateTime.now())
                .getSingleResult();

            // Mark OTP as used
            token.setIsUsed(true);
            token.setUsedAt(LocalDateTime.now());
            em.merge(token);

            // Unlock account
            user.setCountAttempt(0);
            user.setUpdatedAt(LocalDateTime.now());
            em.merge(user);
            return new VerifyOtpResult(true, null);

        } catch (Exception e) {
            return new VerifyOtpResult(false, "Invalid or expired OTP");
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 2) {
            return local.charAt(0) + "***@" + domain;
        }
        return local.substring(0, 2) + "***@" + domain;
    }

    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void logAttempt(String username, String ipAddress, String userAgent, boolean success, String reason) {
        try {
            ComLoginAttempt attempt = new ComLoginAttempt();
            attempt.setUsername(username);
            attempt.setIpAddress(ipAddress);
            attempt.setUserAgent(userAgent);
            attempt.setAttemptTime(LocalDateTime.now());
            attempt.setSuccess(success);
            attempt.setFailureReason(reason);
            em.persist(attempt);
        } catch (Exception e) {
            // Log attempt failure should not break login flow
            System.err.println("Failed to log login attempt: " + e.getMessage());
        }
    }
}
