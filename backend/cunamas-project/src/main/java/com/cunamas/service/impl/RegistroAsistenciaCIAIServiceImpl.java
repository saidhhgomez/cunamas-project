package com.cunamas.service.impl;

import com.cunamas.constant.ErrorMessages;
import com.cunamas.constant.SuccessMessages;
import com.cunamas.dto.query.AsistenciaCIAIConsultaDTO;
import com.cunamas.dto.request.RegistroAsistenciaCIAIRequestDTO;
import com.cunamas.dto.response.AsistenciaCategoriaDTO;
import com.cunamas.dto.response.DetalleAsistenciaDTO;
import com.cunamas.dto.response.RegistroAsistenciaCIAIResponseDTO;
import com.cunamas.entity.CategoriaDosificacionEntity;
import com.cunamas.entity.ModuloEntity;
import com.cunamas.entity.RegistroAsistenciaCIAIEntity;
import com.cunamas.exception.BadRequestException;
import com.cunamas.exception.ConflictException;
import com.cunamas.exception.NotFoundException;
import com.cunamas.exception.BusinessException;
import com.cunamas.repository.CategoriaDosificacionRepository;
import com.cunamas.repository.ModuloRepository;
import com.cunamas.repository.RegistroAsistenciaCIAIRepository;
import com.cunamas.security.SecurityUtils;
import com.cunamas.service.RegistroAsistenciaCIAIService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.cunamas.dto.request.ActualizarAsistenciaCIAIRequestDTO;
import com.cunamas.dto.request.ActualizarDetalleAsistenciaCIAIDTO;
import com.cunamas.dto.response.ActualizarAsistenciaCIAIResponseDTO;

import org.springframework.http.HttpStatus;

