package com.cunamas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminRegisterCuentaDTO {

    @Email
    @NotBlank
    private String correoElectronico;

}