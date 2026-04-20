package com.smartcampus.hub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * WebConfig - Configuration for static resource handling and other MVC settings.
 * Maps the /uploads/** URL to the local file system.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        // Use toUri().toString() for robust platform-independent file resource locations
        String resourceLocation = uploadPath.toUri().toString();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);
    }
}
