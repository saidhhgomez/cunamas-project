package com.cunamas.service;

import com.cunamas.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface RegistroNinosService {

    RegistroNinosResponseDTO registrarAsistencia(
            RegistroNinosRequestDTO request
    );

    ActualizarCantidadResponseDTO actualizarCantidad(
            Integer idRegistroNinos,
            ActualizarCantidadRequestDTO request
    );

    List<RegistroNinosResumenDTO> obtenerResumen(
            LocalDate fecha,
            Integer idModulo
    );
}