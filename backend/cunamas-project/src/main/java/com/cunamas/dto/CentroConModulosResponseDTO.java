package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CentroConModulosResponseDTO {

    private String mensaje;

    private Integer idLocal;

    private List<Integer> idsModulos;
}