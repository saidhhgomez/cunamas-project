package com.cunamas.service;

import com.cunamas.dto.AsistenciaCIAIConsultaDTO;
import com.cunamas.dto.RegistroAsistenciaCIAIRequestDTO;
import com.cunamas.dto.RegistroAsistenciaCIAIResponseDTO;

import java.time.LocalDate;

public interface RegistroAsistenciaCIAIService {

    RegistroAsistenciaCIAIResponseDTO registrarAsistencia(
            RegistroAsistenciaCIAIRequestDTO request
    );

    AsistenciaCIAIConsultaDTO obtenerAsistencia(
            Integer idModulo,
            Integer correlativo
    );

    AsistenciaCIAIConsultaDTO obtenerAsistencia(
            Integer idModulo,
            LocalDate fecha,
            Integer correlativo
    );
}