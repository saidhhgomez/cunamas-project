package com.cunamas.service;

import com.cunamas.dto.list.ServicioAlimentarioPageDTO;
import com.cunamas.dto.request.ServicioAlimentarioRequestDTO;
import com.cunamas.dto.response.ServicioAlimentarioResponseDTO;

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