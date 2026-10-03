package com.cunamas.service;

import java.awt.Color;
import com.cunamas.dto.ReporteSedeDTO;
import com.cunamas.dto.ReporteAsistenciaFilaDTO;
import com.cunamas.dto.ReporteAsistenciaDTO;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.Element;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class ReportePdfServiceImpl implements ReportePdfService {

    private static final Color AZUL_TITULO = new Color(0, 102, 204);
    private static final Color VERDE_68 = new Color(170, 220, 70);
    private static final Color NARANJA_911 = new Color(255, 170, 60);
    private static final Color VERDE_1223 = new Color(90, 190, 90);
    private static final Color CELESTE_2436 = new Color(90, 180, 255);
    private static final Color GRIS_CABECERA_INFO = new Color(240, 240, 240);

    // Factor de padding para darle altura vertical a los cuadros
    private static final float PADDING_CELDA = 8.5f;

    @Override
    public byte[] generarPdf(ReporteAsistenciaDTO reporte) {

        try {

            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // Márgenes equilibrados
            Document document = new Document(
                    com.lowagie.text.PageSize.A4,
                    20,
                    20,
                    25,
                    25
            );

            PdfWriter.getInstance(document, baos);

            document.open();

            // Título principal
            Font titulo = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    18,
                    AZUL_TITULO
            );

            Paragraph pTitulo = new Paragraph(
                    "PANEL SERVICIO ALIMENTARIO",
                    titulo
            );
            pTitulo.setAlignment(Element.ALIGN_CENTER);

            document.add(pTitulo);

            // -------------------------------------------------------------
            // TABLA SUPERIOR (DATOS DEL PANEL)
            // -------------------------------------------------------------
            PdfPTable tablaInfo = new PdfPTable(4);
            tablaInfo.setWidthPercentage(100);
            tablaInfo.setWidths(new float[]{3.2f, 2.8f, 2f, 2f});

            tablaInfo.setSpacingBefore(18f);
            tablaInfo.setSpacingAfter(20f);

            agregarCeldaHeaderInfo(tablaInfo, "Servicio Alimentario");
            agregarCeldaHeaderInfo(tablaInfo, "Comité");
            agregarCeldaHeaderInfo(tablaInfo, "Fecha");
            agregarCeldaHeaderInfo(tablaInfo, "Turno");

            agregarCeldaDataInfo(tablaInfo, reporte.getServicioAlimentario());
            agregarCeldaDataInfo(tablaInfo, reporte.getComite());
            agregarCeldaDataInfo(tablaInfo, String.valueOf(reporte.getFecha()));
            agregarCeldaDataInfo(tablaInfo, reporte.getTurno());

            document.add(tablaInfo);

            // -------------------------------------------------------------
            // TABLA PRINCIPAL DEL REPORTE
            // -------------------------------------------------------------
            PdfPTable tabla = new PdfPTable(9);
            tabla.setWidthPercentage(100);

            // Anchos balanceados manteniendo la proporción
            tabla.setWidths(new float[]{
                    2.0f,
                    2.5f,
                    0.9f,
                    0.9f,
                    0.9f,
                    0.9f,
                    1.1f,
                    1.1f,
                    1.9f
            });

            agregarCabecera(tabla, "Sede");
            agregarCabecera(tabla, "Módulo");
            agregarCabecera(tabla, "6-8");
            agregarCabecera(tabla, "9-11");
            agregarCabecera(tabla, "12-23");
            agregarCabecera(tabla, "24-36");
            agregarCabecera(tabla, "Total Niños");
            agregarCabecera(tabla, "Actores");
            agregarCabecera(tabla, "Observación");

            for (ReporteSedeDTO sede : reporte.getSedes()) {

                for (ReporteAsistenciaFilaDTO fila : sede.getModulos()) {

                    agregarCelda(tabla, sede.getNombreSede());
                    agregarCelda(tabla, fila.getModulo());

                    agregarCeldaColor(
                            tabla,
                            valor(fila.getSeisAOcho()),
                            VERDE_68
                    );

                    agregarCeldaColor(
                            tabla,
                            valor(fila.getNueveAOnce()),
                            NARANJA_911
                    );

                    agregarCeldaColor(
                            tabla,
                            valor(fila.getDoceAVeintitres()),
                            VERDE_1223
                    );

                    agregarCeldaColor(
                            tabla,
                            valor(fila.getVeinticuatroATreintaYSeis()),
                            CELESTE_2436
                    );

                    agregarCelda(tabla, valor(fila.getTotalNinos()));
                    agregarCelda(tabla, valor(fila.getActoresComunales()));
                    agregarCelda(tabla, fila.getObservacion());

                }

            }

            // Pie de tabla
            agregarCelda(tabla, "");
            agregarCeldaBold(tabla, "TOTAL");

            agregarCeldaColor(
                    tabla,
                    valor(reporte.getTotales().getSeisAOcho()),
                    VERDE_68
            );

            agregarCeldaColor(
                    tabla,
                    valor(reporte.getTotales().getNueveAOnce()),
                    NARANJA_911
            );

            agregarCeldaColor(
                    tabla,
                    valor(reporte.getTotales().getDoceAVeintitres()),
                    VERDE_1223
            );

            agregarCeldaColor(
                    tabla,
                    valor(reporte.getTotales().getVeinticuatroATreintaYSeis()),
                    CELESTE_2436
            );

            agregarCelda(tabla, valor(reporte.getTotales().getTotalNinos()));
            agregarCelda(tabla, valor(reporte.getTotales().getActoresComunales()));
            agregarCelda(tabla, "");

            document.add(tabla);
            document.close();

            return baos.toByteArray();

        } catch (DocumentException e) {

            throw new RuntimeException("Error al generar PDF", e);

        }

    }

    // --- MÉTODOS AUXILIARES ---

    private void agregarCeldaHeaderInfo(PdfPTable tabla, String texto) {
        PdfPCell cell = new PdfPCell(
                new Phrase(
                        texto,
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10f)
                )
        );
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(GRIS_CABECERA_INFO);
        cell.setPaddingTop(PADDING_CELDA);
        cell.setPaddingBottom(PADDING_CELDA);
        tabla.addCell(cell);
    }

    private void agregarCeldaDataInfo(PdfPTable tabla, String texto) {
        PdfPCell cell = new PdfPCell(
                new Phrase(
                        texto != null ? texto : "",
                        FontFactory.getFont(FontFactory.HELVETICA, 10f)
                )
        );
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPaddingTop(PADDING_CELDA);
        cell.setPaddingBottom(PADDING_CELDA);
        tabla.addCell(cell);
    }

    private void agregarCabecera(PdfPTable tabla, String texto) {

        PdfPCell cell = new PdfPCell(
                new Phrase(
                        texto,
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10f)
                )
        );

        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPaddingTop(PADDING_CELDA);
        cell.setPaddingBottom(PADDING_CELDA);
        tabla.addCell(cell);
    }

    private void agregarCelda(PdfPTable tabla, String texto) {

        PdfPCell cell = new PdfPCell(
                new Phrase(
                        texto != null ? texto : "",
                        FontFactory.getFont(FontFactory.HELVETICA, 9.5f)
                )
        );

        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPaddingTop(PADDING_CELDA);
        cell.setPaddingBottom(PADDING_CELDA);

        tabla.addCell(cell);
    }

    private void agregarCeldaBold(PdfPTable tabla, String texto) {

        PdfPCell cell = new PdfPCell(
                new Phrase(
                        texto,
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10f)
                )
        );

        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPaddingTop(PADDING_CELDA);
        cell.setPaddingBottom(PADDING_CELDA);

        tabla.addCell(cell);
    }

    private void agregarCeldaColor(
            PdfPTable tabla,
            String texto,
            Color color
    ){

        PdfPCell cell = new PdfPCell(
                new Phrase(
                        texto != null ? texto : "",
                        FontFactory.getFont(FontFactory.HELVETICA, 9.5f)
                )
        );

        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(color);
        cell.setPaddingTop(PADDING_CELDA);
        cell.setPaddingBottom(PADDING_CELDA);

        tabla.addCell(cell);

    }

    private String valor(Integer numero){

        return numero == null ? "" : numero.toString();

    }
}