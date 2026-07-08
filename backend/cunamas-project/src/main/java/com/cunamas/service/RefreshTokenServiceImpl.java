package com.cunamas.service;

import com.cunamas.entity.DispositivoSesionEntity;
import com.cunamas.entity.PersonaEntity;
import com.cunamas.repository.DispositivoSesionRepository;
import com.cunamas.security.RefreshTokenGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RefreshTokenServiceImpl
        implements RefreshTokenService {

    private static final long DIAS_EXPIRACION = 180;

    @Autowired
    private DispositivoSesionRepository repository;

    @Override
    public DispositivoSesionEntity crearSesion(

            PersonaEntity persona,

            String nombreDispositivo,

            String uuidDispositivo

    ) {

        LocalDateTime ahora = LocalDateTime.now();

        LocalDateTime expiracion =
                ahora.plusDays(DIAS_EXPIRACION);

        String nuevoRefreshToken =
                RefreshTokenGenerator.generar();

        Optional<DispositivoSesionEntity> existente =

                repository.findByUuidDispositivoAndPersona_IdPersona(

                        uuidDispositivo,

                        persona.getIdPersona()

                );

        DispositivoSesionEntity sesion =
                existente.orElse(new DispositivoSesionEntity());

        sesion.setPersona(persona);

        sesion.setNombreDispositivo(nombreDispositivo);

        sesion.setUuidDispositivo(uuidDispositivo);

        sesion.setRefreshToken(nuevoRefreshToken);

        sesion.setActivo(true);

        sesion.setFechaExpiracion(expiracion);

        sesion.setUltimaConexion(ahora);

        if (sesion.getFechaCreacion() == null) {

            sesion.setFechaCreacion(ahora);

        }

        return repository.save(sesion);

    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DispositivoSesionEntity> buscarPorRefreshToken(

            String refreshToken

    ) {

        return repository.findByRefreshToken(refreshToken);

    }

    @Override
    public void cerrarSesion(

            String refreshToken

    ) {

        DispositivoSesionEntity sesion =

                repository

                        .findByRefreshToken(refreshToken)

                        .orElseThrow(() ->

                                new RuntimeException(
                                        "Refresh Token no encontrado."
                                )

                        );

        sesion.setActivo(false);

        repository.save(sesion);

    }

    @Override
    public void cerrarTodasLasSesiones(

            Integer idPersona

    ) {

        List<DispositivoSesionEntity> sesiones =

                repository.findByPersona_IdPersona(
                        idPersona
                );

        for (DispositivoSesionEntity sesion : sesiones) {

            sesion.setActivo(false);

        }

        repository.saveAll(sesiones);

    }

    @Override
    public DispositivoSesionEntity renovarSesion(

            String refreshToken

    ) {

        DispositivoSesionEntity sesion =

                repository

                        .findByRefreshToken(refreshToken)

                        .orElseThrow(() ->

                                new RuntimeException(

                                        "Refresh Token inválido."

                                )

                        );

        if (!Boolean.TRUE.equals(sesion.getActivo())) {

            throw new RuntimeException(

                    "La sesión se encuentra deshabilitada."

            );

        }

        if (sesion.getFechaExpiracion()

                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(

                    "El Refresh Token ha expirado."

            );

        }

        sesion.setRefreshToken(

                RefreshTokenGenerator.generar()

        );

        sesion.setUltimaConexion(

                LocalDateTime.now()

        );

        sesion.setFechaExpiracion(

                LocalDateTime.now().plusDays(DIAS_EXPIRACION)

        );

        return repository.save(sesion);

    }
}
