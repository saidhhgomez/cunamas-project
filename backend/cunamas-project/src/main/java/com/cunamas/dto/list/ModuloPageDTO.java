package com.cunamas.dto.list;

import com.cunamas.dto.query.ModuloListadoDTO;
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