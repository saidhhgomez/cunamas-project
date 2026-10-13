package com.cunamas.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ModuloResumenDTO {

    private Integer idModulo;

    private String nombreModulo;

    private List<TotalesCategoriaDTO> asistencia;
}