package com.cunamas.service;

import com.cunamas.dto.TipoCentroResponseDTO;
import com.cunamas.entity.TipoCentroEntity;
import com.cunamas.repository.TipoCentroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoCentroServiceImpl implements TipoCentroService {

    private final TipoCentroRepository tipoCentroRepository;

    @Override
    public List<TipoCentroResponseDTO> listarTodos() {

        List<TipoCentroEntity> lista =
                tipoCentroRepository.findAll();

        return lista.stream().map(tipoCentro -> {

            TipoCentroResponseDTO dto =
                    new TipoCentroResponseDTO();

            dto.setIdTipoCentro(
                    tipoCentro.getIdTipoCentro()
            );

            dto.setNombreTipoCentro(
                    tipoCentro.getNombreTipoCentro()
            );

            return dto;

        }).toList();
    }
}