package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class IAAnalisisResponseDTO {

    private String titulo;

    private List<IAAnalisisAlimentoDTO> analisisAlimentos;

    private IAAnalisisGlobalDTO analisisGlobal;

    private IAResumenEjecutivoDTO resumenEjecutivo;

}