package com.cunamas.controller;

import com.cunamas.dto.list.CentroAtencionInfantilPageDTO;
import com.cunamas.dto.request.CentroAtencionInfantilRequestDTO;
import com.cunamas.dto.request.CentroConModulosRequestDTO;
import com.cunamas.dto.response.CentroAtencionInfantilResponseDTO;
import com.cunamas.dto.response.CentroConModulosResponseDTO;
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

            @RequestParam(required = false)
            Integer idCentroAlimentario,

            @RequestParam(required = false)
            String distrito,

            @RequestParam(required = false)
            String ubigeo,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return centroService.listar(
                idCentroAlimentario,
                distrito,
                ubigeo,
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