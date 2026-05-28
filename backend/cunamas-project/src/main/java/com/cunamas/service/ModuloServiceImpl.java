package com.cunamas.service;

import com.cunamas.dto.ModuloRequestDTO;
import com.cunamas.dto.ModuloResponseDTO;
import com.cunamas.entity.LocalEntity;
import com.cunamas.entity.ModuloEntity;
import com.cunamas.repository.LocalRepository;
import com.cunamas.repository.ModuloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModuloServiceImpl implements ModuloService {

    private final ModuloRepository moduloRepository;

    private final LocalRepository localRepository;

    @Override
    public ModuloResponseDTO registrarModulo(
            ModuloRequestDTO request
    ) {

        String nombreModulo =
                request.getNombreModulo().trim();

        if (nombreModulo.isEmpty()) {
            throw new RuntimeException(
                    "El nombre del módulo no puede estar vacío"
            );
        }

        boolean existe =
                moduloRepository
                        .existsByNombreModuloIgnoreCase(
                                nombreModulo
                        );

        if (existe) {
            throw new RuntimeException(
                    "Ya existe un módulo con ese nombre"
            );
        }

        LocalEntity local =
                localRepository.findById(
                        request.getIdLocal()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Local no encontrado"
                        )
                );

        ModuloEntity modulo = new ModuloEntity();

        modulo.setNombreModulo(nombreModulo);

        modulo.setLocal(local);

        ModuloEntity moduloGuardado =
                moduloRepository.save(modulo);

        return new ModuloResponseDTO(
                "Módulo registrado correctamente",
                moduloGuardado.getIdModulo()
        );
    }
}