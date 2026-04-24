package com.smartcampus.hub.resource.repository;

import com.smartcampus.hub.resource.entity.ResourceBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ResourceBlockRepository extends JpaRepository<ResourceBlock, Long> {

    Optional<ResourceBlock> findByIdAndResourceId(Long id, Long resourceId);

    void deleteByResourceId(Long resourceId);

    // Current and future windows stay visible for admins and users; fully elapsed windows drop out.
    @Query("""
            SELECT rb
            FROM ResourceBlock rb
            WHERE rb.resource.id = :resourceId
              AND (
                rb.blockDate > :today
                OR (
                    rb.blockDate = :today
                    AND (rb.allDay = true OR rb.endTime > :nowTime)
                )
              )
            ORDER BY rb.blockDate ASC,
                     CASE WHEN rb.allDay = true THEN 0 ELSE 1 END,
                     rb.startTime ASC
            """)
    List<ResourceBlock> findCurrentAndUpcomingBlocksByResourceId(Long resourceId, LocalDate today, LocalTime nowTime);

    @Query("""
            SELECT rb
            FROM ResourceBlock rb
            WHERE rb.resource.id = :resourceId
              AND rb.blockDate = :date
            ORDER BY CASE WHEN rb.allDay = true THEN 0 ELSE 1 END,
                     rb.startTime ASC
            """)
    List<ResourceBlock> findBlocksByResourceIdAndDate(Long resourceId, LocalDate date);

    // Half-open overlap rule: touching edges is allowed, but any real time intersection is rejected.
    @Query("""
            SELECT rb
            FROM ResourceBlock rb
            WHERE rb.resource.id = :resourceId
              AND rb.blockDate = :date
              AND (
                rb.allDay = true
                OR (rb.startTime < :endTime AND rb.endTime > :startTime)
              )
            ORDER BY CASE WHEN rb.allDay = true THEN 0 ELSE 1 END,
                     rb.startTime ASC
            """)
    List<ResourceBlock> findOverlappingBlocks(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime);
}
