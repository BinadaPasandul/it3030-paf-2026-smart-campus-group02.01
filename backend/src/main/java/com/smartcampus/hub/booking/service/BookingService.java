package com.smartcampus.hub.booking.service;

import com.smartcampus.hub.booking.dto.BookingRequestDTO;
import com.smartcampus.hub.booking.dto.BookingResponseDTO;
import com.smartcampus.hub.booking.dto.BookingReviewDTO;
import com.smartcampus.hub.booking.entity.Booking;
import com.smartcampus.hub.booking.entity.BookingStatus;
import com.smartcampus.hub.booking.repository.BookingRepository;
import com.smartcampus.hub.exception.BookingConflictException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.resource.entity.Resource;
import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.repository.ResourceRepository;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, ResourceRepository resourceRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
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

        checkConflicts(resource.getId(), request.getBookingDate(), request.getStartTime(), request.getEndTime());

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
                          booking.getStartTime(), booking.getEndTime());
        }

        booking.setStatus(reviewDTO.getStatus());
        booking.setAdminReason(reviewDTO.getReason());
        booking.setReviewedBy(admin);

        return mapToDTO(bookingRepository.save(booking));
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
        return mapToDTO(bookingRepository.save(booking));
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

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be deleted");
        }

        bookingRepository.delete(booking);
    }

    private void checkConflicts(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, date, startTime, endTime);
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("The resource is already booked during this time range.");
        }
    }

    private BookingResponseDTO mapToDTO(Booking booking) {
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
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
