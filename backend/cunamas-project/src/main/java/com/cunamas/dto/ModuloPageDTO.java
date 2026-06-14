package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ModuloPageDTO {

    private List<ModuloListadoDTO> contenido;

    private long totalElementos;

    private int totalPaginas;

    private int paginaActual;
}