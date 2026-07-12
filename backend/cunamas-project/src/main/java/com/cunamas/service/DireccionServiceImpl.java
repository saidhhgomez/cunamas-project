package com.cunamas.service;

import com.cunamas.dto.DireccionRequestDTO;
import com.cunamas.dto.DireccionResponseDTO;
import com.cunamas.dto.PerfilDireccionRequestDTO;
import com.cunamas.dto.PerfilDireccionResponseDTO;
import com.cunamas.entity.DireccionEntity;
import com.cunamas.entity.DistritoEntity;
import com.cunamas.entity.PersonaEntity;
import com.cunamas.repository.DireccionRepository;
import com.cunamas.repository.DistritoRepository;
import com.cunamas.repository.PersonaRepository;
import com.cunamas.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DireccionServiceImpl
        implements DireccionService {

    private final DireccionRepository direccionRepository;

    private final DistritoRepository distritoRepository;

    private final SecurityUtils securityUtils;

    private final PersonaRepository personaRepository;

    @Override
    public DireccionResponseDTO crearDireccion(
            DireccionRequestDTO request
    ) {

        if(request.getNombreDireccion() == null
                || request.getNombreDireccion().trim().isEmpty()) {

            throw new RuntimeException(
                    "Nombre dirección vacío"
            );
        }

        boolean existe = direccionRepository
                .existsByNombreDireccionIgnoreCase(
                        request.getNombreDireccion()
                );

        if(existe) {
            throw new RuntimeException(
                    "Dirección duplicada"
            );
        }

        DistritoEntity distrito = distritoRepository
                .findById(request.getIdDistrito())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Distrito no encontrado"
                        )
                );

        DireccionEntity direccion =
                new DireccionEntity();

        direccion.setNombreDireccion(
                request.getNombreDireccion()
        );

        direccion.setFechaCreacion(
                java.time.LocalDateTime.now()
        );

        direccion.setDistrito(distrito);

        DireccionEntity guardado =
                direccionRepository.save(direccion);

        DireccionResponseDTO response =
                new DireccionResponseDTO();

        response.setIdGenerado(
                guardado.getIdDireccion()
        );

        response.setMensaje(
                "Dirección creada correctamente"
        );

        return response;
    }

    @Transactional
    @Override
    public PerfilDireccionResponseDTO registrarDireccionPerfil(

            PerfilDireccionRequestDTO request

    ) {

        Integer idPersona =
                securityUtils.getIdPersona();

        PersonaEntity persona =

                personaRepository
                        .findById(idPersona)

                        .orElseThrow(() ->

                                new RuntimeException(
                                        "Persona no encontrada."
                                )

                        );

        DistritoEntity distrito =

                distritoRepository
                        .findById(request.getIdDistrito())

                        .orElseThrow(() ->

                                new RuntimeException(
                                        "Distrito no encontrado."
                                )

                        );

        DireccionEntity direccion =
                new DireccionEntity();

        direccion.setNombreDireccion(
                request.getNombreDireccion().trim()
        );

        direccion.setDistrito(distrito);

        LocalDateTime ahora =
                LocalDateTime.now();

        direccion.setFechaCreacion(ahora);

        direccion =
                direccionRepository.save(direccion);

        direccion.setFechaModificacion(ahora);

        persona.setDireccion(direccion);

        persona.setFechaModificacion(ahora);

        persona.setIdUsuarioModificacion(idPersona);

        personaRepository.save(persona);

        persona.setIdUsuarioModificacion(
                idPersona
        );

        persona.setIdUsuarioModificacion(
                idPersona
        );

        return new PerfilDireccionResponseDTO(

                "Dirección registrada correctamente.",

                direccion.getIdDireccion()

        );
    }
}