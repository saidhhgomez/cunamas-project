package com.cunamas.service.impl;

import com.cunamas.constant.ErrorMessages;
import com.cunamas.dto.CategoriaDosificacionDTO;
import com.cunamas.exception.NotFoundException;
import com.cunamas.repository.CategoriaDosificacionRepository;
import com.cunamas.service.CategoriaDosificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaDosificacionServiceImpl
        implements CategoriaDosificacionService {

    private final CategoriaDosificacionRepository repository;

    @Override
    public List<CategoriaDosificacionDTO> listarCategorias() {

        List<CategoriaDosificacionDTO> lista = repository.listarCategorias();

        if (lista.isEmpty()) {
            throw new NotFoundException(
                    ErrorMessages.CATEGORY_DOSIFICATION_NOT_FOUND
            );
        }

        return lista;
    }
}