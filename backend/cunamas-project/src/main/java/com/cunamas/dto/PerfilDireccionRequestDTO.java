package com.cunamas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PerfilDireccionRequestDTO {

    @NotNull(message = "El distrito es obligatorio")
    private Integer idDistrito;

    @NotBlank(message = "La dirección es obligatoria")
    private String nombreDireccion;

}