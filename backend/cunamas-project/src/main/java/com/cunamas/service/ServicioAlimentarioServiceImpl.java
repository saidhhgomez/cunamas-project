package com.cunamas.service;

import com.cunamas.dto.ServicioAlimentarioListadoDTO;
import com.cunamas.dto.ServicioAlimentarioPageDTO;
import com.cunamas.dto.ServicioAlimentarioRequestDTO;
import com.cunamas.dto.ServicioAlimentarioResponseDTO;
import com.cunamas.entity.DireccionEntity;
import com.cunamas.entity.ServicioAlimentarioEntity;
import com.cunamas.repository.DireccionRepository;
import com.cunamas.repository.ServicioAlimentarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioAlimentarioServiceImpl
        implements ServicioAlimentarioService {

    private final ServicioAlimentarioRepository servicioRepository;

    private final DireccionRepository direccionRepository;

    @Override
    public ServicioAlimentarioResponseDTO registrarServicioAlimentario(
            ServicioAlimentarioRequestDTO request
    ) {

        if (request.getNombreCentro() == null
                || request.getNombreCentro().trim().isEmpty()) {

            throw new RuntimeException(
                    "El nombre del centro es obligatorio"
            );
        }

        boolean existe =
                servicioRepository.existsByNombreCentroIgnoreCase(
                        request.getNombreCentro().trim()
                );

        if (existe) {

            throw new RuntimeException(
                    "Ya existe un servicio alimentario con ese nombre"
            );
        }

        DireccionEntity direccion =
                direccionRepository.findById(
                                request.getIdDireccion()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "La dirección no existe"
                                )
                        );

        LocalDateTime ahora = LocalDateTime.now();

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
                request.getIdUsuarioModificacion()
        );

        servicio.setFechaCreacion(ahora);
        servicio.setFechaModificacion(ahora);

        ServicioAlimentarioEntity guardado =
                servicioRepository.save(servicio);

        return new ServicioAlimentarioResponseDTO(
                "Servicio alimentario registrado correctamente",
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