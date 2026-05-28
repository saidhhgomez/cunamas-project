package com.cunamas.service;

import com.cunamas.dto.DireccionRequestDTO;
import com.cunamas.dto.DireccionResponseDTO;
import com.cunamas.entity.DireccionEntity;
import com.cunamas.entity.DistritoEntity;
import com.cunamas.repository.DireccionRepository;
import com.cunamas.repository.DistritoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DireccionServiceImpl
        implements DireccionService {

    private final DireccionRepository direccionRepository;

    private final DistritoRepository distritoRepository;

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
}