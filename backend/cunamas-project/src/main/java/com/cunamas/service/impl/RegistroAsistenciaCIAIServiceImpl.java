package com.cunamas.service.impl;

import com.cunamas.constant.ErrorMessages;
import com.cunamas.constant.SuccessMessages;
import com.cunamas.dto.*;
import com.cunamas.entity.CategoriaDosificacionEntity;
import com.cunamas.entity.ModuloEntity;
import com.cunamas.entity.RegistroAsistenciaCIAIEntity;
import com.cunamas.exception.BadRequestException;
import com.cunamas.exception.ConflictException;
import com.cunamas.exception.NotFoundException;
import com.cunamas.repository.CategoriaDosificacionRepository;
import com.cunamas.repository.ModuloRepository;
import com.cunamas.repository.RegistroAsistenciaCIAIRepository;
import com.cunamas.security.SecurityUtils;
import com.cunamas.service.RegistroAsistenciaCIAIService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistroAsistenciaCIAIServiceImpl
        implements RegistroAsistenciaCIAIService {

    private final RegistroAsistenciaCIAIRepository repository;

    private final ModuloRepository moduloRepository;

    private final CategoriaDosificacionRepository categoriaRepository;

    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public RegistroAsistenciaCIAIResponseDTO registrarAsistencia(
            RegistroAsistenciaCIAIRequestDTO request
    ) {

        LocalDateTime ahora = LocalDateTime.now();

        if (request.getRegistroCorrelativo() != 1
                && request.getRegistroCorrelativo() != 2) {

            throw new BadRequestException(
                    ErrorMessages.INVALID_CORRELATIVO
            );
        }

        if (request.getCategorias() == null
                || request.getCategorias().isEmpty()) {

            throw new BadRequestException(
                    ErrorMessages.CATEGORIES_REQUIRED
            );
        }

        ModuloEntity modulo =
                moduloRepository.findById(
                        request.getIdModulo()
                ).orElseThrow(() ->
                        new NotFoundException(
                                ErrorMessages.MODULE_NOT_FOUND
                        )
                );

        LocalDate hoy = LocalDate.now();

        for (DetalleAsistenciaDTO item :
                request.getCategorias()) {

            CategoriaDosificacionEntity categoria =
                    categoriaRepository.findById(
                            item.getIdCategoriaGrupo()
                    ).orElseThrow(() ->
                            new NotFoundException(
                                    String.format(
                                            ErrorMessages.CATEGORY_NOT_FOUND_ID,
                                            item.getIdCategoriaGrupo()
                                    )
                            )
                    );

            boolean existe =
                    repository
                            .existsByFechaAndModulo_IdModuloAndCategoria_IdCategoriaGrupoAndRegistroCorrelativo(
                                    hoy,
                                    request.getIdModulo(),
                                    item.getIdCategoriaGrupo(),
                                    request.getRegistroCorrelativo()
                            );

            if (existe) {

                throw new ConflictException(
                        String.format(
                                ErrorMessages.ATTENDANCE_ALREADY_EXISTS_FORMAT,
                                categoria.getNombreCategoria(),
                                request.getRegistroCorrelativo()
                        )
                );
            }

            Integer cantidad = item.getCantidad();

            if (cantidad == null) {
                cantidad = 0;
            }

            if (cantidad < 0) {
                throw new BadRequestException(
                        ErrorMessages.QUANTITY_CANNOT_BE_NEGATIVE
                );
            }

            RegistroAsistenciaCIAIEntity registro =
                    new RegistroAsistenciaCIAIEntity();

            registro.setModulo(modulo);

            registro.setCategoria(categoria);

            registro.setRegistroCorrelativo(
                    request.getRegistroCorrelativo()
            );

            registro.setFecha(hoy);

            registro.setCantidad(cantidad);

            registro.setObservacion(
                    request.getObservacion()
            );

            registro.setFechaCreacion(ahora);

            registro.setIdUsuarioCreacion(
                    securityUtils.getIdPersona()
            );

            registro.setIdUsuarioModificacion(
                    securityUtils.getIdPersona()
            );

            repository.save(registro);
        }

        return new RegistroAsistenciaCIAIResponseDTO(
                SuccessMessages.ATTENDANCE_REGISTERED,
                request.getCategorias().size()
        );
    }

    @Override
    public AsistenciaCIAIConsultaDTO obtenerAsistencia(
            Integer idModulo,
            Integer correlativo
    ) {

        if (idModulo == null || idModulo <= 0) {

            throw new BadRequestException(
                    ErrorMessages.INVALID_MODULE_ID
            );
        }

        LocalDate hoy = LocalDate.now();

        AsistenciaCIAIConsultaDTO response =
                new AsistenciaCIAIConsultaDTO();

        response.setIdModulo(idModulo);

        response.setFecha(hoy);

        if (correlativo != null) {

            if (correlativo != 1 && correlativo != 2) {

                throw new BadRequestException(
                        ErrorMessages.INVALID_CORRELATIVO
                );
            }

            List<AsistenciaCategoriaDTO> lista =
                    repository.obtenerAsistencia(
                            idModulo,
                            hoy,
                            correlativo
                    );

            if (correlativo == 1) {

                response.setRegistroManana(lista);

            } else {

                response.setRegistroTarde(lista);
            }

            return response;
        }

        response.setRegistroManana(
                repository.obtenerAsistencia(
                        idModulo,
                        hoy,
                        1
                )
        );

        response.setRegistroTarde(
                repository.obtenerAsistencia(
                        idModulo,
                        hoy,
                        2
                )
        );

        return response;
    }

    @Override
    public AsistenciaCIAIConsultaDTO obtenerAsistencia(
            Integer idModulo,
            LocalDate fecha,
            Integer correlativo
    ) {

        if (idModulo == null || idModulo <= 0) {

            throw new BadRequestException(
                    ErrorMessages.INVALID_MODULE_ID
            );
        }

        if (fecha == null) {

            throw new BadRequestException(
                    ErrorMessages.DATE_REQUIRED
            );
        }

        AsistenciaCIAIConsultaDTO response =
                new AsistenciaCIAIConsultaDTO();

        response.setIdModulo(idModulo);

        response.setFecha(fecha);

        if (correlativo != null) {

            if (correlativo != 1 && correlativo != 2) {

                throw new BadRequestException(
                        ErrorMessages.INVALID_CORRELATIVO
                );
            }

            List<AsistenciaCategoriaDTO> lista =
                    repository.obtenerAsistencia(
                            idModulo,
                            fecha,
                            correlativo
                    );

            if (correlativo == 1) {

                response.setRegistroManana(lista);

            } else {

                response.setRegistroTarde(lista);
            }

            return response;
        }

        response.setRegistroManana(
                repository.obtenerAsistencia(
                        idModulo,
                        fecha,
                        1
                )
        );

        response.setRegistroTarde(
                repository.obtenerAsistencia(
                        idModulo,
                        fecha,
                        2
                )
        );

        return response;
    }
}