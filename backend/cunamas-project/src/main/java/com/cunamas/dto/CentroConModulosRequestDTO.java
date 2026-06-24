package com.cunamas.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CentroConModulosRequestDTO {

    @NotNull
    private Integer idDireccion;

    @NotNull
    private Integer idCentroAlimentario;

    private String localNombre;

    @NotNull
    private Integer idUsuario;

    @NotEmpty
    private List<String> modulos;
}