package com.cunamas.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarAsistenciaCIAIResponseDTO {

    private String mensaje;

    private Integer cantidadModificaciones;
}