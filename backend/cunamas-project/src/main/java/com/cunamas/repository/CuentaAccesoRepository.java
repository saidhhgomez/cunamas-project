package com.cunamas.repository;

import com.cunamas.entity.CuentaAccesoEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CuentaAccesoRepository
        extends JpaRepository<CuentaAccesoEntity, Integer> {

    boolean existsByCorreoElectronicoIgnoreCase(
            String correoElectronico
    );

    Optional<CuentaAccesoEntity> findByPersona_IdPersona(
            Integer idPersona
    );

    List<CuentaAccesoEntity> findByEstadoCuentaFalseOrderByFechaCreacionDesc();

    @EntityGraph(attributePaths = {
            "persona",
            "persona.genero",
            "persona.documento",
            "persona.direccion",
            "persona.direccion.distrito"
    })
    List<CuentaAccesoEntity>
    findAllByEstadoCuentaFalseOrderByFechaCreacionDesc();

    @EntityGraph(attributePaths = {
            "persona",
            "persona.genero",
            "persona.documento",
            "persona.direccion",
            "persona.direccion.distrito"
    })
    Optional<CuentaAccesoEntity>
    findWithPersonaByPersona_IdPersona(
            Integer idPersona
    );

}