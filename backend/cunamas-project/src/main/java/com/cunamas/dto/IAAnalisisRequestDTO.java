package com.cunamas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class IAAnalisisRequestDTO {

    @Valid
    @NotEmpty(message = "Debe enviar al menos un alimento.")
    private List<IAAlimentoDTO> alimentos;

}