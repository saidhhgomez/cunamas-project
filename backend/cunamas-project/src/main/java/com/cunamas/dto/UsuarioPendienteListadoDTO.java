package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UsuarioPendienteListadoDTO {

    private Integer idPersona;

    private String numeroDocumento;

    private String nombresCompletos;

    private String correoElectronico;

    private LocalDateTime fechaRegistro;

    private Boolean estadoCuenta;

}