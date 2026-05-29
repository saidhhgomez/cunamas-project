package com.cunamas.controller;

import com.cunamas.dto.LocalListadoDTO;
import com.cunamas.dto.LocalRequestDTO;
import com.cunamas.dto.LocalResponseDTO;
import com.cunamas.service.LocalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("locales")
@RequiredArgsConstructor
public class LocalController {

    private final LocalService localService;
    @PostMapping
    public LocalResponseDTO registrarLocal(
            @RequestBody LocalRequestDTO request
    ) {
        return localService.registrarLocal(request);
    }

    @GetMapping
    public List<LocalListadoDTO> obtenerLocales() {

        return localService.obtenerLocales();
    }
}