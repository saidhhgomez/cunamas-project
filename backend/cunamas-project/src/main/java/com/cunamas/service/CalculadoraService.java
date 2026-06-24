package com.cunamas.service;

import com.cunamas.dto.*;
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
            Integer idPreparacion
    );

}