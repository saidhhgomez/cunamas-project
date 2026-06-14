package com.cunamas.service;

import com.cunamas.dto.CentroAtencionInfantilPageDTO;
import com.cunamas.dto.CentroAtencionInfantilRequestDTO;
import com.cunamas.dto.CentroAtencionInfantilResponseDTO;

public interface CentroAtencionInfantilService {

    CentroAtencionInfantilResponseDTO registrar(
            CentroAtencionInfantilRequestDTO request
    );

    CentroAtencionInfantilPageDTO listar(
            Integer idCentroAlimentario,
            int page,
            int size
    );
}