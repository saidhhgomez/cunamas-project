package com.cunamas.service.impl;

import com.cunamas.constant.ErrorMessages;
import com.cunamas.constant.SuccessMessages;
import com.cunamas.dto.*;
import com.cunamas.entity.*;
import com.cunamas.exception.BadRequestException;
import com.cunamas.exception.ConflictException;
import com.cunamas.exception.NotFoundException;
import com.cunamas.repository.*;
import com.cunamas.entity.*;
import com.cunamas.repository.*;
import com.cunamas.security.SecurityUtils;
import com.cunamas.service.CentroAtencionInfantilService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CentroAtencionInfantilServiceImpl implements  CentroAtencionInfantilService {

    private final CentroAtencionInfantilRepository centroRepository;

    private final DireccionRepository direccionRepository;

    private final ServicioAlimentarioRepository servicioRepository;

    private final DistritoRepository distritoRepository;

    private final ModuloRepository moduloRepository;

    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public CentroAtencionInfantilResponseDTO registrar(
            CentroAtencionInfantilRequestDTO request
    ) {
        if (request.getNombreDireccion() == null
                || request.getNombreDireccion().trim().isEmpty()) {

            throw new NotFoundException(
                    ErrorMessages.ADDRESS_NOT_FOUND
            );
        }

        boolean existe =
                centroRepository
                        .existsByLocalNombreIgnoreCase(
                                request.getLocalNombre().trim()
                        );

        if (existe) {

            throw new ConflictException(
                    ErrorMessages.CIAI_ALREADY_EXISTS
            );
        }

        ServicioAlimentarioEntity servicio =
                servicioRepository.findById(
                        request.getIdCentroAlimentario()
                ).orElseThrow(() ->
                        new NotFoundException(
                                ErrorMessages.FOOD_SERVICE_NOT_FOUND
                        )
                );

        DistritoEntity distrito =
                servicio
                        .getDireccion()
                        .getDistrito();

        boolean existeDireccion =
                direccionRepository
                        .existsByNombreDireccionIgnoreCaseAndDistrito_IdDistrito(
                                request.getNombreDireccion().trim(),
                                distrito.getIdDistrito()
                        );

        if (existeDireccion) {

            throw new ConflictException(
                    ErrorMessages.DUPLICATE_ADDRESS
            );

        }

        DireccionEntity direccion =
                new DireccionEntity();

        direccion.setNombreDireccion(
                request.getNombreDireccion().trim()
        );

        LocalDateTime ahora =
                LocalDateTime.now();

        direccion.setFechaCreacion(ahora);

        direccion.setFechaModificacion(ahora);

        direccion.setDistrito(distrito);

        DireccionEntity direccionGuardada =
                direccionRepository.save(direccion);

        CentroAtencionInfantilEntity centro =
                new CentroAtencionInfantilEntity();

        centro.setDireccion(direccion);

        centro.setServicioAlimentario(servicio);

        centro.setLocalNombre(
                request.getLocalNombre().trim()
        );

        centro.setIdUsuarioModificacion(
                securityUtils.getIdPersona()
        );

        centro.setFechaCreacion(ahora);

        centro.setFechaModificacion(ahora);

        CentroAtencionInfantilEntity guardado =
                centroRepository.save(centro);

        return new CentroAtencionInfantilResponseDTO(
                SuccessMessages.CIAI_REGISTERED,
                guardado.getIdLocal()
        );
    }

    @Override
    public CentroAtencionInfantilPageDTO listar(
            Integer idCentroAlimentario,
            String distrito,
            String ubigeo,
            int page,
            int size
    ) {

        if (ubigeo != null && !ubigeo.isBlank()) {

            distrito = distritoRepository
                    .findByUbigeo(ubigeo.trim())
                    .orElseThrow(() ->
                            new NotFoundException(
                                    ErrorMessages.UBIGEO_NOT_FOUND
                            )
                    )
                    .getNombreDistrito();

        }

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("idLocal")
                );

        Page<CentroAtencionInfantilEntity> resultado;

        if (idCentroAlimentario != null) {

            boolean existeServicio =
                    servicioRepository.existsById(
                            idCentroAlimentario
                    );

            if (!existeServicio) {

                throw new NotFoundException(
                        ErrorMessages.FOOD_SERVICE_NOT_FOUND
                );
            }

            if (distrito != null && !distrito.isBlank()) {

                resultado =
                        centroRepository
                                .findByServicioAlimentario_IdCentroAlimentarioAndDireccion_Distrito_NombreDistritoIgnoreCase(
                                        idCentroAlimentario,
                                        distrito.trim(),
                                        pageable
                                );

            } else {

                resultado =
                        centroRepository
                                .findByServicioAlimentario_IdCentroAlimentario(
                                        idCentroAlimentario,
                                        pageable
                                );
            }

        } else {

            if (distrito != null && !distrito.isBlank()) {

                resultado =
                        centroRepository
                                .findByDireccion_Distrito_NombreDistritoIgnoreCase(
                                        distrito.trim(),
                                        pageable
                                );

            } else {

                resultado =
                        centroRepository.findAll(
                                pageable
                        );
            }
        }

        List<CentroAtencionInfantilListadoDTO> lista =
                resultado.getContent()
                        .stream()
                        .map(c ->
                                new CentroAtencionInfantilListadoDTO(

                                        c.getIdLocal(),

                                        c.getLocalNombre(),

                                        c.getDireccion()
                                                .getDistrito()
                                                .getNombreDistrito()

                                                + ", "

                                                + c.getDireccion()
                                                .getNombreDireccion(),

                                        c.getServicioAlimentario()
                                                .getNombreCentro()
                                )
                        )
                        .toList();

        CentroAtencionInfantilPageDTO response =
                new CentroAtencionInfantilPageDTO();

        response.setContent(lista);

        response.setCurrentPage(
                resultado.getNumber()
        );

        response.setTotalElements(
                resultado.getTotalElements()
        );

        response.setTotalPages(
                resultado.getTotalPages()
        );

        return response;
    }

    @Override
    @Transactional
    public CentroConModulosResponseDTO registrarCentroConModulos(
            CentroConModulosRequestDTO request
    ) {

        if (request.getLocalNombre() == null
                || request.getLocalNombre().trim().isEmpty()) {

            throw new BadRequestException(
                    ErrorMessages.LOCAL_NAME_REQUIRED
            );
        }

        if (request.getModulos() == null
                || request.getModulos().isEmpty()) {

            throw new BadRequestException(
                    ErrorMessages.MODULES_REQUIRED
            );
        }

        if (centroRepository.existsByLocalNombreIgnoreCase(
                request.getLocalNombre().trim()
        )) {

            throw new ConflictException(
                    ErrorMessages.CIAI_ALREADY_EXISTS
            );
        }

        DireccionEntity direccion =
                direccionRepository.findById(
                        request.getIdDireccion()
                ).orElseThrow(() ->
                        new NotFoundException(
                                ErrorMessages.ADDRESS_NOT_FOUND
                        )
                );

        ServicioAlimentarioEntity servicio =
                servicioRepository.findById(
                        request.getIdCentroAlimentario()
                ).orElseThrow(() ->
                        new NotFoundException(
                                ErrorMessages.FOOD_SERVICE_NOT_FOUND
                        )
                );

        CentroAtencionInfantilEntity centro =
                new CentroAtencionInfantilEntity();

        Integer idUsuario =
                securityUtils.getIdPersona();

        centro.setDireccion(direccion);

        centro.setServicioAlimentario(servicio);

        centro.setLocalNombre(
                request.getLocalNombre().trim()
        );

        centro.setIdUsuarioModificacion(idUsuario);

        centro.setFechaCreacion(
                LocalDateTime.now()
        );

        centro.setFechaModificacion(
                LocalDateTime.now()
        );

        CentroAtencionInfantilEntity centroGuardado =
                centroRepository.save(centro);

        List<Integer> idsModulos =
                new ArrayList<>();

        for (String nombreModulo : request.getModulos()) {

            if (nombreModulo == null
                    || nombreModulo.trim().isEmpty()) {

                throw new BadRequestException(
                        ErrorMessages.EMPTY_MODULE_NAME
                );
            }

            ModuloEntity modulo =
                    new ModuloEntity();

            modulo.setNombreModulo(
                    nombreModulo.trim()
            );

            modulo.setLocal(
                    centroGuardado
            );

            modulo.setIdUsuarioModificacion(idUsuario);

            ModuloEntity moduloGuardado =
                    moduloRepository.save(modulo);

            idsModulos.add(
                    moduloGuardado.getIdModulo()
            );
        }

        return new CentroConModulosResponseDTO(
                SuccessMessages.CIAI_WITH_MODULES_REGISTERED,
                centroGuardado.getIdLocal(),
                idsModulos
        );
    }
}
