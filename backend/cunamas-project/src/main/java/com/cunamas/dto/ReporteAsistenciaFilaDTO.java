package com.cunamas.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ReporteAsistenciaFilaDTO {

    private String modulo;

    @JsonProperty("6 a 8")
    private Integer seisAOcho = 0;

    @JsonProperty("9 a 11")
    private Integer nueveAOnce = 0;

    @JsonProperty("12 a 23")
    private Integer doceAVeintitres = 0;

    @JsonProperty("24 a 36")
    private Integer veinticuatroATreintaYSeis = 0;

    private Integer actoresComunales = 0;

    private String madreCuidadora;
}