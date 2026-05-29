package com.cunamas.service;

import com.cunamas.dto.CategoriaNinoRequestDTO;
import com.cunamas.dto.CategoriaNinoResponseDTO;
import java.util.List;

public interface CategoriaNinoService {
    List<CategoriaNinoResponseDTO> listarTodos();
    CategoriaNinoResponseDTO guardar(CategoriaNinoRequestDTO requestDTO);
}