package com.cunamas.service;

import com.cunamas.dto.ModuloListadoDTO;
import com.cunamas.dto.ModuloRequestDTO;
import com.cunamas.dto.ModuloResponseDTO;

import java.util.List;

public interface ModuloService {

    ModuloResponseDTO registrarModulo(
            ModuloRequestDTO request
    );

    List<ModuloListadoDTO> obtenerModulosPorLocal(
            Integer idLocal
    );
}