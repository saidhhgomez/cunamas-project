package com.cunamas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModuloRequestDTO {

    @NotBlank(message = "El nombre del módulo es obligatorio")
    private String nombreModulo;

    @NotNull(message = "El idLocal es obligatorio")
    private Integer idLocal;

    @NotNull(message = "El idUsuario es obligatorio")
    private Integer idUsuario;
}