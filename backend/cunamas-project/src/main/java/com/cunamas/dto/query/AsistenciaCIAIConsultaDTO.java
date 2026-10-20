package com.cunamas.dto.query;

import com.cunamas.dto.response.AsistenciaCategoriaDTO;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AsistenciaCIAIConsultaDTO {

    private Integer idModulo;

    private LocalDate fecha;

    private String observacion;

    private List<AsistenciaCategoriaDTO> registroManana;

    private List<AsistenciaCategoriaDTO> registroTarde;
}