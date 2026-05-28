package com.cunamas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LocalRequestDTO {

    @NotBlank(message = "El nombre del local es obligatorio")
    private String localNombre;

    @NotNull(message = "El idDireccion es obligatorio")
    private Integer idDireccion;

    @NotNull(message = "El idTipoCentro es obligatorio")
    private Integer idTipoCentro;
}