package com.cunamas.controller;

import com.cunamas.dto.DistritoResponseDTO;
import com.cunamas.service.DistritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("distritos")
@RequiredArgsConstructor
public class DistritoController {

    private final DistritoService distritoService;

    @GetMapping
    public List<DistritoResponseDTO> buscarDistritos(
            @RequestParam String search
    ) {
        return distritoService.buscarDistritos(search);
    }
}