package com.cunamas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class RegistroAsistenciaCIAIRequestDTO {

    @NotNull(message = "El idModulo es obligatorio")
    private Integer idModulo;

    @NotNull(message = "El idUsuarioCreacion es obligatorio")
    private Integer idUsuarioCreacion;

    @NotNull(message = "El registroCorrelativo es obligatorio")
    private Integer registroCorrelativo;

    private List<DetalleAsistenciaDTO> categorias;
}