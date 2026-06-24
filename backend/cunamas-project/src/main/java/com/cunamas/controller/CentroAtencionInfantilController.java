package com.cunamas.controller;

import com.cunamas.dto.*;
import com.cunamas.service.CentroAtencionInfantilService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("centros-atencion-infantil")
@RequiredArgsConstructor
public class CentroAtencionInfantilController {

    private final CentroAtencionInfantilService centroService;

    @PostMapping
    public CentroAtencionInfantilResponseDTO registrar(
            @Valid
            @RequestBody
            CentroAtencionInfantilRequestDTO request
    ) {

        return centroService.registrar(request);
    }

    @GetMapping
    public CentroAtencionInfantilPageDTO listar(

            @RequestParam(
                    required = false
            )
            Integer idCentroAlimentario,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "10"
            )
            int size
    ) {

        return centroService.listar(
                idCentroAlimentario,
                page,
                size
        );
    }

    @PostMapping("/completo")
    public CentroConModulosResponseDTO registrarCompleto(
            @Valid
            @RequestBody
            CentroConModulosRequestDTO request
    ) {

        return centroService
                .registrarCentroConModulos(request);
    }
}