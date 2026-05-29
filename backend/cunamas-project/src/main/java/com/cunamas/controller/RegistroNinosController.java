package com.cunamas.controller;

import com.cunamas.dto.*;
import com.cunamas.service.RegistroNinosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("registro-ninos")
@RequiredArgsConstructor
public class RegistroNinosController {

    private final RegistroNinosService registroNinosService;

    @PostMapping
    public RegistroNinosResponseDTO registrarAsistencia(
            @Valid @RequestBody
            RegistroNinosRequestDTO request
    ) {

        return registroNinosService
                .registrarAsistencia(request);
    }

    @PutMapping("/{idRegistroNinos}")
    public ActualizarCantidadResponseDTO actualizarCantidad(
            @PathVariable Integer idRegistroNinos,

            @Valid
            @RequestBody
            ActualizarCantidadRequestDTO request
    ) {

        return registroNinosService.actualizarCantidad(
                idRegistroNinos,
                request
        );
    }

    @GetMapping
    public List<RegistroNinosResumenDTO> obtenerResumen(
            @RequestParam LocalDate fecha,
            @RequestParam Integer idModulo
    ) {

        return registroNinosService
                .obtenerResumen(fecha, idModulo);
    }
}