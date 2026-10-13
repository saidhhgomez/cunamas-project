package com.cunamas.service;

import com.cunamas.dto.response.ReporteAsistenciaDTO;

public interface ReportePdfService {

    byte[] generarPdf(ReporteAsistenciaDTO reporte);

}