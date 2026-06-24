package com.cunamas.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AsistenciaCIAIConsultaDTO {

    private Integer idModulo;

    private LocalDate fecha;

    private List<AsistenciaCategoriaDTO> registroManana;

    private List<AsistenciaCategoriaDTO> registroTarde;
}