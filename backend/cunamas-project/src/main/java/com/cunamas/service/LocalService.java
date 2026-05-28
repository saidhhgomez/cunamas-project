package com.cunamas.service;

import com.cunamas.dto.LocalRequestDTO;
import com.cunamas.dto.LocalResponseDTO;

public interface LocalService {

    LocalResponseDTO registrarLocal(LocalRequestDTO request);
}