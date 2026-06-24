package com.cunamas.repository;

import com.cunamas.entity.CentroAtencionInfantilEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CentroAtencionInfantilRepository
        extends JpaRepository<CentroAtencionInfantilEntity, Integer> {

    boolean existsByLocalNombreIgnoreCase(
            String localNombre
    );

    Page<CentroAtencionInfantilEntity>
    findByServicioAlimentario_IdCentroAlimentario(
            Integer idCentroAlimentario,
            Pageable pageable
    );
}