package com.cunamas.controller;

import com.cunamas.dto.*;
import com.cunamas.service.CalculadoraService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/calculadora")
@RequiredArgsConstructor
public class CalculadoraController {

    private final CalculadoraService calculadoraService;


    @GetMapping("/categorias")
    public List<CategoriaAlimentoDTO> listarCategorias() {

        return calculadoraService.listarCategorias();
    }


    @GetMapping("/preparaciones/{idCategoria}")
    public List<TipoPreparacionDTO> listarPreparaciones(
            @PathVariable Integer idCategoria
    ) {

        return calculadoraService
                .listarPreparacionesPorCategoria(idCategoria);
    }


    @GetMapping("/dosificaciones/{idPreparacion}")
    public List<DosisCategoriaDTO> listarDosificaciones(
            @PathVariable Integer idPreparacion
    ) {

        return calculadoraService
                .listarDosificacion(idPreparacion);
    }


    @PostMapping("/calcular")
    public CalculadoraRespuestaDTO calcular(
            @RequestParam Integer idPreparacion
    ) {

        return calculadoraService
                .calcularTotal(idPreparacion);
    }
}