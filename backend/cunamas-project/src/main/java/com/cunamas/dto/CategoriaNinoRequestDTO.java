package com.cunamas.dto;

import lombok.Data;

@Data
public class CategoriaNinoRequestDTO {
    private String categoria;
    private Integer edadInicioMeses;
    private Integer edadFinMeses;
}