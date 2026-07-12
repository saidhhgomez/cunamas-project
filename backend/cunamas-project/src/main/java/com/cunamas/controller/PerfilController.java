package com.cunamas.controller;

import com.cunamas.dto.PerfilDireccionRequestDTO;
import com.cunamas.dto.PerfilDireccionResponseDTO;
import com.cunamas.service.DireccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/perfil")
@RequiredArgsConstructor
public class PerfilController {

    private final DireccionService direccionService;

    @PutMapping("/direccion")
    public PerfilDireccionResponseDTO registrarDireccion(
            @Valid
            @RequestBody PerfilDireccionRequestDTO request
    ) {

        return direccionService.registrarDireccionPerfil(
                request
        );

    }
}