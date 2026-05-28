package com.cunamas.controller;

import com.cunamas.dto.DistritoResponseDTO;
import com.cunamas.service.DistritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("distritos")
@RequiredArgsConstructor
public class DistritoController {

    private final DistritoService distritoService;

    @GetMapping("/{nombreDistrito}")
    public DistritoResponseDTO obtenerDistrito(
            @PathVariable String nombreDistrito
    ) {
        return distritoService.obtenerPorDistrito(nombreDistrito);
    }
}