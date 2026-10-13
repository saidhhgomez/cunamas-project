package com.cunamas.service;

import com.cunamas.dto.request.DireccionRequestDTO;
import com.cunamas.dto.response.DireccionResponseDTO;
import com.cunamas.dto.request.PerfilDireccionRequestDTO;
import com.cunamas.dto.response.PerfilDireccionResponseDTO;

public interface DireccionService {

    DireccionResponseDTO crearDireccion(
            DireccionRequestDTO request
    );

    PerfilDireccionResponseDTO registrarDireccionPerfil(
            PerfilDireccionRequestDTO request
    );
}