package com.cunamas.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarAsistenciaCIAIRequestDTO {

    @NotNull
    private Integer idModulo;

    @Size(min = 5, max = 5)
    @Valid
    private List<ActualizarDetalleAsistenciaCIAIDTO> categorias;

    private String observacion;
}