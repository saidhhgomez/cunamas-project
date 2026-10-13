package com.cunamas.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequestDTO {

    @NotBlank(message = "El refresh token es obligatorio.")
    private String refreshToken;

}