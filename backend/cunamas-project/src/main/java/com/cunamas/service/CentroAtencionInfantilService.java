package com.cunamas.service;

import com.cunamas.dto.list.CentroAtencionInfantilPageDTO;
import com.cunamas.dto.request.CentroAtencionInfantilRequestDTO;
import com.cunamas.dto.request.CentroConModulosRequestDTO;
import com.cunamas.dto.response.CentroAtencionInfantilResponseDTO;
import com.cunamas.dto.response.CentroConModulosResponseDTO;

public interface CentroAtencionInfantilService {

    CentroAtencionInfantilResponseDTO registrar(
            CentroAtencionInfantilRequestDTO request
    );

    CentroAtencionInfantilPageDTO listar(
            Integer idCentroAlimentario,
            String distrito,
            String ubigeo,
            int page,
            int size
    );

    CentroConModulosResponseDTO registrarCentroConModulos(
            CentroConModulosRequestDTO request
    );
}