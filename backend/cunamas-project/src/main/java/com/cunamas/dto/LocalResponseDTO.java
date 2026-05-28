package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LocalResponseDTO {

    private String mensaje;

    private Integer idLocal;
}