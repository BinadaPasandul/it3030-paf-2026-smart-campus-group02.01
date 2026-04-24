package com.smartcampus.hub.booking.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.smartcampus.hub.booking.dto.BookingResponseDTO;
import com.smartcampus.hub.booking.entity.Booking;
import com.smartcampus.hub.booking.entity.BookingStatus;
import com.smartcampus.hub.booking.repository.BookingRepository;
import com.smartcampus.hub.notification.entity.NotificationType;
import com.smartcampus.hub.notification.service.NotificationService;
import com.smartcampus.hub.resource.entity.Resource;
import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.repository.ResourceRepository;
import com.smartcampus.hub.resource.service.ResourceBlockService;
import com.smartcampus.hub.user.entity.Role;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResourceBlockService resourceBlockService;

    @Mock
    private NotificationService notificationService;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, resourceRepository, userRepository, resourceBlockService);
        bookingService.setNotificationService(notificationService);
        ReflectionTestUtils.setField(bookingService, "checkInGraceMinutes", 15L);
    }

    @Test
    void checkInBookingMarksApprovedBookingAsCheckedIn() {
        User owner = createUser(7L, "user@example.com");
        Booking booking = createApprovedBooking(11L, owner, LocalDateTime.now().minusMinutes(5));

        when(bookingRepository.findById(11L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(owner));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(resourceBlockService.getCurrentAndUpcomingBlocks(booking.getResource().getId())).thenReturn(List.of());

        BookingResponseDTO response = bookingService.checkInBooking(11L, "user@example.com");

        assertEquals(BookingStatus.CHECKED_IN, booking.getStatus());
        assertEquals(BookingStatus.CHECKED_IN, response.getStatus());
        assertNotNull(booking.getCheckedInAt());
        assertNotNull(response.getCheckedInAt());
        verify(bookingRepository).save(booking);
    }

    @Test
    void autoCancelGhostBookingsCancelsOverdueApprovedBookings() {
        User owner = createUser(9L, "ghost@example.com");
        Booking overdueBooking = createApprovedBooking(25L, owner, LocalDateTime.now().minusMinutes(30));

        when(bookingRepository.findApprovedBookingsEligibleForAutoCancellation(any(), any()))
                .thenReturn(List.of(overdueBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.autoCancelGhostBookings();

        assertEquals(BookingStatus.CANCELLED, overdueBooking.getStatus());
        assertTrue(overdueBooking.getAdminReason().contains("Automatically cancelled"));
        verify(notificationService).sendNotificationWithPriority(
                eq(owner.getId()),
                any(String.class),
                eq(NotificationType.BOOKING_CANCELLED),
                eq(overdueBooking.getId()),
                eq("BOOKING"),
                eq("HIGH")
        );
    }

    private Booking createApprovedBooking(Long id, User owner, LocalDateTime startDateTime) {
        Resource resource = new Resource();
        ReflectionTestUtils.setField(resource, "id", 3L);
        resource.setName("Lecture Hall A");
        resource.setStatus(ResourceStatus.ACTIVE);

        Booking booking = new Booking();
        booking.setId(id);
        booking.setUser(owner);
        booking.setResource(resource);
        booking.setBookingDate(startDateTime.toLocalDate());
        booking.setStartTime(startDateTime.toLocalTime().withSecond(0).withNano(0));
        booking.setEndTime(startDateTime.plusHours(1).toLocalTime().withSecond(0).withNano(0));
        booking.setPurpose("Team meeting");
        booking.setExpectedAttendees(8);
        booking.setStatus(BookingStatus.APPROVED);
        return booking;
    }

    private User createUser(Long id, String email) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        user.setEmail(email);
        user.setFullName("Campus User");
        user.setRole(Role.USER);
        return user;
    }
}
