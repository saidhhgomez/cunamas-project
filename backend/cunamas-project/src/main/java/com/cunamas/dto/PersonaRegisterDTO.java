package com.cunamas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PersonaRegisterDTO {

    @NotNull(message = "El tipo de documento es obligatorio")
    private Integer idDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    @NotBlank(message = "Los nombres son obligatorios")
    private String nombres;

    @NotBlank(message = "El apellido paterno es obligatorio")
    private String apPaterno;

    private String apMaterno;

    @NotNull(message = "El género es obligatorio")
    private Integer idGenero;

}