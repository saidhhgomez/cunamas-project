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

    Page<CentroAtencionInfantilEntity>
    findByDireccion_Distrito_NombreDistritoIgnoreCase(
            String nombreDistrito,
            Pageable pageable
    );

    Page<CentroAtencionInfantilEntity>
    findByServicioAlimentario_IdCentroAlimentarioAndDireccion_Distrito_NombreDistritoIgnoreCase(
            Integer idCentroAlimentario,
            String nombreDistrito,
            Pageable pageable
    );
}