import java.util.*;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RegistroAsistenciaCIAIServiceImpl
        implements RegistroAsistenciaCIAIService {

    private final RegistroAsistenciaCIAIRepository repository;

    private final ModuloRepository moduloRepository;

    private final CategoriaDosificacionRepository categoriaRepository;

    private final SecurityUtils securityUtils;

    private final Clock clock;

    @Override
    @Transactional
    public RegistroAsistenciaCIAIResponseDTO registrarAsistencia(
            RegistroAsistenciaCIAIRequestDTO request
    ) {

        LocalDateTime ahora = LocalDateTime.now(clock);
        LocalDate hoy = LocalDate.now(clock);

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

        LocalDate hoy = LocalDate.now(clock);

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

    @Override
    @Transactional
    public ActualizarAsistenciaCIAIResponseDTO actualizarAsistencia(
            ActualizarAsistenciaCIAIRequestDTO request
    ) {
        LocalDate hoy = LocalDate.now(clock);
        LocalDateTime ahora = LocalDateTime.now(clock);

        // 1. Validar módulo.
        if (request.getIdModulo() == null || request.getIdModulo() <= 0) {
            throw new BadRequestException(
                    ErrorMessages.INVALID_MODULE_ID
            );
        }

        // 2. La fecha se obtiene internamente usando la zona horaria de Perú.
        // Solo se permite editar la asistencia del día actual.

        // 3. Validar las cinco categorías recibidas.
        if (request.getCategorias() == null
                || request.getCategorias().size() != 5) {
            throw new BadRequestException(
                    ErrorMessages.ATTENDANCE_UPDATE_CATEGORIES_REQUIRED
            );
        }

        Set<Integer> categoriasEsperadas = Set.of(1, 2, 3, 4, 5);
        Set<Integer> categoriasRecibidas = new HashSet<>();

        for (ActualizarDetalleAsistenciaCIAIDTO item :
                request.getCategorias()) {

            if (item == null
                    || item.getIdCategoriaGrupo() == null
                    || item.getCantidad() == null
                    || item.getCantidad() < 0
                    || item.getCantidad() > 99) {
                throw new BadRequestException(
                        ErrorMessages.ATTENDANCE_UPDATE_CATEGORIES_INVALID
                );
            }

            if (!categoriasRecibidas.add(item.getIdCategoriaGrupo())) {
                throw new BadRequestException(
                        ErrorMessages.ATTENDANCE_UPDATE_CATEGORIES_INVALID
                );
            }
        }

        if (!categoriasRecibidas.equals(categoriasEsperadas)) {
            throw new BadRequestException(
                    ErrorMessages.ATTENDANCE_UPDATE_CATEGORIES_INVALID
            );
        }

        // 4. Buscar las filas de asistencia del día actual,
        // únicamente para el correlativo 1, con bloqueo pesimista.
        List<RegistroAsistenciaCIAIEntity> registros =
                repository.buscarRegistrosParaEdicion(
                        request.getIdModulo(),
                        hoy,
                        1
                );

        if (registros.isEmpty()) {
            throw new NotFoundException(
                    ErrorMessages.ATTENDANCE_NOT_FOUND_FOR_UPDATE
            );
        }

        // 5. Verificar que existan exactamente las cinco categorías.
        Set<Integer> categoriasRegistradas = new HashSet<>();

        for (RegistroAsistenciaCIAIEntity registro : registros) {
            if (registro.getCategoria() == null
                    || registro.getCategoria().getIdCategoriaGrupo() == null
                    || !categoriasRegistradas.add(
                    registro.getCategoria().getIdCategoriaGrupo()
            )) {
                throw new BusinessException(
                        ErrorMessages.ATTENDANCE_UPDATE_CATEGORIES_INVALID,
                        HttpStatus.CONFLICT
                );
            }
        }

        if (registros.size() != 5
                || !categoriasRegistradas.equals(categoriasEsperadas)) {
            throw new BusinessException(
                    ErrorMessages.ATTENDANCE_UPDATE_CATEGORIES_INVALID,
                    HttpStatus.CONFLICT
            );
        }

        // 6. Comprobar que todas las filas tengan el mismo contador.
        Integer contador = registros.get(0).getCantidadModificaciones();

        if (contador == null || contador < 0) {
            throw new BusinessException(
                    ErrorMessages.ATTENDANCE_UPDATE_INCONSISTENT_COUNTER,
                    HttpStatus.CONFLICT
            );
        }

        for (RegistroAsistenciaCIAIEntity registro : registros) {
            if (registro.getCantidadModificaciones() == null
                    || !registro.getCantidadModificaciones().equals(contador)) {
                throw new BusinessException(
                        ErrorMessages.ATTENDANCE_UPDATE_INCONSISTENT_COUNTER,
                        HttpStatus.CONFLICT
                );
            }
        }

        // 7. Rechazar una cuarta modificación.
        if (contador >= 3) {
            throw new ConflictException(
                    ErrorMessages.ATTENDANCE_UPDATE_LIMIT_EXCEEDED
            );
        }

        // 8. Indexar las cantidades recibidas por categoría.
        Map<Integer, Integer> cantidades = new HashMap<>();

        for (ActualizarDetalleAsistenciaCIAIDTO item :
                request.getCategorias()) {
            cantidades.put(
                    item.getIdCategoriaGrupo(),
                    item.getCantidad()
            );
        }

        // 9. Actualizar las cinco filas en una misma transacción.
        Integer nuevoContador = contador + 1;
        Integer idUsuario = securityUtils.getIdPersona();

        for (RegistroAsistenciaCIAIEntity registro : registros) {
            Integer idCategoria =
                    registro.getCategoria().getIdCategoriaGrupo();

            registro.setCantidad(cantidades.get(idCategoria));
            registro.setCantidadModificaciones(nuevoContador);
            registro.setFechaModificacion(ahora);
            registro.setIdUsuarioModificacion(idUsuario);
            registro.setObservacion(request.getObservacion());
        }

        repository.saveAll(registros);

        return new ActualizarAsistenciaCIAIResponseDTO(
                SuccessMessages.ATTENDANCE_UPDATED,
                nuevoContador
        );
    }
}