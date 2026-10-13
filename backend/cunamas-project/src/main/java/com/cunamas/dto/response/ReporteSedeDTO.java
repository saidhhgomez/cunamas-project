package com.cunamas.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ReporteSedeDTO {

    private String nombreSede;

    private List<ReporteAsistenciaFilaDTO> modulos;
}