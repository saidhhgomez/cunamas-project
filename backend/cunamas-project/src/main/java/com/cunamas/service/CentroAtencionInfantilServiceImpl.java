package com.cunamas.service;

import com.cunamas.dto.*;
import com.cunamas.entity.CentroAtencionInfantilEntity;
import com.cunamas.entity.DireccionEntity;
import com.cunamas.entity.ModuloEntity;
import com.cunamas.entity.ServicioAlimentarioEntity;
import com.cunamas.repository.CentroAtencionInfantilRepository;
import com.cunamas.repository.DireccionRepository;
import com.cunamas.repository.ModuloRepository;
import com.cunamas.repository.ServicioAlimentarioRepository;
import com.cunamas.security.SecurityUtils;
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

    private final ModuloRepository moduloRepository;

    private final SecurityUtils securityUtils;

    @Override
    public CentroAtencionInfantilResponseDTO registrar(
            CentroAtencionInfantilRequestDTO request
    ) {

        if (request.getLocalNombre() == null
                || request.getLocalNombre().trim().isEmpty()) {

            throw new RuntimeException(
                    "El nombre del local es obligatorio"
            );
        }

        boolean existe =
                centroRepository
                        .existsByLocalNombreIgnoreCase(
                                request.getLocalNombre().trim()
                        );

        if (existe) {

            throw new RuntimeException(
                    "Ya existe un centro con ese nombre"
            );
        }

        DireccionEntity direccion =
                direccionRepository.findById(
                        request.getIdDireccion()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Dirección no encontrada"
                        )
                );

        ServicioAlimentarioEntity servicio =
                servicioRepository.findById(
                        request.getIdCentroAlimentario()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Servicio alimentario no encontrado"
                        )
                );

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

        LocalDateTime ahora =
                LocalDateTime.now();

        centro.setFechaCreacion(ahora);

        centro.setFechaModificacion(ahora);

        CentroAtencionInfantilEntity guardado =
                centroRepository.save(centro);

        return new CentroAtencionInfantilResponseDTO(
                "Centro de atención infantil registrado correctamente",
                guardado.getIdLocal()
        );
    }

    @Override
    public CentroAtencionInfantilPageDTO listar(
            Integer idCentroAlimentario,
            String distrito,
            int page,
            int size
    ) {

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

                throw new RuntimeException(
                        "El servicio alimentario no existe"
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

            throw new RuntimeException(
                    "El nombre del centro es obligatorio"
            );
        }

        if (request.getModulos() == null
                || request.getModulos().isEmpty()) {

            throw new RuntimeException(
                    "Debe enviar al menos un módulo"
            );
        }

        if (centroRepository.existsByLocalNombreIgnoreCase(
                request.getLocalNombre().trim()
        )) {

            throw new RuntimeException(
                    "Ya existe un centro con ese nombre"
            );
        }

        DireccionEntity direccion =
                direccionRepository.findById(
                        request.getIdDireccion()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Dirección no encontrada"
                        )
                );

        ServicioAlimentarioEntity servicio =
                servicioRepository.findById(
                        request.getIdCentroAlimentario()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Servicio alimentario no encontrado"
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

                throw new RuntimeException(
                        "Existe un módulo vacío"
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
                "Centro de atención infantil y módulos registrados correctamente",
                centroGuardado.getIdLocal(),
                idsModulos
        );
    }
}
