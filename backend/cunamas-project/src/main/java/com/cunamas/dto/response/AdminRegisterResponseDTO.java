package com.cunamas.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminRegisterResponseDTO {

    private String mensaje;

    private Integer idPersona;

    private String passwordTemporal;

}