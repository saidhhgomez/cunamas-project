package com.cunamas.repository;

import com.cunamas.entity.CuentaAccesoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CuentaAccesoRepository
        extends JpaRepository<CuentaAccesoEntity, Integer> {

    boolean existsByCorreoElectronicoIgnoreCase(
            String correoElectronico
    );

    Optional<CuentaAccesoEntity> findByPersona_IdPersona(
            Integer idPersona
    );

}