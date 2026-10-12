package com.cunamas.controller;

import com.cunamas.dto.*;
import com.cunamas.service.CalculadoraService;
import com.cunamas.service.ReportePdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/calculadora")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CalculadoraController {

    private final CalculadoraService calculadoraService;
    private final ReportePdfService reportePdfService;

    @GetMapping("/categorias")
    public List<CategoriaAlimentoDTO> listarCategorias() {

        return calculadoraService.listarCategorias();
    }


    @GetMapping("/preparaciones/{idCategoria}")
    public List<TipoPreparacionDTO> listarPreparaciones(
            @PathVariable Integer idCategoria
    ) {

        return calculadoraService
                .listarPreparacionesPorCategoria(idCategoria);
    }


    @GetMapping("/dosificaciones/{idPreparacion}")
    public List<DosisCategoriaDTO> listarDosificaciones(
            @PathVariable Integer idPreparacion
    ) {

        return calculadoraService
                .listarDosificacion(idPreparacion);
    }


    @PostMapping("/calcular")
    public CalculadoraRespuestaDTO calcular(

            @RequestParam Integer idPreparacion,
            @Valid
            @RequestBody
            CalculadoraRequestDTO request
    ) {

        return calculadoraService.calcularTotal(
                idPreparacion,
                request
        );
    }

    @GetMapping("/resumen-servicio/{idServicio}")
    public ResumenServicioDTO obtenerResumenServicio(
            @PathVariable Integer idServicio,
            @RequestParam LocalDate fecha,
            @RequestParam Integer correlativo
    ) {

        return calculadoraService.obtenerResumenServicio(
                idServicio,
                fecha,
                correlativo
        );
    }

    @GetMapping("/reporte-asistencia/{idServicio}")
    public ReporteAsistenciaDTO obtenerReporteAsistencia(

            @PathVariable Integer idServicio,

            @RequestParam LocalDate fecha,

            @RequestParam Integer correlativo
    ) {

        return calculadoraService.obtenerReporteAsistencia(
                idServicio,
                fecha,
                correlativo
        );
    }
    @GetMapping("/reporte-pdf/{idServicio}")
    public ResponseEntity<byte[]> generarReportePdf(

            @PathVariable Integer idServicio,

            @RequestParam LocalDate fecha,

            @RequestParam Integer correlativo

    ) {

        ReporteAsistenciaDTO reporte =
                calculadoraService.obtenerReporteAsistencia(
                        idServicio,
                        fecha,
                        correlativo
                );

        byte[] pdf =
                reportePdfService.generarPdf(reporte);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=reporte_asistencia.pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);

    }
}