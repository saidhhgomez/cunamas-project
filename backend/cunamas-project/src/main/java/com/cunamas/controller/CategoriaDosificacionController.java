package com.cunamas.controller;

import com.cunamas.dto.CategoriaDosificacionDTO;
import com.cunamas.service.CategoriaDosificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("categorias-dosificacion")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CategoriaDosificacionController {

    private final CategoriaDosificacionService service;

    @GetMapping
    public List<CategoriaDosificacionDTO> listar() {

        return service.listarCategorias();
    }
}