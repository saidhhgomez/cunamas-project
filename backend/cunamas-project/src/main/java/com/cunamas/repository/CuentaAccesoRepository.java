package com.cunamas.repository;

import com.cunamas.entity.CuentaAccesoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuentaAccesoRepository
        extends JpaRepository<CuentaAccesoEntity, Integer> {

    boolean existsByCorreoElectronicoIgnoreCase(
            String correoElectronico
    );

}