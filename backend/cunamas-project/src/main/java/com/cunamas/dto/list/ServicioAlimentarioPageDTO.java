package com.cunamas.dto.list;

import com.cunamas.dto.query.ServicioAlimentarioListadoDTO;
import lombok.Data;

import java.util.List;

@Data
public class ServicioAlimentarioPageDTO {

    private List<ServicioAlimentarioListadoDTO> content;

    private long totalElements;

    private int totalPages;

    private int currentPage;
}