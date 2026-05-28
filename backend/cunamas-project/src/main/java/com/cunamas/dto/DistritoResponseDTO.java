package com.cunamas.dto;

import lombok.Data;

@Data
public class DistritoResponseDTO {

    private Integer idDistrito;

    private String distrito;

    private String provincia;

    private String departamento;

    private Integer ubigeo;
}