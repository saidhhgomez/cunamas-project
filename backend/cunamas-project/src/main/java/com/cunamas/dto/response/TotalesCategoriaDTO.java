package com.cunamas.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TotalesCategoriaDTO {

    private Integer idCategoriaGrupo;

    private String categoria;

    private Integer cantidad;
}