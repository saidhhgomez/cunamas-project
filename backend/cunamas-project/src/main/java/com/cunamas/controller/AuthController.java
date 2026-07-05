package com.cunamas.controller;

import com.cunamas.dto.RegisterRequestDTO;
import com.cunamas.dto.RegisterResponseDTO;
import com.cunamas.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

}