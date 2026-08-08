package com.cunamas.service;

import com.cunamas.dto.ReporteAsistenciaDTO;

public interface ReportePdfService {

    byte[] generarPdf(ReporteAsistenciaDTO reporte);

}