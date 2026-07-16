package com.cunamas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IAAlimentoDTO {

    @NotBlank(message = "El nombre del alimento es obligatorio.")
    private String nombre;

    @Valid
    @NotNull(message = "Las cantidades por categoría son obligatorias.")
    private IACategoriaDTO categoriaEtaria;

    @Valid
    @NotNull(message = "Las presentaciones son obligatorias.")
    private IAPresentacionDTO presentacion;

}