package com.cunamas.controller;

import com.cunamas.dto.LocalRequestDTO;
import com.cunamas.dto.LocalResponseDTO;
import com.cunamas.service.LocalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
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
}