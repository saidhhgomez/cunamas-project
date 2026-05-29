package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LocalListadoDTO {

    private Integer idLocal;

    private String direccion;

    private String tipoCentro;
}