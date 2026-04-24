package com.smartcampus.hub.config;

import com.smartcampus.hub.resource.entity.EquipmentType;
import com.smartcampus.hub.resource.entity.ResourceType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Arrays;
import java.util.stream.Collectors;

@Configuration
public class ResourceTypeMigrationConfig {

    @Bean
    public CommandLineRunner migrateLegacyEquipmentTypes(JdbcTemplate jdbcTemplate) {
        return args -> {
            jdbcTemplate.execute("""
                    ALTER TABLE resources
                    ALTER COLUMN capacity DROP NOT NULL
                    """);

            jdbcTemplate.execute("""
                    ALTER TABLE resources
                    DROP CONSTRAINT IF EXISTS resources_type_check
                    """);

            jdbcTemplate.execute("""
                    ALTER TABLE resources
                    DROP CONSTRAINT IF EXISTS resources_equipment_type_check
                    """);

            for (EquipmentType equipmentType : EquipmentType.values()) {
                jdbcTemplate.update("""
                        UPDATE resources
                        SET type = 'EQUIPMENT', equipment_type = ?
                        WHERE type = ?
                        """, equipmentType.name(), equipmentType.name());
            }

            jdbcTemplate.execute("""
                    ALTER TABLE resources
                    ADD CONSTRAINT resources_type_check
                    CHECK (type IN (%s))
                    """.formatted(toSqlValueList(ResourceType.values())));

            jdbcTemplate.execute("""
                    ALTER TABLE resources
                    ADD CONSTRAINT resources_equipment_type_check
                    CHECK (equipment_type IS NULL OR equipment_type IN (%s))
                    """.formatted(toSqlValueList(EquipmentType.values())));
        };
    }

    private String toSqlValueList(Enum<?>[] values) {
        return Arrays.stream(values)
                .map(Enum::name)
                .map(value -> "'" + value + "'")
                .collect(Collectors.joining(", "));
    }
}
