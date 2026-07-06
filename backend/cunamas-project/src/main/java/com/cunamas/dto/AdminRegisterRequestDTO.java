package com.cunamas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AdminRegisterRequestDTO {

    @Valid
    private AdminRegisterPersonaDTO persona;

    @Valid
    private AdminRegisterCuentaDTO cuenta;

    @NotEmpty
    private List<Integer> roles;

}