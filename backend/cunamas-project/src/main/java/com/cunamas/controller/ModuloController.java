package com.cunamas.controller;

import com.cunamas.dto.ModuloListadoDTO;
import com.cunamas.dto.ModuloRequestDTO;
import com.cunamas.dto.ModuloResponseDTO;
import com.cunamas.service.ModuloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("modulos")
@RequiredArgsConstructor
public class ModuloController {

    private final ModuloService moduloService;

    @PostMapping
    public ModuloResponseDTO registrarModulo(
            @Valid @RequestBody ModuloRequestDTO request
    ) {
        return moduloService
                .registrarModulo(request);
    }

    @GetMapping
    public List<ModuloListadoDTO> obtenerModulosPorLocal(
            @RequestParam Integer idLocal
    ) {

        return moduloService
                .obtenerModulosPorLocal(idLocal);
    }
}