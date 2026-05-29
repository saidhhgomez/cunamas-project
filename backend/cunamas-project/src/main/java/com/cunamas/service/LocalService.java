package com.cunamas.service;

import com.cunamas.dto.LocalListadoDTO;
import com.cunamas.dto.LocalRequestDTO;
import com.cunamas.dto.LocalResponseDTO;

import java.util.List;

public interface LocalService {

    LocalResponseDTO registrarLocal(LocalRequestDTO request);

    List<LocalListadoDTO> obtenerLocales();
}