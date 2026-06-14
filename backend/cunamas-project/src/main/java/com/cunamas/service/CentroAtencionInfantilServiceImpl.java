package com.cunamas.service;

import com.cunamas.dto.CentroAtencionInfantilListadoDTO;
import com.cunamas.dto.CentroAtencionInfantilPageDTO;
import com.cunamas.dto.CentroAtencionInfantilRequestDTO;
import com.cunamas.dto.CentroAtencionInfantilResponseDTO;
import com.cunamas.entity.CentroAtencionInfantilEntity;
import com.cunamas.entity.DireccionEntity;
import com.cunamas.entity.ServicioAlimentarioEntity;
import com.cunamas.repository.CentroAtencionInfantilRepository;
import com.cunamas.repository.DireccionRepository;
import com.cunamas.repository.ServicioAlimentarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CentroAtencionInfantilServiceImpl implements  CentroAtencionInfantilService {

    private final CentroAtencionInfantilRepository centroRepository;

    private final DireccionRepository direccionRepository;

    private final ServicioAlimentarioRepository servicioRepository;

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
                request.getIdUsuarioModificacion()
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

            resultado =
                    centroRepository
                            .findByServicioAlimentario_IdCentroAlimentario(
                                    idCentroAlimentario,
                                    pageable
                            );

        } else {

            resultado =
                    centroRepository.findAll(
                            pageable
                    );
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
}
