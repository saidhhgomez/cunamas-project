package com.cunamas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ServicioAlimentarioRequestDTO {

    @NotNull(message = "La dirección es obligatoria")
    private Integer idDireccion;

    @NotBlank(message = "El nombre del centro es obligatorio")
    private String nombreCentro;

    private String nombreComite;

    @NotNull(message = "El usuario es obligatorio")
    private Integer idUsuarioModificacion;
}