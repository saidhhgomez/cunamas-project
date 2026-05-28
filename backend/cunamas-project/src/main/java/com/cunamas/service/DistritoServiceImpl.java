package com.cunamas.service;

import com.cunamas.dto.DistritoResponseDTO;
import com.cunamas.entity.DistritoEntity;
import com.cunamas.repository.DistritoRepository;
import com.cunamas.service.DistritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DistritoServiceImpl implements DistritoService {

    private final DistritoRepository distritoRepository;

    @Override
    public DistritoResponseDTO obtenerPorDistrito(String nombreDistrito) {

        DistritoEntity distrito = distritoRepository
                .findByNombreDistritoIgnoreCase(nombreDistrito)
                .orElseThrow(() -> new RuntimeException("Distrito no encontrado"));

        DistritoResponseDTO dto = new DistritoResponseDTO();

        dto.setIdDistrito(distrito.getIdDistrito());
        dto.setDistrito(distrito.getNombreDistrito());
        dto.setUbigeo(distrito.getUbigeo());

        dto.setIdProvincia(
                distrito.getProvincia().getIdProvincia()
        );

        dto.setProvincia(
                distrito.getProvincia().getNombreProvincia()
        );

        dto.setIdDepartamento(
                distrito.getProvincia()
                        .getDepartamento()
                        .getIdDepartamento()
        );

        dto.setDepartamento(
                distrito.getProvincia()
                        .getDepartamento()
                        .getNombreDepto()
        );

        return dto;
    }
}