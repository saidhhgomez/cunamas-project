package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CentroAtencionInfantilListadoDTO {

    private Integer idLocal;

    private String localNombre;

    private String direccion;

    private String servicioAlimentario;
}