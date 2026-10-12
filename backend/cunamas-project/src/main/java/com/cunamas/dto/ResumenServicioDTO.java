package com.cunamas.dto;

import lombok.Data;

import java.util.List;

@Data
public class ResumenServicioDTO {

    private Integer idServicioAlimentario;

    private String servicioAlimentario;

    private List<LocalResumenDTO> locales;

    private List<TotalesCategoriaDTO> totales;
}