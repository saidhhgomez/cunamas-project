package com.cunamas.repository;

import com.cunamas.entity.LocalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocalRepository
        extends JpaRepository<LocalEntity, Integer> {

    boolean existsByLocalNombreIgnoreCase(String localNombre);
}