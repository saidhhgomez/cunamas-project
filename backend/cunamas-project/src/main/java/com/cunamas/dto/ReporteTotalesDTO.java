package com.cunamas.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
    @Data
    public class ReporteTotalesDTO {

        @JsonProperty("6 a 8")
        private Integer seisAOcho;

        @JsonProperty("9 a 11")
        private Integer nueveAOnce;

        @JsonProperty("12 a 23")
        private Integer doceAVeintitres;

        @JsonProperty("24 a 36")
        private Integer veinticuatroATreintaYSeis;

        private Integer totalNinos;

        private Integer actoresComunales;

}
