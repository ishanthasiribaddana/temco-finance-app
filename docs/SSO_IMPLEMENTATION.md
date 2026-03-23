# Super Admin SSO Implementation

## Overview

Single Sign-On (SSO) allows a Super Admin to log in once at `my.temcobank.com` and seamlessly access all 4 applications without re-authenticating.

## Applications

| App | Subdomain | Technology | SSO Status |
|-----|-----------|------------|------------|
| My/Finance | `my.temcobank.com` | React + temco-api | ✅ Sets cookie |
| Finance | `finance.temcobank.com` | React + temco-api | ✅ Uses same backend |
| Lending | `lending.temcobank.com` | JSF (temco-loan-system) | ✅ Validates cookie |
| Admin Panel | `adminpanel.temcobank.com` | JSF (AdminApp) | 📋 Use SSOAuthFilter |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SSO FLOW FOR SUPER ADMIN                            │
└─────────────────────────────────────────────────────────────────────────────┘

  1. LOGIN AT my.temcobank.com
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  User: ishantha@gmail.com                                               │
  │  Password: ********                                                      │
  │  [Login]                                                                 │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       │
                                       ▼
  2. temco-api AUTHENTICATES & SETS COOKIE
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  POST /api/login                                                         │
  │  Response:                                                               │
  │    - token: "abc123xyz..."                                               │
  │    - user: { roleCode: "SUPER_ADMIN" }                                   │
  │                                                                          │
  │  Set-Cookie: auth_token=abc123xyz...;                                    │
  │              Domain=.temcobank.com;                                      │
  │              Path=/; HttpOnly; Secure; Max-Age=86400                     │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       │
                                       ▼
  3. BROWSER STORES COOKIE FOR .temcobank.com
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  Cookie Storage:                                                         │
  │  ┌─────────────────────────────────────────────────────────────────┐    │
  │  │ auth_token = abc123xyz...                                       │    │
  │  │ Domain: .temcobank.com  (applies to ALL subdomains)             │    │
  │  │ Expires: 24 hours                                               │    │
  │  └─────────────────────────────────────────────────────────────────┘    │
  └─────────────────────────────────────────────────────────────────────────┘

  4. USER VISITS lending.temcobank.com
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  Browser automatically sends:                                            │
  │  Cookie: auth_token=abc123xyz...                                         │
  │                                                                          │
  │  temco-loan-system:                                                      │
  │    1. AdminLogin.checkSession() reads cookie                             │
  │    2. Validates token against com_session_token table                    │
  │    3. Checks if user has Super Admin role (id=10)                        │
  │    4. Creates JSF session → User is logged in!                           │
  └─────────────────────────────────────────────────────────────────────────┘
```

## Database Tables

All apps connect to the same `temco_system` database:

```sql
-- Session tokens (created on login)
SELECT * FROM com_session_token 
WHERE token_hash = 'abc123xyz...' 
AND is_active = 1 
AND expires_at > NOW();

-- User with Super Admin role
SELECT ul.*, ur.role_code 
FROM user_login ul
JOIN user_role ur ON ul.user_role_id = ur.id
WHERE ur.id = 10;  -- Super Admin role ID
```

## Code Changes Summary

### 1. temco-api (AuthResource.java)

```java
// Set shared cookie on login
Cookie authCookie = new Cookie("auth_token", token);
authCookie.setDomain(".temcobank.com");  // Shared across subdomains
authCookie.setPath("/");
authCookie.setHttpOnly(true);   // JavaScript can't access
authCookie.setSecure(true);     // HTTPS only
authCookie.setMaxAge(86400);    // 24 hours
response.addCookie(authCookie);
```

### 2. frontend (AuthContext.tsx)

```typescript
// Enable sending cookies with requests
axios.defaults.withCredentials = true;
```

### 3. temco-loan-system (AdminLogin.java)

```java
// Check for SSO cookie in checkSession()
UserLoginGroup ssoUser = validateSSOCookie();
if (ssoUser != null && isSuperAdmin(ssoUser)) {
    externalContext.getSessionMap().put("adminUser", ssoUser);
    return; // Authenticated via SSO
}

// Validate Super Admin role
private boolean isSuperAdmin(UserLoginGroup user) {
    Integer roleId = user.getUserRoleId().getId();
    return roleId != null && roleId.equals(10);
}
```

### 4. AdminApp / Other JSF Apps

Copy `SSOAuthFilter.java` to the application and configure:

```java
@WebFilter(filterName = "SSOAuthFilter", urlPatterns = {"/admin/*"})
public class SSOAuthFilter implements Filter {
    // Validates auth_token cookie
    // Checks Super Admin role
    // Creates session if valid
}
```

## Security Considerations

| Feature | Implementation |
|---------|----------------|
| HttpOnly | Cookie can't be read by JavaScript (XSS protection) |
| Secure | Cookie only sent over HTTPS |
| Domain scoping | Only `.temcobank.com` subdomains receive cookie |
| Token expiry | 24-hour validity, checked on every request |
| Role check | Only Super Admin (role_id=10) can use SSO |
| Database validation | Token validated against `com_session_token` table |

## Testing

1. Log in at `my.temcobank.com` with Super Admin account (ishantha@gmail.com)
2. Open browser DevTools → Application → Cookies
3. Verify `auth_token` cookie exists with domain `.temcobank.com`
4. Navigate to `lending.temcobank.com`
5. Should be automatically logged in without password prompt

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cookie not sent | Check domain is `.temcobank.com` (with leading dot) |
| Cookie blocked | Ensure HTTPS is configured for all subdomains |
| Token invalid | Check `com_session_token.expires_at` hasn't passed |
| Role denied | Verify user has `user_role_id = 10` (Super Admin) |
| CORS errors | Configure backend to allow credentials from subdomains |

## Files Modified

- `temco-api/src/main/java/lk/temco/rest/AuthResource.java`
- `frontend/src/context/AuthContext.tsx`
- `temco-loan-system/src/main/java/lk/exon/temco_loan_system/service/AdminLogin.java`
- `temco-loan-system/src/main/java/lk/exon/temco_loan_system/common/UniDB.java`
- `temco-loan-system/src/main/java/lk/exon/temco_loan_system/common/UniDBLocal.java`
- `temco-loan-system/src/main/java/lk/exon/temco_loan_system/filter/SSOAuthFilter.java` (new)
