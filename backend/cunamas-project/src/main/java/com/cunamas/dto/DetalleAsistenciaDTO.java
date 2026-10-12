package com.cunamas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DetalleAsistenciaDTO {

    @NotNull(message = "La categoría es obligatoria")
    private Integer idCategoriaGrupo;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 0, message = "Solo se permiten números mayores o iguales a 0")
    private Integer cantidad;
}