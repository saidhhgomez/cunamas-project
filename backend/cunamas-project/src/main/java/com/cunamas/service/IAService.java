package com.cunamas.service;

import com.cunamas.dto.request.IAAnalisisRequestDTO;
import com.cunamas.dto.response.IAAnalisisResponseDTO;

public interface IAService {

    IAAnalisisResponseDTO analizar(
            IAAnalisisRequestDTO request
    );

}