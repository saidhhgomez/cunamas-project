package com.cunamas.service.impl;

import com.cunamas.constant.ErrorMessages;
import com.cunamas.entity.DispositivoSesionEntity;
import com.cunamas.entity.PersonaEntity;
import com.cunamas.exception.NotFoundException;
import com.cunamas.exception.UnauthorizedException;
import com.cunamas.repository.DispositivoSesionRepository;
import com.cunamas.security.RefreshTokenGenerator;
import com.cunamas.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RefreshTokenServiceImpl
        implements RefreshTokenService {

    @Value("${jwt.refresh-token.expiration-days:180}")
    private long diasExpiracion;

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
                ahora.plusDays(diasExpiracion);

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

                                new NotFoundException(
                                        ErrorMessages.REFRESH_TOKEN_NOT_FOUND
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
                                new UnauthorizedException(
                                        ErrorMessages.REFRESH_TOKEN_INVALID
                                )
                        );

        if (!Boolean.TRUE.equals(sesion.getActivo())) {
            throw new UnauthorizedException(
                    ErrorMessages.SESSION_DISABLED
            );
        }

        if (sesion.getFechaExpiracion()
                .isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException(
                    ErrorMessages.REFRESH_TOKEN_EXPIRED
            );
        }

        sesion.setRefreshToken(
                RefreshTokenGenerator.generar()
        );

        sesion.setUltimaConexion(
                LocalDateTime.now()
        );

        sesion.setFechaExpiracion(
                LocalDateTime.now().plusDays(diasExpiracion)
        );

        return repository.save(sesion);

    }
}
