package com.cunamas.service;

import com.cunamas.dto.DireccionRequestDTO;
import com.cunamas.dto.DireccionResponseDTO;

public interface DireccionService {

    DireccionResponseDTO crearDireccion(
            DireccionRequestDTO request
    );
}