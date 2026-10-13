package com.cunamas.client;

import com.cunamas.dto.response.IAAnalisisResponseDTO;

public interface OpenAIClient {

    IAAnalisisResponseDTO analizarAlimentos(
            String prompt
    );

}