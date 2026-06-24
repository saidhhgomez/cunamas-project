package com.cunamas.controller;

import com.cunamas.dto.ModuloPageDTO;
import com.cunamas.dto.ModuloRequestDTO;
import com.cunamas.dto.ModuloResponseDTO;
import com.cunamas.service.ModuloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("modulos")
@RequiredArgsConstructor
public class ModuloController {

    private final ModuloService moduloService;

    @PostMapping
    public ModuloResponseDTO registrarModulo(
            @Valid
            @RequestBody
            ModuloRequestDTO request
    ) {

        return moduloService
                .registrarModulo(request);
    }

    @GetMapping
    public ModuloPageDTO obtenerModulosPorLocal(

            @RequestParam Integer idLocal,

            @RequestParam(
                    defaultValue = "0"
            ) int page,

            @RequestParam(
                    defaultValue = "10"
            ) int size
    ) {

        return moduloService
                .obtenerModulosPorLocal(
                        idLocal,
                        page,
                        size
                );
    }
}