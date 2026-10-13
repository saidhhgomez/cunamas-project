package com.cunamas.service.impl;

import com.cunamas.constant.ErrorMessages;
import com.cunamas.constant.SuccessMessages;
import com.cunamas.dto.query.ModuloListadoDTO;
import com.cunamas.dto.list.ModuloPageDTO;
import com.cunamas.dto.request.ModuloRequestDTO;
import com.cunamas.dto.response.ModuloResponseDTO;
import com.cunamas.entity.CentroAtencionInfantilEntity;
import com.cunamas.entity.ModuloEntity;
import com.cunamas.exception.BadRequestException;
import com.cunamas.exception.NotFoundException;
import com.cunamas.repository.CentroAtencionInfantilRepository;
import com.cunamas.repository.ModuloRepository;
import com.cunamas.security.SecurityUtils;
import com.cunamas.service.ModuloService;
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

    private final SecurityUtils securityUtils;

    @Override
    public ModuloResponseDTO registrarModulo(
            ModuloRequestDTO request
    ) {

        String nombreModulo =
                request.getNombreModulo().trim();

        if (nombreModulo.isEmpty()) {

            throw new BadRequestException(
                    ErrorMessages.MODULE_NAME_REQUIRED
            );
        }

        CentroAtencionInfantilEntity local =
                centroAtencionInfantilRepository
                        .findById(request.getIdLocal())
                        .orElseThrow(() ->
                                new NotFoundException(
                                        ErrorMessages.CIAI_NOT_FOUND
                                )
                        );

        ModuloEntity modulo = new ModuloEntity();

        modulo.setNombreModulo(nombreModulo);

        modulo.setLocal(local);

        modulo.setIdUsuarioModificacion(
                securityUtils.getIdPersona()
        );

        ModuloEntity guardado =
                moduloRepository.save(modulo);

        return new ModuloResponseDTO(
                SuccessMessages.MODULE_REGISTERED,
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

            throw new BadRequestException(
                    ErrorMessages.INVALID_LOCAL_ID
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