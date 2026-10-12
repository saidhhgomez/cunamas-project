package com.cunamas.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AsistenciaCategoriaDTO {

    private Integer idCategoriaGrupo;

    private String categoria;

    private Integer cantidad;

    public AsistenciaCategoriaDTO(
            Integer idCategoriaGrupo,
            String categoria,
            Integer cantidad
    ) {
        this.idCategoriaGrupo = idCategoriaGrupo;
        this.categoria = categoria;
        this.cantidad = cantidad;
    }

    public AsistenciaCategoriaDTO(
            Integer idCategoriaGrupo,
            String categoria,
            Long cantidad
    ) {
        this.idCategoriaGrupo = idCategoriaGrupo;
        this.categoria = categoria;
        this.cantidad = cantidad == null ? 0 : cantidad.intValue();
    }
}