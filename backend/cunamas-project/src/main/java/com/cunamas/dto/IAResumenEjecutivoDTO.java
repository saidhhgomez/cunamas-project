package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IAResumenEjecutivoDTO {

    private String fortalezas;

    private String aspectosMejorar;

    private String recomendacionGeneral;

}