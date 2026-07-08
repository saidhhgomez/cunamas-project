package com.cunamas.service;

import com.cunamas.entity.DispositivoSesionEntity;
import com.cunamas.entity.PersonaEntity;

import java.util.Optional;

public interface RefreshTokenService {

    DispositivoSesionEntity crearSesion(

            PersonaEntity persona,

            String nombreDispositivo,

            String uuidDispositivo

    );

    DispositivoSesionEntity renovarSesion(

            String refreshToken

    );

    Optional<DispositivoSesionEntity> buscarPorRefreshToken(

            String refreshToken

    );

    void cerrarSesion(

            String refreshToken

    );

    void cerrarTodasLasSesiones(

            Integer idPersona

    );

}