package lk.temco.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    private static final int BCRYPT_ROUNDS = 10;

    public static String hashPassword(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(BCRYPT_ROUNDS));
    }

    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        try {
            return BCrypt.checkpw(plainPassword, hashedPassword);
        } catch (IllegalArgumentException e) {
            // Fallback for legacy non-hashed passwords
            return plainPassword.equals(hashedPassword);
        }
    }

    public static String generateTempPassword() {
        return Long.toHexString(Double.doubleToLongBits(Math.random()))
                .substring(0, 6).toUpperCase();
    }
}
