package com.smartcampus.hub.booking.repository;

import com.smartcampus.hub.booking.entity.Booking;
import com.smartcampus.hub.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByStatus(BookingStatus status);

    boolean existsByResourceId(Long resourceId);

    // Half-open interval overlap: a booking ending at 10:00 does not block another starting at 10:00.
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND (:excludeId IS NULL OR b.id <> :excludeId) " +
           "AND b.status = 'APPROVED' " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findApprovedConflictingBookings(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, Long excludeId);

    @Query("""
            SELECT DISTINCT b.bookingDate
            FROM Booking b
            WHERE b.resource.id = :resourceId
              AND b.status = 'APPROVED'
            ORDER BY b.bookingDate ASC
            """)
    List<LocalDate> findAllApprovedBookedDatesByResourceId(Long resourceId);

    @Query("""
            SELECT DISTINCT b.bookingDate
            FROM Booking b
            WHERE b.resource.id = :resourceId
              AND b.status = 'APPROVED'
              AND b.bookingDate >= :fromDate
            ORDER BY b.bookingDate ASC
            """)
    List<LocalDate> findApprovedBookedDatesByResourceId(Long resourceId, LocalDate fromDate);

    List<Booking> findByResourceIdAndBookingDateAndStatusOrderByStartTimeAsc(
            Long resourceId,
            LocalDate bookingDate,
            BookingStatus status
    );
}
