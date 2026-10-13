package com.cunamas.controller;

import com.cunamas.dto.request.LoginRequestDTO;
import com.cunamas.dto.request.RefreshTokenRequestDTO;
import com.cunamas.dto.request.RegisterRequestDTO;
import com.cunamas.dto.response.LoginResponseDTO;
import com.cunamas.dto.response.RefreshTokenResponseDTO;
import com.cunamas.dto.response.RegisterResponseDTO;
import com.cunamas.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public RegisterResponseDTO register(

            @Valid
            @RequestBody
            RegisterRequestDTO request

    ) {

        return authService.register(
                request
        );

    }

    @PostMapping("/login")
    public LoginResponseDTO login(

            @Valid

            @RequestBody

            LoginRequestDTO request

    ) {

        return authService.login(request);

    }

    @PostMapping("/refresh")
    public RefreshTokenResponseDTO refresh(

            @Valid

            @RequestBody

            RefreshTokenRequestDTO request

    ) {

        return authService.refresh(request);

    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(

            @RequestBody
            RefreshTokenRequestDTO request

    ) {

        authService.logout(
                request.getRefreshToken()
        );

        return ResponseEntity.noContent().build();

    }

    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll() {

        authService.logoutAll();

        return ResponseEntity.noContent().build();

    }

}