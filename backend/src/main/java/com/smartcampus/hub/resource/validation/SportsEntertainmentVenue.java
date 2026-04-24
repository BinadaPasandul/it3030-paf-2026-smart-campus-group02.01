package com.smartcampus.hub.resource.validation;

import java.util.Arrays;
import java.util.List;

public enum SportsEntertainmentVenue {
    AUDITORIUM("Auditorium"),
    GROUND("Ground"),
    INDOOR("Indoor"),
    TENNIS_COURT("Tennis Court"),
    VOLLEYBALL_COURT("Volleyball Court"),
    BASKETBALL_COURT("Basketball Court"),
    GATHERING_POINT("Gathering Point"),
    SWIMMING_POOL("Swimming Pool");

    private final String displayName;

    SportsEntertainmentVenue(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static boolean isValidLocation(String value) {
        String normalizedValue = normalize(value);
        return Arrays.stream(values())
                .anyMatch(venue -> venue.displayName.equalsIgnoreCase(normalizedValue));
    }

    public static List<String> getAllowedLocations() {
        return Arrays.stream(values())
                .map(SportsEntertainmentVenue::getDisplayName)
                .toList();
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
