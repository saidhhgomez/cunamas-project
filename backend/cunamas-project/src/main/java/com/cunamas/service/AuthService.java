package com.cunamas.service;

import com.cunamas.dto.RegisterRequestDTO;
import com.cunamas.dto.RegisterResponseDTO;

public interface AuthService {

    RegisterResponseDTO register(
            RegisterRequestDTO request
    );

}