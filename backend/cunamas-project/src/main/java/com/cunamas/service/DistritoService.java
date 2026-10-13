package com.cunamas.service;

import com.cunamas.dto.response.DistritoResponseDTO;

import java.util.List;

public interface DistritoService {

    List<DistritoResponseDTO> buscarDistritos(String nombreDistrito);

}