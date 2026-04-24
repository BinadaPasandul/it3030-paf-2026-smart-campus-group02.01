package com.smartcampus.hub.booking.service;

import com.smartcampus.hub.booking.dto.BookingRequestDTO;
import com.smartcampus.hub.booking.dto.BookingResponseDTO;
import com.smartcampus.hub.booking.dto.BookingReviewDTO;
import com.smartcampus.hub.booking.entity.Booking;
import com.smartcampus.hub.booking.entity.BookingStatus;
import com.smartcampus.hub.booking.repository.BookingRepository;
import com.smartcampus.hub.exception.BookingConflictException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.notification.entity.NotificationType;
import com.smartcampus.hub.notification.service.NotificationService;
import com.smartcampus.hub.resource.dto.ResourceBlockResponse;
import com.smartcampus.hub.resource.entity.Resource;
import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.repository.ResourceRepository;
import com.smartcampus.hub.resource.service.ResourceBlockService;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final ResourceBlockService resourceBlockService;
    // @Lazy prevents circular dependency: NotificationService -> UserRepository <- BookingService
    private NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          UserRepository userRepository,
                          ResourceBlockService resourceBlockService) {
        this.bookingRepository  = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository     = userRepository;
        this.resourceBlockService = resourceBlockService;
    }

    @Autowired
    public void setNotificationService(@Lazy NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request, String userEmail) {
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + request.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalStateException("Resource is not available for booking.");
        }

        LocalTime availableFrom = resource.getAvailableFrom() != null ? resource.getAvailableFrom() : LocalTime.MIN;
        LocalTime availableTo = resource.getAvailableTo() != null ? resource.getAvailableTo() : LocalTime.MAX;

        if (request.getStartTime().isBefore(availableFrom) || 
            request.getEndTime().isAfter(availableTo)) {
            throw new IllegalArgumentException("Booking times must be within the resource's operating hours (" 
                + availableFrom + " to " + availableTo + ").");
        }

        checkConflicts(resource.getId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(), null);
        resourceBlockService.ensureNoBlockConflict(
                resource.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime()
        );


        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUser(user);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        // Notify the user their booking request was received and is pending review
        notificationService.sendNotification(
                user.getId(),
                "Your booking request for \"" + resource.getName() + "\" on " + request.getBookingDate() +
                " has been submitted and is awaiting admin approval.",
                NotificationType.REMINDER_PENDING_BOOKING,
                savedBooking.getId(),
                "BOOKING"
        );


        return mapToDTO(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByUserId(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!booking.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new AccessDeniedException("Not authorized to view this booking");
        }
        
        return mapToDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings(BookingStatus status) {
        List<Booking> bookings = (status != null) ? 
            bookingRepository.findByStatus(status) : 
            bookingRepository.findAll();
            
        return bookings.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponseDTO reviewBooking(Long id, BookingReviewDTO reviewDTO, String adminEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be reviewed");
        }

        if (reviewDTO.getStatus() == BookingStatus.APPROVED) {
            checkConflicts(booking.getResource().getId(), booking.getBookingDate(), 
                          booking.getStartTime(), booking.getEndTime(), booking.getId());
            resourceBlockService.ensureNoBlockConflict(
                    booking.getResource().getId(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime()
            );
        }

        booking.setStatus(reviewDTO.getStatus());
        booking.setAdminReason(reviewDTO.getReason());
        booking.setReviewedBy(admin);

        Booking savedBooking = bookingRepository.save(booking);

        // Notify the booking owner of the admin decision
        Long ownerId    = savedBooking.getUser().getId();
        String resource = savedBooking.getResource().getName();
        String date     = savedBooking.getBookingDate().toString();

        if (reviewDTO.getStatus() == BookingStatus.APPROVED) {
            notificationService.sendNotificationWithPriority(
                    ownerId,
                    "Your booking for \"" + resource + "\" on " + date + " has been APPROVED.",
                    NotificationType.BOOKING_APPROVED,
                    savedBooking.getId(),
                    "BOOKING",
                    "HIGH"
            );
        } else if (reviewDTO.getStatus() == BookingStatus.REJECTED) {
            String reason = (reviewDTO.getReason() != null && !reviewDTO.getReason().isBlank())
                    ? " Reason: " + reviewDTO.getReason()
                    : "";
            notificationService.sendNotificationWithPriority(
                    ownerId,
                    "Your booking for \"" + resource + "\" on " + date + " has been REJECTED." + reason,
                    NotificationType.BOOKING_REJECTED,
                    savedBooking.getId(),
                    "BOOKING",
                    "HIGH"
            );
        }

        return mapToDTO(savedBooking);
    }

    @Transactional
    public BookingResponseDTO cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
                
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
                user.getId(),
                "Your booking for \"" + saved.getResource().getName() + "\" on " + saved.getBookingDate() +
                " has been cancelled.",
                NotificationType.BOOKING_CANCELLED,
                saved.getId(),
                "BOOKING"
        );

        return mapToDTO(saved);
    }

    @Transactional
    public void deleteBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
                
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Not authorized to delete this booking");
        }

        if (booking.getStatus() != BookingStatus.REJECTED && booking.getStatus() != BookingStatus.CANCELLED) {
            throw new IllegalStateException("Only REJECTED or CANCELLED bookings can be deleted");
        }

        bookingRepository.delete(booking);
    }

    private void checkConflicts(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, Long excludeId) {
        List<Booking> conflicts = bookingRepository.findApprovedConflictingBookings(
                resourceId,
                date,
                startTime,
                endTime,
                excludeId
        );
        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            String message = String.format(
                "Cannot complete this request because the resource already has an approved booking on %s from %s to %s.",
                conflict.getBookingDate(),
                conflict.getStartTime().format(formatter),
                conflict.getEndTime().format(formatter)
            );
            throw new BookingConflictException(message);
        }
    }

    private BookingResponseDTO mapToDTO(Booking booking) {
        List<ResourceBlockResponse> blocks = resourceBlockService.getCurrentAndUpcomingBlocks(booking.getResource().getId());
        boolean currentlyBlocked = blocks.stream().anyMatch(ResourceBlockResponse::isActiveNow);
        ResourceStatus effectiveStatus = booking.getResource().getStatus() != ResourceStatus.ACTIVE || currentlyBlocked
                ? ResourceStatus.OUT_OF_SERVICE
                : ResourceStatus.ACTIVE;

        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setResourceId(booking.getResource().getId());
        dto.setResourceName(booking.getResource().getName());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getFullName());
        dto.setBookingDate(booking.getBookingDate());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setPurpose(booking.getPurpose());
        dto.setExpectedAttendees(booking.getExpectedAttendees());
        dto.setStatus(booking.getStatus());
        dto.setAdminReason(booking.getAdminReason());
        dto.setResourceBaseStatus(booking.getResource().getStatus());
        dto.setResourceEffectiveStatus(effectiveStatus);
        dto.setResourcePermanentlyUnavailable(booking.getResource().getStatus() != ResourceStatus.ACTIVE);
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
