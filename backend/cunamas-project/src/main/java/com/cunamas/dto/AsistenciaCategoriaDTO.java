package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AsistenciaCategoriaDTO {

    private Integer idCategoriaGrupo;

    private String categoria;

    private Integer cantidad;
}