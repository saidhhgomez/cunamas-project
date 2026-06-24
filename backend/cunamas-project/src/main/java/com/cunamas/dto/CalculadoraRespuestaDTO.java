package com.cunamas.dto;

import lombok.Data;
import java.util.Map;

@Data
public class CalculadoraRespuestaDTO {
    private String alimento;
    private Double totalGramosO_Ml;
    private String unidad;
    private Map<String, Integer> empaquesSugeridos;
}