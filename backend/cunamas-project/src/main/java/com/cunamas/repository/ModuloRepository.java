package com.cunamas.repository;

import com.cunamas.entity.ModuloEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuloRepository
        extends JpaRepository<ModuloEntity, Integer> {

    boolean existsByNombreModuloIgnoreCaseAndLocal_IdLocal(
            String nombreModulo,
            Integer idLocal
    );

    Page<ModuloEntity> findByLocal_IdLocal(
            Integer idLocal,
            Pageable pageable
    );
}