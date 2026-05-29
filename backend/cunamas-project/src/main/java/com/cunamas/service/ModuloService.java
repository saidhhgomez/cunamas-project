package com.cunamas.service;

import com.cunamas.dto.ModuloRequestDTO;
import com.cunamas.dto.ModuloResponseDTO;

public interface ModuloService {

    ModuloResponseDTO registrarModulo(
            ModuloRequestDTO request
    );
}