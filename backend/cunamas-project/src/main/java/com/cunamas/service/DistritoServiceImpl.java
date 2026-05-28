package com.cunamas.service;

import com.cunamas.dto.DistritoResponseDTO;
import com.cunamas.entity.DistritoEntity;
import com.cunamas.repository.DistritoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DistritoServiceImpl implements DistritoService {

    private final DistritoRepository distritoRepository;

    @Override
    public List<DistritoResponseDTO> buscarDistritos(String nombreDistrito) {

        List<DistritoEntity> distritos =
                distritoRepository
                        .findByNombreDistritoContainingIgnoreCase(nombreDistrito);

        return distritos.stream().map(distrito -> {

            DistritoResponseDTO dto = new DistritoResponseDTO();

            dto.setIdDistrito(distrito.getIdDistrito());
            dto.setDistrito(distrito.getNombreDistrito());
            dto.setUbigeo(distrito.getUbigeo());

            dto.setProvincia(
                    distrito.getProvincia().getNombreProvincia()
            );

            dto.setDepartamento(
                    distrito.getProvincia()
                            .getDepartamento()
                            .getNombreDepto()
            );

            return dto;

        }).toList();
    }
}