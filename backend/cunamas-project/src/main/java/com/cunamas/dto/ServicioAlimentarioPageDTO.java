package com.cunamas.dto;

import lombok.Data;

import java.util.List;

@Data
public class ServicioAlimentarioPageDTO {

    private List<ServicioAlimentarioListadoDTO> content;

    private long totalElements;

    private int totalPages;

    private int currentPage;
}