package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegistroNinosResumenDTO {

    private String categoria;

    private Integer cantidad;
}