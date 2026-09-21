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

    @Override
    public byte[] generarPdf(ReporteAsistenciaDTO reporte) {

        try {

            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            Document document = new Document();

            PdfWriter.getInstance(document, baos);

            document.open();

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

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            Font negrita = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    11
            );

            Font normal = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    11
            );

// Servicio Alimentario
            Paragraph p1 = new Paragraph();
            p1.add(new Phrase("Servicio Alimentario: ", negrita));
            p1.add(new Phrase(reporte.getServicioAlimentario(), normal));
            document.add(p1);

// Comité
            Paragraph p2 = new Paragraph();
            p2.add(new Phrase("Comité: ", negrita));
            p2.add(new Phrase(reporte.getComite(), normal));
            document.add(p2);

// Fecha
            Paragraph p3 = new Paragraph();
            p3.add(new Phrase("Fecha: ", negrita));
            p3.add(new Phrase(String.valueOf(reporte.getFecha()), normal));
            document.add(p3);

// Turno
            Paragraph p4 = new Paragraph();
            p4.add(new Phrase("Turno: ", negrita));
            p4.add(new Phrase(reporte.getTurno(), normal));
            document.add(p4);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            PdfPTable tabla = new PdfPTable(9);
            tabla.setWidthPercentage(100);

            tabla.setWidths(new float[]{
                    2.5f,
                    2.5f,
                    1.2f,
                    1.2f,
                    1.2f,
                    1.2f,
                    1.5f,
                    1.5f,
                    3f
            });
            agregarCabecera(tabla,"Sede");
            agregarCabecera(tabla,"Módulo");
            agregarCabecera(tabla,"6-8");
            agregarCabecera(tabla,"9-11");
            agregarCabecera(tabla,"12-23");
            agregarCabecera(tabla,"24-36");
            agregarCabecera(tabla,"Total");
            agregarCabecera(tabla,"Actores");
            agregarCabecera(tabla,"Observaciones");

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
            agregarCelda(tabla, "");
            agregarCelda(tabla, "TOTAL");

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
    private void agregarCabecera(PdfPTable tabla, String texto) {

        PdfPCell cell = new PdfPCell(
                new Phrase(
                        texto,
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)
                )
        );

        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        tabla.addCell(cell);
    }
    private void agregarCelda(PdfPTable tabla, String texto) {

        PdfPCell cell = new PdfPCell(new Phrase(texto));

        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);

        tabla.addCell(cell);
    }
    private void agregarCeldaColor(
            PdfPTable tabla,
            String texto,
            Color color
    ){

        PdfPCell cell = new PdfPCell(new Phrase(texto));

        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(color);
        cell.setPadding(5);

        tabla.addCell(cell);

    }

    private String valor(Integer numero){

        return numero == null ? "" : numero.toString();

    }
}





