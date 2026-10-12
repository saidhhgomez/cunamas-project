package com.cunamas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CentroAtencionInfantilRequestDTO {

    @NotNull(message = "El centro alimentario es obligatorio")
    private Integer idCentroAlimentario;

    @NotBlank(message = "La dirección es obligatoria")
    private String nombreDireccion;

    @NotBlank(message = "El nombre del local es obligatorio")
    private String localNombre;

}