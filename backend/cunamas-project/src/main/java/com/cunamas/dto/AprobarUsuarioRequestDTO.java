package com.cunamas.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AprobarUsuarioRequestDTO {

    @NotNull(message = "Debe indicar la persona a aprobar")
    private Integer idPersona;

    @NotEmpty(message = "Debe asignar al menos un rol")
    private List<Integer> roles;

}