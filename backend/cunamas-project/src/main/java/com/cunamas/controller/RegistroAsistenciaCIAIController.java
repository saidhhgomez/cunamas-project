package com.cunamas.controller;

import com.cunamas.dto.AsistenciaCIAIConsultaDTO;
import com.cunamas.dto.RegistroAsistenciaCIAIRequestDTO;
import com.cunamas.dto.RegistroAsistenciaCIAIResponseDTO;
import com.cunamas.service.RegistroAsistenciaCIAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("asistencia-ciai")
@RequiredArgsConstructor
public class RegistroAsistenciaCIAIController {

    private final RegistroAsistenciaCIAIService service;

    @PostMapping
    public RegistroAsistenciaCIAIResponseDTO registrarAsistencia(
            @Valid
            @RequestBody
            RegistroAsistenciaCIAIRequestDTO request
    ) {

        return service.registrarAsistencia(
                request
        );
    }

    @GetMapping
    public AsistenciaCIAIConsultaDTO obtenerAsistencia(

            @RequestParam
            Integer idModulo,

            @RequestParam
            LocalDate fecha,

            @RequestParam(
                    required = false
            )
            Integer correlativo
    ) {

        return service.obtenerAsistencia(
                idModulo,
                fecha,
                correlativo
        );
    }
}