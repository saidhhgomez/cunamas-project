package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IAAnalisisAlimentoDTO {

    private String nombre;

    private String valorNutricional;

    private String fortalezas;

    private String deficiencias;

    private String recomendaciones;

    private String manipulacion;

}