package com.cunamas.service;

import com.cunamas.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface CalculadoraService {


    List<CategoriaAlimentoDTO> listarCategorias();


    List<TipoPreparacionDTO> listarPreparacionesPorCategoria(
            Integer idCategoria
    );


    List<DosisCategoriaDTO> listarDosificacion(
            Integer idPreparacion
    );


    CalculadoraRespuestaDTO calcularTotal(
            Integer idPreparacion,
            CalculadoraRequestDTO request
    );

    ResumenServicioDTO obtenerResumenServicio(
            Integer idServicio,
            LocalDate fecha,
            Integer correlativo
    );

}