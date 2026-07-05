package com.cunamas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    @Valid
    @NotNull
    private PersonaRegisterDTO persona;

    @Valid
    @NotNull
    private CuentaRegisterDTO cuenta;

}