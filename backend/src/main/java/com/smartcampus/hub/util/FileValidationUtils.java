package com.smartcampus.hub.util;

import org.springframework.web.multipart.MultipartFile;
import java.util.Arrays;
import java.util.List;

/**
 * FileValidationUtils - Utility class for consistent file validation across the project.
 */
public class FileValidationUtils {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList("image/jpeg", "image/png", "image/jpg");

    /**
     * Validates if the file is a supported image (JPG, JPEG, PNG).
     * @param file The file to validate.
     * @throws IllegalArgumentException if the file type is unsupported or content type is missing.
     */
    public static void validateImage(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file type. Only JPG, JPEG, and PNG images are allowed.");
        }
    }

    /**
     * Validates if the file size is within the allowed limit.
     * @param file The file to validate.
     * @param maxSizeInBytes The maximum allowed size in bytes.
     * @throws IllegalArgumentException if the file exceeds the size limit or is empty.
     */
    public static void validateFileSize(MultipartFile file, long maxSizeInBytes) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty.");
        }
        if (file.getSize() > maxSizeInBytes) {
            double maxSizeInMb = (double) maxSizeInBytes / (1024 * 1024);
            throw new IllegalArgumentException(String.format("File size exceeds the limit of %.1f MB.", maxSizeInMb));
        }
    }
}
