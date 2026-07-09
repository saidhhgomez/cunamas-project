package com.cunamas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoginRequestDTO {

    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    @Valid
    @NotNull(message = "La información del dispositivo es obligatoria")
    private DispositivoRequestDTO dispositivo;

}