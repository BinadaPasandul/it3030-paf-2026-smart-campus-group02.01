package com.smartcampus.hub.resource.repository;

import com.smartcampus.hub.resource.entity.Resource;
import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {
    boolean existsByCode(String code);
    Optional<Resource> findByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);
}