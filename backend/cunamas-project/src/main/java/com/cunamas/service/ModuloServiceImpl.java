package com.cunamas.service;

import com.cunamas.dto.ModuloListadoDTO;
import com.cunamas.dto.ModuloPageDTO;
import com.cunamas.dto.ModuloRequestDTO;
import com.cunamas.dto.ModuloResponseDTO;
import com.cunamas.entity.CentroAtencionInfantilEntity;
import com.cunamas.entity.ModuloEntity;
import com.cunamas.repository.CentroAtencionInfantilRepository;
import com.cunamas.repository.ModuloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuloServiceImpl implements ModuloService {

    private final ModuloRepository moduloRepository;

    private final CentroAtencionInfantilRepository centroAtencionInfantilRepository;

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
                        .existsByNombreModuloIgnoreCaseAndLocal_IdLocal(
                                nombreModulo,
                                request.getIdLocal()
                        );

        if (existe) {

            throw new RuntimeException(
                    "Ya existe un módulo con ese nombre para este centro"
            );
        }

        CentroAtencionInfantilEntity local =
                centroAtencionInfantilRepository
                        .findById(request.getIdLocal())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Centro de atención infantil no encontrado"
                                )
                        );

        ModuloEntity modulo = new ModuloEntity();

        modulo.setNombreModulo(nombreModulo);

        modulo.setLocal(local);

        modulo.setIdUsuarioModificacion(
                request.getIdUsuario()
        );

        ModuloEntity guardado =
                moduloRepository.save(modulo);

        return new ModuloResponseDTO(
                "Módulo registrado correctamente",
                guardado.getIdModulo()
        );
    }

    @Override
    public ModuloPageDTO obtenerModulosPorLocal(
            Integer idLocal,
            int page,
            int size
    ) {

        if (idLocal == null || idLocal <= 0) {

            throw new RuntimeException(
                    "El idLocal es inválido"
            );
        }

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("nombreModulo")
                );

        Page<ModuloEntity> resultado =
                moduloRepository.findByLocal_IdLocal(
                        idLocal,
                        pageable
                );

        List<ModuloListadoDTO> contenido =
                resultado.getContent()
                        .stream()
                        .map(m ->
                                new ModuloListadoDTO(
                                        m.getIdModulo(),
                                        m.getNombreModulo()
                                )
                        )
                        .toList();

        return new ModuloPageDTO(
                contenido,
                resultado.getTotalElements(),
                resultado.getTotalPages(),
                resultado.getNumber()
        );
    }
}