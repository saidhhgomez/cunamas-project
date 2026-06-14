package com.cunamas.service;

import com.cunamas.dto.*;
import com.cunamas.entity.CategoriaDosificacionEntity;
import com.cunamas.entity.ModuloEntity;
import com.cunamas.entity.RegistroAsistenciaCIAIEntity;
import com.cunamas.repository.CategoriaDosificacionRepository;
import com.cunamas.repository.ModuloRepository;
import com.cunamas.repository.RegistroAsistenciaCIAIRepository;
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

    private final CategoriaDosificacionRepository categoriaRepository;;

    @Override
    @Transactional
    public RegistroAsistenciaCIAIResponseDTO registrarAsistencia(
            RegistroAsistenciaCIAIRequestDTO request
    ) {

        LocalDateTime ahora = LocalDateTime.now();

        if (request.getRegistroCorrelativo() != 1
                && request.getRegistroCorrelativo() != 2) {

            throw new RuntimeException(
                    "El registro correlativo solo puede ser 1 o 2"
            );
        }

        if (request.getCategorias() == null
                || request.getCategorias().isEmpty()) {

            throw new RuntimeException(
                    "Debe enviar al menos una categoría"
            );
        }

        ModuloEntity modulo =
                moduloRepository.findById(
                        request.getIdModulo()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Módulo no encontrado"
                        )
                );

        LocalDate hoy = LocalDate.now();

        for (DetalleAsistenciaDTO item :
                request.getCategorias()) {

            CategoriaDosificacionEntity categoria =
                    categoriaRepository.findById(
                            item.getIdCategoriaGrupo()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Categoría no encontrada: "
                                            + item.getIdCategoriaGrupo()
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

                throw new RuntimeException(
                        "Ya existe asistencia para la categoría "
                                + categoria.getNombreCategoria()
                                + " en el correlativo "
                                + request.getRegistroCorrelativo()
                                + " del día de hoy"
                );
            }

            Integer cantidad = item.getCantidad();

            if (cantidad == null) {
                cantidad = 0;
            }

            if (cantidad < 0) {
                throw new RuntimeException(
                        "La cantidad no puede ser negativa"
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

            registro.setFechaCreacion(ahora);

            registro.setFechaModificacion(ahora);

            registro.setIdUsuarioCreacion(
                    request.getIdUsuarioCreacion()
            );

            registro.setIdUsuarioModificacion(
                    request.getIdUsuarioCreacion()
            );

            repository.save(registro);
        }

        return new RegistroAsistenciaCIAIResponseDTO(
                "Asistencia registrada correctamente",
                request.getCategorias().size()
        );
    }

    @Override
    public AsistenciaCIAIConsultaDTO obtenerAsistencia(
            Integer idModulo,
            Integer correlativo
    ) {

        if (idModulo == null || idModulo <= 0) {

            throw new RuntimeException(
                    "El idModulo es inválido"
            );
        }

        LocalDate hoy = LocalDate.now();

        AsistenciaCIAIConsultaDTO response =
                new AsistenciaCIAIConsultaDTO();

        response.setIdModulo(idModulo);

        response.setFecha(hoy);

        if (correlativo != null) {

            if (correlativo != 1 && correlativo != 2) {

                throw new RuntimeException(
                        "El correlativo solo puede ser 1 o 2"
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

            throw new RuntimeException(
                    "El idModulo es inválido"
            );
        }

        if (fecha == null) {

            throw new RuntimeException(
                    "La fecha es obligatoria"
            );
        }

        AsistenciaCIAIConsultaDTO response =
                new AsistenciaCIAIConsultaDTO();

        response.setIdModulo(idModulo);

        response.setFecha(fecha);

        if (correlativo != null) {

            if (correlativo != 1 && correlativo != 2) {

                throw new RuntimeException(
                        "El correlativo solo puede ser 1 o 2"
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