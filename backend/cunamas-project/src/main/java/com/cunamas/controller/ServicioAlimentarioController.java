package com.cunamas.controller;

import com.cunamas.dto.ServicioAlimentarioPageDTO;
import com.cunamas.dto.ServicioAlimentarioRequestDTO;
import com.cunamas.dto.ServicioAlimentarioResponseDTO;
import com.cunamas.service.ServicioAlimentarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("servicios-alimentarios")
@RequiredArgsConstructor
public class ServicioAlimentarioController {

    private final ServicioAlimentarioService servicioService;

    @PostMapping
    public ServicioAlimentarioResponseDTO registrar(
            @Valid
            @RequestBody
            ServicioAlimentarioRequestDTO request
    ) {

        return servicioService
                .registrarServicioAlimentario(request);
    }

    @GetMapping
    public ServicioAlimentarioPageDTO obtenerServicios(

            @RequestParam(
                    required = false
            ) String distrito,

            @RequestParam(
                    defaultValue = "0"
            ) int page,

            @RequestParam(
                    defaultValue = "10"
            ) int size
    ) {

        return servicioService
                .obtenerServicios(
                        distrito,
                        page,
                        size
                );
    }
}