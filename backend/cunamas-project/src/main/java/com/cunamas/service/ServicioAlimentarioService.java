package com.cunamas.service;

import com.cunamas.dto.ServicioAlimentarioPageDTO;
import com.cunamas.dto.ServicioAlimentarioRequestDTO;
import com.cunamas.dto.ServicioAlimentarioResponseDTO;

public interface ServicioAlimentarioService {

    ServicioAlimentarioResponseDTO registrarServicioAlimentario(
            ServicioAlimentarioRequestDTO request
    );

    ServicioAlimentarioPageDTO obtenerServicios(
            String distrito,
            int page,
            int size
    );
}