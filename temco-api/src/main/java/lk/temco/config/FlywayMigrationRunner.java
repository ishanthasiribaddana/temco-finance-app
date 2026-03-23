package lk.temco.config;

import org.flywaydb.core.Flyway;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.sql.DataSource;
import java.util.logging.Level;
import java.util.logging.Logger;

@Singleton
@Startup
public class FlywayMigrationRunner {

    private static final Logger LOGGER = Logger.getLogger(FlywayMigrationRunner.class.getName());

    @Resource(lookup = "java:/TemcoDS")
    private DataSource dataSource;

    @PostConstruct
    @TransactionAttribute(TransactionAttributeType.NOT_SUPPORTED)
    public void runMigrations() {
        LOGGER.info("=== Starting Flyway Database Migrations ===");
        
        try {
            Flyway flyway = Flyway.configure()
                    .dataSource(dataSource)
                    .locations("classpath:db/migration")
                    .baselineOnMigrate(true)
                    .baselineVersion("0")
                    .validateOnMigrate(false)
                    .cleanDisabled(true)
                    .load();

            // Repair first to fix any failed migrations
            flyway.repair();
            
            var result = flyway.migrate();
            
            LOGGER.info("=== Flyway Migration Complete ===");
            LOGGER.info("Migrations applied: " + result.migrationsExecuted);
            LOGGER.info("Current schema version: " + result.targetSchemaVersion);
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Flyway migration failed!", e);
            // Don't throw - allow app to start even if migrations fail
            LOGGER.warning("Continuing despite migration failure...");
        }
        
        // Always run these regardless of migration success
        assignSuperAdminRole();
        setupPermissions();
    }
    
    private void assignSuperAdminRole() {
        LOGGER.info("=== Assigning Super Admin Role ===");
        try (var conn = dataSource.getConnection()) {
            // Ensure Super Admin role exists (id=10, name='Super Admin')
            try (var stmt = conn.prepareStatement(
                "INSERT INTO user_role (id, name) VALUES (10, 'Super Admin') ON DUPLICATE KEY UPDATE name = 'Super Admin'")) {
                int updated = stmt.executeUpdate();
                LOGGER.info("Super Admin role ensured: " + updated + " row(s)");
            }
            
            // Assign Super Admin role to user
            try (var stmt = conn.prepareStatement(
                "UPDATE user_login SET user_role_id = 10 WHERE username = 'ishantha@gmail.com' AND (user_role_id IS NULL OR user_role_id != 10)")) {
                int updated = stmt.executeUpdate();
                LOGGER.info("Super Admin role assignment: " + updated + " row(s) updated");
            }
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to assign Super Admin role", e);
        }
    }
    
    private void setupPermissions() {
        LOGGER.info("=== Setting up Permission Tables ===");
        try (var conn = dataSource.getConnection()) {
            // Check if system_interface table exists and get its columns
            String codeColumn = null;
            String nameColumn = null;
            StringBuilder allCols = new StringBuilder();
            
            try (var rs = conn.getMetaData().getColumns(null, null, "system_interface", null)) {
                while (rs.next()) {
                    String colName = rs.getString("COLUMN_NAME");
                    allCols.append(colName).append(", ");
                    // Check for code column
                    if ("interface_code".equalsIgnoreCase(colName)) codeColumn = "interface_code";
                    else if ("code".equalsIgnoreCase(colName)) codeColumn = "code";
                    else if ("sys_interface_code".equalsIgnoreCase(colName)) codeColumn = "sys_interface_code";
                    
                    // Check for name column
                    if ("interface_name".equalsIgnoreCase(colName)) nameColumn = "interface_name";
                    else if ("name".equalsIgnoreCase(colName)) nameColumn = "name";
                    else if ("sys_interface_name".equalsIgnoreCase(colName)) nameColumn = "sys_interface_name";
                    
                    // Check for display_name
                    if ("display_name".equalsIgnoreCase(colName) && nameColumn == null) nameColumn = "display_name";
                }
            }
            
            // If no code column exists, use interface_name as the identifier
            if (codeColumn == null && nameColumn != null) {
                codeColumn = nameColumn;
                LOGGER.info("No separate code column, using " + nameColumn + " as identifier");
            }
            
            LOGGER.info("system_interface columns found: " + allCols);
            LOGGER.info("Using code column: " + codeColumn + ", name column: " + nameColumn);
            
            if (codeColumn == null) {
                LOGGER.warning("Cannot find code column in system_interface table, checking with direct query...");
                // Try direct query to see column names
                try (var stmt = conn.createStatement();
                     var rs = stmt.executeQuery("SELECT * FROM system_interface LIMIT 1")) {
                    var meta = rs.getMetaData();
                    for (int i = 1; i <= meta.getColumnCount(); i++) {
                        String col = meta.getColumnName(i);
                        LOGGER.info("  Column " + i + ": " + col);
                        if (col.toLowerCase().contains("code")) codeColumn = col;
                        if (col.toLowerCase().contains("name") && nameColumn == null) nameColumn = col;
                    }
                }
            }
            
            if (codeColumn == null) {
                LOGGER.warning("Still cannot find code column, aborting permission setup");
                return;
            }
            
            // Insert User Management interface using detected column name
            Integer interfaceId = null;
            try (var stmt = conn.prepareStatement(
                "SELECT id FROM system_interface WHERE " + codeColumn + " = 'USER_MANAGEMENT'");
                 var rs = stmt.executeQuery()) {
                if (rs.next()) {
                    interfaceId = rs.getInt("id");
                    LOGGER.info("Found existing USER_MANAGEMENT interface with id: " + interfaceId);
                }
            }
            
            // If not found, insert it
            if (interfaceId == null) {
                // Check if we have display_name column for the display name
                String displayCol = null;
                try (var rs = conn.getMetaData().getColumns(null, null, "system_interface", "display_name")) {
                    if (rs.next()) displayCol = "display_name";
                }
                
                String insertSql;
                if (displayCol != null && !codeColumn.equals(displayCol)) {
                    insertSql = "INSERT INTO system_interface (" + codeColumn + ", " + displayCol + ") VALUES ('USER_MANAGEMENT', 'User Management')";
                } else {
                    // Only one column for the identifier
                    insertSql = "INSERT INTO system_interface (" + codeColumn + ") VALUES ('USER_MANAGEMENT')";
                }
                
                try (var stmt = conn.prepareStatement(insertSql)) {
                    stmt.executeUpdate();
                    LOGGER.info("Inserted USER_MANAGEMENT interface with SQL: " + insertSql);
                }
                
                // Get the new ID
                try (var stmt = conn.prepareStatement(
                    "SELECT id FROM system_interface WHERE " + codeColumn + " = 'USER_MANAGEMENT'");
                     var rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        interfaceId = rs.getInt("id");
                    }
                }
            }
            
            if (interfaceId != null) {
                // Grant Super Admin (role_id = 10) full access
                try (var stmt = conn.prepareStatement(
                    "INSERT IGNORE INTO user_role_has_system_interface " +
                    "(user_role_id, system_interface_id, can_view, can_create, can_edit, can_delete, is_active) " +
                    "VALUES (10, ?, TRUE, TRUE, TRUE, TRUE, TRUE)")) {
                    stmt.setInt(1, interfaceId);
                    int rows = stmt.executeUpdate();
                    LOGGER.info("Super Admin permission for USER_MANAGEMENT: " + rows + " row(s) inserted");
                }
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to setup permissions: " + e.getMessage(), e);
        }
    }
}
