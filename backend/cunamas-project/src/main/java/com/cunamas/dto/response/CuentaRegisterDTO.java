package com.cunamas.dto.response;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CuentaRegisterDTO {

    @NotBlank(message = "El correo es obligatorio")
    private String correoElectronico;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

}