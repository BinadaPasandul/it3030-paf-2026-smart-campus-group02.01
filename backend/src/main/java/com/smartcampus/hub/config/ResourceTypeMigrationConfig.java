package com.smartcampus.hub.config;

import com.smartcampus.hub.resource.entity.EquipmentType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class ResourceTypeMigrationConfig {

    @Bean
    public CommandLineRunner migrateLegacyEquipmentTypes(JdbcTemplate jdbcTemplate) {
        return args -> {
            jdbcTemplate.execute("""
                    ALTER TABLE resources
                    ALTER COLUMN capacity DROP NOT NULL
                    """);

            for (EquipmentType equipmentType : EquipmentType.values()) {
                jdbcTemplate.update("""
                        UPDATE resources
                        SET type = 'EQUIPMENT', equipment_type = ?
                        WHERE type = ?
                        """, equipmentType.name(), equipmentType.name());
            }
        };
    }
}
