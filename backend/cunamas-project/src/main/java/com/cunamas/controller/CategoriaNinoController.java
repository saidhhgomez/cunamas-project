package com.cunamas.controller;

import com.cunamas.dto.CategoriaNinoRequestDTO;
import com.cunamas.dto.CategoriaNinoResponseDTO;
import com.cunamas.service.CategoriaNinoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("categoria-nino")
@RequiredArgsConstructor
public class CategoriaNinoController {

    private final CategoriaNinoService categoriaNinoService;

    // GET: http://localhost:8080/categoria-nino
    @GetMapping
    public List<CategoriaNinoResponseDTO> listarTodos() {
        return categoriaNinoService.listarTodos();
    }

    // POST: http://localhost:8080/categoria-nino
    @PostMapping
    public CategoriaNinoResponseDTO guardar(@RequestBody CategoriaNinoRequestDTO requestDTO) {
        return categoriaNinoService.guardar(requestDTO);
    }
}