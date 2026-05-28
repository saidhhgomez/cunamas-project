package com.cunamas.repository;

import com.cunamas.entity.ModuloEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuloRepository
        extends JpaRepository<ModuloEntity, Integer> {

    boolean existsByNombreModuloIgnoreCase(String nombreModulo);

}