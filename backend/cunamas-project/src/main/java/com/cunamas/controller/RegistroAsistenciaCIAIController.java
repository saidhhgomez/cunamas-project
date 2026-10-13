package com.cunamas.controller;

import com.cunamas.dto.query.AsistenciaCIAIConsultaDTO;
import com.cunamas.dto.request.RegistroAsistenciaCIAIRequestDTO;
import com.cunamas.dto.response.RegistroAsistenciaCIAIResponseDTO;
import com.cunamas.service.RegistroAsistenciaCIAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("asistencia-ciai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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