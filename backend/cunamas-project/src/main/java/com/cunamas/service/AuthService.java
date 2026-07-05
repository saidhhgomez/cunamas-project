package com.cunamas.service;

import com.cunamas.dto.LoginRequestDTO;
import com.cunamas.dto.LoginResponseDTO;
import com.cunamas.dto.RegisterRequestDTO;
import com.cunamas.dto.RegisterResponseDTO;

public interface AuthService {

    RegisterResponseDTO register(
            RegisterRequestDTO request
    );

    LoginResponseDTO login(
            LoginRequestDTO request
    );

}