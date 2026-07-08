package com.cunamas.service;

import com.cunamas.dto.*;

import java.util.List;

public interface AuthService {

    RegisterResponseDTO register(
            RegisterRequestDTO request
    );

    LoginResponseDTO login(
            LoginRequestDTO request
    );

    AdminRegisterResponseDTO registrarUsuarioPorAdministrador(
            AdminRegisterRequestDTO request
    );

    List<UsuarioPendienteListadoDTO> obtenerSolicitudesPendientes();

    UsuarioPendienteDetalleDTO obtenerDetalleSolicitud(
            Integer idPersona
    );

    AprobarUsuarioResponseDTO aprobarSolicitud(
            AprobarUsuarioRequestDTO request
    );

    RefreshTokenResponseDTO refresh(
            RefreshTokenRequestDTO request
    );

    void logout(
            String refreshToken
    );

    void logoutAll();

}