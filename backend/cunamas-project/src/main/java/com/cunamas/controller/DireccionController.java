package com.cunamas.controller;

import com.cunamas.dto.DireccionRequestDTO;
import com.cunamas.dto.DireccionResponseDTO;
import com.cunamas.service.DireccionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService direccionService;

    @PostMapping
    public DireccionResponseDTO crearDireccion(
            @RequestBody DireccionRequestDTO request
    ) {

        return direccionService
                .crearDireccion(request);
    }
}