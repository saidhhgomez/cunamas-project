package com.cunamas.service.impl;

import com.cunamas.constant.ErrorMessages;
import com.cunamas.constant.SuccessMessages;
import com.cunamas.dto.query.ServicioAlimentarioListadoDTO;
import com.cunamas.dto.list.ServicioAlimentarioPageDTO;
import com.cunamas.dto.request.ServicioAlimentarioRequestDTO;
import com.cunamas.dto.response.ServicioAlimentarioResponseDTO;
import com.cunamas.entity.DireccionEntity;
import com.cunamas.entity.ServicioAlimentarioEntity;
import com.cunamas.exception.BadRequestException;
import com.cunamas.exception.ConflictException;
import com.cunamas.exception.NotFoundException;
import com.cunamas.repository.DireccionRepository;
import com.cunamas.repository.ServicioAlimentarioRepository;
import com.cunamas.security.SecurityUtils;
import com.cunamas.service.ServicioAlimentarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioAlimentarioServiceImpl
        implements ServicioAlimentarioService {

    private final ServicioAlimentarioRepository servicioRepository;

    private final DireccionRepository direccionRepository;

    private final SecurityUtils securityUtils;

    private final Clock clock;

    @Override
    public ServicioAlimentarioResponseDTO registrarServicioAlimentario(
            ServicioAlimentarioRequestDTO request
    ) {

        if (request.getNombreCentro() == null
                || request.getNombreCentro().trim().isEmpty()) {

            throw new BadRequestException(
                    ErrorMessages.FOOD_SERVICE_NAME_REQUIRED
            );
        }

        boolean existe =
                servicioRepository.existsByNombreCentroIgnoreCase(
                        request.getNombreCentro().trim()
                );

        if (existe) {

            throw new ConflictException(
                    ErrorMessages.FOOD_SERVICE_ALREADY_EXISTS
            );
        }

        DireccionEntity direccion =
                direccionRepository.findById(
                                request.getIdDireccion()
                        )
                        .orElseThrow(() ->
                                new NotFoundException(
                                        ErrorMessages.ADDRESS_NOT_FOUND
                                )
                        );

        LocalDateTime ahora = LocalDateTime.now(clock);

        ServicioAlimentarioEntity servicio =
                new ServicioAlimentarioEntity();

        servicio.setDireccion(direccion);

        servicio.setNombreCentro(
                request.getNombreCentro().trim()
        );

        servicio.setNombreComite(
                request.getNombreComite()
        );

        servicio.setIdUsuarioModificacion(
                securityUtils.getIdPersona()
        );

        servicio.setFechaCreacion(ahora);
        servicio.setFechaModificacion(ahora);

        ServicioAlimentarioEntity guardado =
                servicioRepository.save(servicio);

        return new ServicioAlimentarioResponseDTO(
                SuccessMessages.FOOD_SERVICE_REGISTERED,
                guardado.getIdCentroAlimentario()
        );
    }

    @Override
    public ServicioAlimentarioPageDTO obtenerServicios(
            String distrito,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("idCentroAlimentario").ascending()
                );

        Page<ServicioAlimentarioEntity> resultado;

        if (distrito == null || distrito.isBlank()) {

            resultado =
                    servicioRepository
                            .findAll(pageable);

        } else {

            resultado =
                    servicioRepository
                            .buscarPorDistrito(
                                    distrito,
                                    pageable
                            );
        }

        List<ServicioAlimentarioListadoDTO> lista =
                resultado.getContent()
                        .stream()
                        .map(sa ->
                                new ServicioAlimentarioListadoDTO(

                                        sa.getIdCentroAlimentario(),

                                        sa.getNombreCentro(),

                                        sa.getNombreComite(),

                                        sa.getDireccion()
                                                .getDistrito()
                                                .getNombreDistrito()

                                                + ", "

                                                + sa.getDireccion()
                                                .getNombreDireccion()
                                )
                        )
                        .toList();

        ServicioAlimentarioPageDTO response =
                new ServicioAlimentarioPageDTO();

        response.setContent(lista);

        response.setTotalElements(
                resultado.getTotalElements()
        );

        response.setTotalPages(
                resultado.getTotalPages()
        );

        response.setCurrentPage(
                resultado.getNumber()
        );

        return response;
    }
}