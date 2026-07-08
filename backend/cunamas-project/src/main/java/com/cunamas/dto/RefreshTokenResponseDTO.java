package com.cunamas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class RefreshTokenResponseDTO {

    private String token;

    private String refreshToken;

    private String tipo;

    private Long expiraEn;

    private Integer idPersona;

    private String nombre;

    private List<String> roles;

    private String distrito;

    private Boolean tieneDireccion;

}