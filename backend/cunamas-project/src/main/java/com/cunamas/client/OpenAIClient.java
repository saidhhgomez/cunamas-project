package com.cunamas.client;

import com.cunamas.dto.IAAnalisisResponseDTO;

public interface OpenAIClient {

    IAAnalisisResponseDTO analizarAlimentos(
            String prompt
    );

}