package com.cunamas.service;

import com.cunamas.dto.IAAnalisisRequestDTO;
import com.cunamas.dto.IAAnalisisResponseDTO;

public interface IAService {

    IAAnalisisResponseDTO analizar(
            IAAnalisisRequestDTO request
    );

}