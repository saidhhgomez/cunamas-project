package com.cunamas.dto;

import lombok.Data;

@Data
public class CategoriaNinoResponseDTO {
    private Integer idCategoriaNino;
    private String categoria;
    private Integer edadInicioMeses;
    private Integer edadFinMeses;
}