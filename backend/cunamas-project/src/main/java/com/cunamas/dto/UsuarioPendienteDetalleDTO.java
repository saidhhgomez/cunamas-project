package com.cunamas.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UsuarioPendienteDetalleDTO {

    private Integer idPersona;

    private Integer idGenero;

    private String genero;

    private Integer idDocumento;

    private String tipoDocumento;

    private String numeroDocumento;

    private String nombres;

    private String apPaterno;

    private String apMaterno;

    private String telefono;

    private LocalDate fechaNacimiento;

    private Integer idDireccion;

    private String direccion;

    private String distrito;

    private String correoElectronico;

    private LocalDateTime fechaRegistro;

}