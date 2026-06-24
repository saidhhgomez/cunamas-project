package com.cunamas.service;

import com.cunamas.dto.*;

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