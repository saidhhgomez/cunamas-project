package com.cunamas.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActualizarDetalleAsistenciaCIAIDTO {

    @NotNull(message = "La categoría es obligatoria")
    private Integer idCategoriaGrupo;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 0, message = "La cantidad mínima permitida es 0")
    @Max(value = 99, message = "La cantidad máxima permitida es 99")
    private Integer cantidad;
}