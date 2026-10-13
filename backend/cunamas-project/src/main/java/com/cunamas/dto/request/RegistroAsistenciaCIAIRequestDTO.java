package com.cunamas.dto.request;

import com.cunamas.dto.response.DetalleAsistenciaDTO;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class RegistroAsistenciaCIAIRequestDTO {

    @NotNull(message = "El idModulo es obligatorio")
    private Integer idModulo;

    @NotNull(message = "El registroCorrelativo es obligatorio")
    private Integer registroCorrelativo;

    private String observacion;

    private List<DetalleAsistenciaDTO> categorias;
}