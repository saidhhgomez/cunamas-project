package com.cunamas.service;

import com.cunamas.dto.DireccionRequestDTO;
import com.cunamas.dto.DireccionResponseDTO;
import com.cunamas.dto.PerfilDireccionRequestDTO;
import com.cunamas.dto.PerfilDireccionResponseDTO;

public interface DireccionService {

    DireccionResponseDTO crearDireccion(
            DireccionRequestDTO request
    );

    PerfilDireccionResponseDTO registrarDireccionPerfil(
            PerfilDireccionRequestDTO request
    );
}