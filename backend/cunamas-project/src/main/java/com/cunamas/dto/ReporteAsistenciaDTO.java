package com.cunamas.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ReporteAsistenciaDTO {

    private String servicioAlimentario;

    private String comite;

    private LocalDate fecha;

    private Integer correlativo;

    private List<ReporteSedeDTO> sedes;

    private String turno;

    private ReporteTotalesDTO totales;
}