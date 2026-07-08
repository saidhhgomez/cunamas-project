package com.cunamas.repository;

import com.cunamas.entity.DispositivoSesionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DispositivoSesionRepository
        extends JpaRepository<DispositivoSesionEntity,Integer> {

    Optional<DispositivoSesionEntity>
    findByRefreshToken(String refreshToken);

    Optional<DispositivoSesionEntity>
    findByUuidDispositivoAndPersona_IdPersona(
            String uuidDispositivo,
            Integer idPersona
    );

    List<DispositivoSesionEntity>
    findByPersona_IdPersona(Integer idPersona);

}