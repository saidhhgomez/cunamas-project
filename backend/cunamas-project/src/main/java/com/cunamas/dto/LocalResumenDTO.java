package com.cunamas.dto;

import lombok.Data;

import java.util.List;

@Data
public class LocalResumenDTO {

    private Integer idLocal;

    private String nombreLocal;

    private List<ModuloResumenDTO> modulos;
}