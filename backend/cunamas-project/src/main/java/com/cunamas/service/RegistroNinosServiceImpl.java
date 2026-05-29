package com.cunamas.service;

import com.cunamas.dto.*;
import com.cunamas.entity.CategoriaNinoEntity;
import com.cunamas.entity.ModuloEntity;
import com.cunamas.entity.RegistroNinosEntity;
import com.cunamas.repository.CategoriaNinoRepository;
import com.cunamas.repository.ModuloRepository;
import com.cunamas.repository.RegistroNinosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistroNinosServiceImpl
        implements RegistroNinosService {

    private final RegistroNinosRepository registroNinosRepository;

    private final ModuloRepository moduloRepository;

    private final CategoriaNinoRepository categoriaNinoRepository;

    @Override
    public RegistroNinosResponseDTO registrarAsistencia(
            RegistroNinosRequestDTO request
    ) {

        LocalDate fechaActual = LocalDate.now();

        boolean existeRegistro =
                registroNinosRepository
                        .existsByFechaAndModulo_IdModuloAndCategoriaNino_IdCategoriaNino(
                                fechaActual,
                                request.getIdModulo(),
                                request.getIdCategoriaNino()
                        );

        if (existeRegistro) {
            throw new RuntimeException(
                    "Ya existe un registro para esta categoría en el día de hoy"
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

        CategoriaNinoEntity categoria =
                categoriaNinoRepository.findById(
                        request.getIdCategoriaNino()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Categoría no encontrada"
                        )
                );

        RegistroNinosEntity registro =
                new RegistroNinosEntity();

        registro.setModulo(modulo);

        registro.setCategoriaNino(categoria);

        registro.setCantidad(
                request.getCantidad()
        );

        registro.setFecha(fechaActual);

        RegistroNinosEntity registroGuardado =
                registroNinosRepository.save(registro);

        return new RegistroNinosResponseDTO(
                "Registro realizado correctamente",
                registroGuardado.getIdRegistroNinos()
        );
    }

    @Override
    public ActualizarCantidadResponseDTO actualizarCantidad(
            Integer idRegistroNinos,
            ActualizarCantidadRequestDTO request
    ) {

        RegistroNinosEntity registro =
                registroNinosRepository.findById(
                        idRegistroNinos
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Registro no encontrado"
                        )
                );

        Integer cantidadNueva = request.getCantidad();

        if (cantidadNueva < 0) {
            throw new RuntimeException(
                    "La cantidad no puede ser negativa"
            );
        }

        registro.setCantidad(cantidadNueva);

        registroNinosRepository.save(registro);

        return new ActualizarCantidadResponseDTO(
                "Se modificó correctamente la asistencia del día de hoy"
        );
    }

    @Override
    public List<RegistroNinosResumenDTO> obtenerResumen(
            LocalDate fecha,
            Integer idModulo
    ) {

        if (fecha == null) {
            throw new RuntimeException(
                    "La fecha es obligatoria"
            );
        }

        if (idModulo == null || idModulo <= 0) {
            throw new RuntimeException(
                    "El idModulo es inválido"
            );
        }

        return registroNinosRepository
                .obtenerResumenPorFechaYModulo(
                        fecha,
                        idModulo
                );
    }
}