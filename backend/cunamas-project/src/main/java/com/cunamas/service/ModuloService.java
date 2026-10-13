package com.cunamas.service;

import com.cunamas.dto.list.ModuloPageDTO;
import com.cunamas.dto.request.ModuloRequestDTO;
import com.cunamas.dto.response.ModuloResponseDTO;

public interface ModuloService {

    ModuloResponseDTO registrarModulo(
            ModuloRequestDTO request
    );

    ModuloPageDTO obtenerModulosPorLocal(
            Integer idLocal,
            int page,
            int size
    );
}