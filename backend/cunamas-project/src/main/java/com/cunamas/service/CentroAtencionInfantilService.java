package com.cunamas.service;

import com.cunamas.dto.*;

public interface CentroAtencionInfantilService {

    CentroAtencionInfantilResponseDTO registrar(
            CentroAtencionInfantilRequestDTO request
    );

    CentroAtencionInfantilPageDTO listar(
            Integer idCentroAlimentario,
            int page,
            int size
    );

    CentroConModulosResponseDTO registrarCentroConModulos(
            CentroConModulosRequestDTO request
    );
}