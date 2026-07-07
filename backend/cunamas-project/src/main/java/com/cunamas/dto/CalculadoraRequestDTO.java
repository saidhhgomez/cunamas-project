package com.cunamas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CalculadoraRequestDTO {

    @Valid
    @NotEmpty(message = "Debe enviar al menos una categoría")
    private List<DetalleAsistenciaDTO> categorias;

}