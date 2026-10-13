package com.cunamas.dto.request;

import com.cunamas.constant.ErrorMessages;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModuloRequestDTO {

    @NotBlank(message = ErrorMessages.MODULE_NAME_REQUIRED)
    private String nombreModulo;

    @NotNull(message = ErrorMessages.INVALID_LOCAL_ID)
    private Integer idLocal;
}