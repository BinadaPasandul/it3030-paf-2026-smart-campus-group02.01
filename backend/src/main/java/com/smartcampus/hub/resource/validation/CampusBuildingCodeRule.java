package com.smartcampus.hub.resource.validation;

import java.util.Arrays;
import java.util.Optional;

public enum CampusBuildingCodeRule {
    ENGINEERING_BUILDING("Engineering Building", "EN"),
    BUSINESS_MANAGEMENT_BUILDING("Business Management Building", "BM"),
    NEW_BUILDING("New Building", "G", "F"),
    MAIN_BUILDING("Main Building", "A", "B");

    private static final String SUPPORTED_PREFIXES = "EN, BM, G, F, A, or B";

    private final String buildingName;
    private final String[] prefixes;

    CampusBuildingCodeRule(String buildingName, String... prefixes) {
        this.buildingName = buildingName;
        this.prefixes = prefixes;
    }

    public String getBuildingName() {
        return buildingName;
    }

    public boolean matchesLocation(String location) {
        return normalize(location).equalsIgnoreCase(buildingName);
    }

    public static Optional<CampusBuildingCodeRule> findMatchingRule(String code) {
        String normalizedCode = normalize(code).toUpperCase();

        if (normalizedCode.isEmpty()) {
            return Optional.empty();
        }

        return Arrays.stream(values())
                .filter(rule -> Arrays.stream(rule.prefixes).anyMatch(normalizedCode::startsWith))
                .findFirst();
    }

    public static String getSupportedPrefixes() {
        return SUPPORTED_PREFIXES;
    }

    public static String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
