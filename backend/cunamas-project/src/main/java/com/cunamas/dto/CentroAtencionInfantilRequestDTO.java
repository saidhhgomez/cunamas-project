package com.cunamas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CentroAtencionInfantilRequestDTO {

    @NotNull(message = "La dirección es obligatoria")
    private Integer idDireccion;

    @NotNull(message = "El centro alimentario es obligatorio")
    private Integer idCentroAlimentario;

    @NotBlank(message = "El nombre del local es obligatorio")
    private String localNombre;

    @NotNull(message = "El usuario es obligatorio")
    private Integer idUsuarioModificacion;
}