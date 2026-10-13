package com.cunamas.service;

import com.cunamas.dto.query.AsistenciaCIAIConsultaDTO;
import com.cunamas.dto.request.RegistroAsistenciaCIAIRequestDTO;
import com.cunamas.dto.response.RegistroAsistenciaCIAIResponseDTO;

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