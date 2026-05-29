package com.cunamas.service;

import com.cunamas.dto.LocalListadoDTO;
import com.cunamas.dto.LocalRequestDTO;
import com.cunamas.dto.LocalResponseDTO;
import com.cunamas.entity.DireccionEntity;
import com.cunamas.entity.LocalEntity;
import com.cunamas.entity.TipoCentroEntity;
import com.cunamas.repository.DireccionRepository;
import com.cunamas.repository.LocalRepository;
import com.cunamas.repository.TipoCentroRepository;
import com.cunamas.service.LocalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocalServiceImpl implements LocalService {

    private final LocalRepository localRepository;

    private final DireccionRepository direccionRepository;

    private final TipoCentroRepository tipoCentroRepository;

    @Override
    public LocalResponseDTO registrarLocal(LocalRequestDTO request) {

        boolean existe = localRepository
                .existsByLocalNombreIgnoreCase(
                        request.getLocalNombre().trim()
                );

        if (existe) {
            throw new RuntimeException(
                    "Ya existe un local con ese nombre"
            );
        }

        DireccionEntity direccion =
                direccionRepository.findById(request.getIdDireccion())
                        .orElseThrow(() ->
                                new RuntimeException("Dirección no encontrada")
                        );

        TipoCentroEntity tipoCentro =
                tipoCentroRepository.findById(request.getIdTipoCentro())
                        .orElseThrow(() ->
                                new RuntimeException("Tipo centro no encontrado")
                        );

        LocalEntity local = new LocalEntity();

        local.setLocalNombre(
                request.getLocalNombre().trim()
        );

        local.setDireccion(direccion);

        local.setTipoCentro(tipoCentro);

        LocalEntity localGuardado =
                localRepository.save(local);

        return new LocalResponseDTO(
                "Local registrado correctamente",
                localGuardado.getIdLocal()
        );
    }

    @Override
    public List<LocalListadoDTO> obtenerLocales() {

        return localRepository.listarLocales();
    }
}