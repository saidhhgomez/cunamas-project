package com.cunamas.controller;

import com.cunamas.dto.TipoCentroResponseDTO;
import com.cunamas.service.TipoCentroService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("tipo-centro")
@RequiredArgsConstructor
public class TipoCentroController {

    private final TipoCentroService tipoCentroService;

    @GetMapping
    public List<TipoCentroResponseDTO> listarTodos() {

        return tipoCentroService.listarTodos();
    }
}