# Temco ERP API - Java EE Backend

Java EE application using **EJB**, **JPA**, and **JAX-RS** for WildFly.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Application Server | WildFly 30+ |
| Java Version | 17 |
| EJB | Jakarta EJB 4.0 |
| JPA | Jakarta Persistence 3.1 (Hibernate 6) |
| REST API | Jakarta JAX-RS 3.1 |
| Database | MariaDB |
| Password Hashing | BCrypt |

## Project Structure

```
temco-api/
├── pom.xml
├── src/main/java/lk/temco/
│   ├── entity/           # JPA Entities
│   │   ├── UserLogin.java
│   │   ├── GeneralUserProfile.java
│   │   ├── ComSessionToken.java
│   │   ├── ComLoginAttempt.java
│   │   ├── LoginSession.java
│   │   └── UserRole.java
│   ├── ejb/              # EJB Session Beans
│   │   └── AuthService.java
│   ├── rest/             # JAX-RS REST Endpoints
│   │   ├── JaxRsApplication.java
│   │   ├── AuthResource.java
│   │   └── dto/
│   ├── filter/           # Servlet Filters
│   │   └── CORSFilter.java
│   └── util/             # Utilities
│       ├── PasswordUtil.java
│       └── TokenUtil.java
├── src/main/resources/
│   └── META-INF/
│       └── persistence.xml
└── src/main/webapp/
    └── WEB-INF/
        └── web.xml
```

## Build

```bash
cd temco-api
mvn clean package
```

Output: `target/temco-api.war`

## WildFly Setup

### 1. Install MariaDB Driver

Download `mariadb-java-client-3.3.2.jar` and create module:

```bash
# In WildFly CLI
module add --name=org.mariadb \
  --resources=/path/to/mariadb-java-client-3.3.2.jar \
  --dependencies=javax.api,javax.transaction.api
```

### 2. Configure Datasource

Option A: Use CLI script:
```bash
{WILDFLY_HOME}/bin/jboss-cli.sh --connect --file=wildfly-ds.cli
```

Option B: Edit `standalone.xml` manually using `wildfly-standalone-ds.xml`

### 3. Deploy WAR

```bash
# Copy WAR to deployments
cp target/temco-api.war {WILDFLY_HOME}/standalone/deployments/

# Or use CLI
{WILDFLY_HOME}/bin/jboss-cli.sh --connect --command="deploy target/temco-api.war"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/login | Authenticate user |
| POST | /api/logout | Revoke token |
| GET | /api/me | Get current user |
| POST | /api/signup | Register new user |
| GET | /api/check-nic/{nic} | Check if NIC exists |
| GET | /api/health | Health check |

## Frontend Configuration

Update React frontend to point to WildFly:

```javascript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080/temco-api'
    }
  }
})
```

## Nginx Configuration

See `nginx/temco.conf` for production reverse proxy setup.

## Database Tables Used

- `user_login` - User credentials
- `general_user_profile` - User profile
- `com_session_token` - Session tokens
- `com_login_attempt` - Login audit log
- `login_session` - Session tracking
- `user_role` - User roles
