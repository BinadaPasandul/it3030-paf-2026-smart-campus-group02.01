package com.smartcampus.hub.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails for the authentication flow.
 * Currently supports email verification codes on registration.
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a 6-digit verification code to the user's email.
     */
    public void sendVerificationEmail(String toEmail, String code, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Smart Campus Hub - Verify Your Email");
        message.setText(
                "Hello " + userName + ",\n\n"
                + "Your email verification code is: " + code + "\n\n"
                + "This code will expire in 15 minutes.\n\n"
                + "If you did not create an account, please ignore this email.\n\n"
                + "-- Smart Campus Operations Hub"
        );
        mailSender.send(message);
    }
}
