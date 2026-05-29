package com.cunamas.service;

import com.cunamas.dto.CategoriaNinoRequestDTO;
import com.cunamas.dto.CategoriaNinoResponseDTO;
import com.cunamas.entity.CategoriaNinoEntity;
import com.cunamas.repository.CategoriaNinoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaNinoServiceImpl implements CategoriaNinoService {

    private final CategoriaNinoRepository categoriaNinoRepository;

    @Override
    public List<CategoriaNinoResponseDTO> listarTodos() {
        List<CategoriaNinoEntity> lista = categoriaNinoRepository.findAll();

        return lista.stream().map(entidad -> {
            CategoriaNinoResponseDTO dto = new CategoriaNinoResponseDTO();
            dto.setIdCategoriaNino(entidad.getIdCategoriaNino());
            dto.setCategoria(entidad.getCategoria());
            dto.setEdadInicioMeses(entidad.getEdadInicioMeses());
            dto.setEdadFinMeses(entidad.getEdadFinMeses());
            return dto;
        }).toList();
    }

    @Override
    public CategoriaNinoResponseDTO guardar(CategoriaNinoRequestDTO requestDTO) {
        // Mapeo de DTO de entrada a Entidad
        CategoriaNinoEntity entidad = new CategoriaNinoEntity();
        entidad.setCategoria(requestDTO.getCategoria());
        entidad.setEdadInicioMeses(requestDTO.getEdadInicioMeses());
        entidad.setEdadFinMeses(requestDTO.getEdadFinMeses());

        // Guardar en la Base de Datos
        CategoriaNinoEntity entidadGuardada = categoriaNinoRepository.save(entidad);

        // Mapeo de Entidad guardada a DTO de salida
        CategoriaNinoResponseDTO responseDTO = new CategoriaNinoResponseDTO();
        responseDTO.setIdCategoriaNino(entidadGuardada.getIdCategoriaNino());
        responseDTO.setCategoria(entidadGuardada.getCategoria());
        responseDTO.setEdadInicioMeses(entidadGuardada.getEdadInicioMeses());
        responseDTO.setEdadFinMeses(entidadGuardada.getEdadFinMeses());

        return responseDTO;
    }
}