package com.cunamas.repository;

import com.cunamas.entity.DireccionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DireccionRepository
        extends JpaRepository<DireccionEntity, Integer> {

    boolean existsByNombreDireccionIgnoreCase(String nombreDireccion);

}