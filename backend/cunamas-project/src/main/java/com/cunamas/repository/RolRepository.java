package com.cunamas.repository;

import com.cunamas.entity.RolEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository
        extends JpaRepository<RolEntity, Integer> {

}