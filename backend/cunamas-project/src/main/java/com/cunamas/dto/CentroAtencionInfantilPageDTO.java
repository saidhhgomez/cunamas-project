package com.cunamas.dto;

import lombok.Data;

import java.util.List;

@Data
public class CentroAtencionInfantilPageDTO {

    private List<CentroAtencionInfantilListadoDTO> content;

    private long totalElements;

    private int totalPages;

    private int currentPage;
}