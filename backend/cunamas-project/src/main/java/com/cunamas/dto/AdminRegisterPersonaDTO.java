package com.cunamas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminRegisterPersonaDTO {

    @NotNull
    private Integer idDocumento;

    @NotBlank
    private String numeroDocumento;

    @NotBlank
    private String nombres;

    @NotBlank
    private String apPaterno;

    private String apMaterno;

    @NotNull
    private Integer idGenero;

}