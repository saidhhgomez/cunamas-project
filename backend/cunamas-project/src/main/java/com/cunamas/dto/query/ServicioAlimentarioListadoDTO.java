package com.cunamas.dto.query;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ServicioAlimentarioListadoDTO {

    private Integer idCentroAlimentario;

    private String nombreCentro;

    private String nombreComite;

    private String direccion;
}