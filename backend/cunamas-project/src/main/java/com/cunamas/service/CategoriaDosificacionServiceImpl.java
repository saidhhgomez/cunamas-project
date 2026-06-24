package com.cunamas.service;

import com.cunamas.dto.CategoriaDosificacionDTO;
import com.cunamas.repository.CategoriaDosificacionRepository;
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

        return repository.listarCategorias();
    }
}