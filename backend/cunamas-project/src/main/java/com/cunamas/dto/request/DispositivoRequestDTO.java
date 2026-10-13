package com.cunamas.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DispositivoRequestDTO {

    @NotBlank
    private String nombreDispositivo;

    @NotBlank
    private String uuidDispositivo;

}