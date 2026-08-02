package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IAAnalisisGlobalDTO {

    private String equilibrioNutricional;

    private String nutrientesFaltantes;

    private String alimentosComplementarios;

    private String preparacionesRecomendadas;

    private String mejorasMenu;

}