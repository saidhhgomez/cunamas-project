package com.cunamas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistroNinosRequestDTO {

    @NotNull(message = "El idModulo es obligatorio")
    private Integer idModulo;

    @NotNull(message = "El idCategoriaNino es obligatorio")
    private Integer idCategoriaNino;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 0, message = "La cantidad no puede ser negativa")
    private Integer cantidad;
}