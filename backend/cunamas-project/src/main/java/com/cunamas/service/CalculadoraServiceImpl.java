package com.cunamas.service;

import com.cunamas.dto.*;
import com.cunamas.entity.*;
import com.cunamas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalculadoraServiceImpl implements CalculadoraService {

    private final CategoriaAlimentoRepository categoriaRepository;

    private final TipoPreparacionRepository tipoPreparacionRepository;

    private final RacionDosificacionRepository racionRepository;


    @Override
    public List<CategoriaAlimentoDTO> listarCategorias() {

        List<CategoriaAlimentoDTO> lista = new ArrayList<>();

        for (CategoriaAlimentoEntity c : categoriaRepository.findAll()) {

            CategoriaAlimentoDTO dto =
                    new CategoriaAlimentoDTO();

            dto.setIdCategoriaAlimento(
                    c.getIdCategoriaAlimento()
            );

            dto.setNombreCategoriaAlimento(
                    c.getNombreCategoriaAlimento()
            );

            lista.add(dto);
        }

        return lista;
    }


    @Override
    public List<TipoPreparacionDTO>
    listarPreparacionesPorCategoria(
            Integer idCategoria
    ) {

        List<TipoPreparacionDTO> lista =
                new ArrayList<>();

        List<TipoPreparacionEntity> preparaciones =
                tipoPreparacionRepository
                        .findByCategoriaAlimento_IdCategoriaAlimento(
                                idCategoria
                        );

        for (TipoPreparacionEntity tp : preparaciones) {

            TipoPreparacionDTO dto =
                    new TipoPreparacionDTO();

            dto.setIdTipoPreparacion(
                    tp.getIdTipoPreparacion()
            );

            dto.setNombrePreparacion(
                    tp.getNombrePreparacion()
            );

            dto.setPorcionComestible(
                    tp.getPorcionComestible()
            );

            lista.add(dto);
        }

        return lista;
    }


    @Override
    public List<DosisCategoriaDTO>
    listarDosificacion(
            Integer idPreparacion
    ) {

        List<DosisCategoriaDTO> lista =
                new ArrayList<>();

        List<RacionDosificacionEntity> raciones =
                racionRepository
                        .findByTipoPreparacion_IdTipoPreparacion(
                                idPreparacion
                        );

        for (RacionDosificacionEntity r : raciones) {

            DosisCategoriaDTO dto =
                    new DosisCategoriaDTO();

            if(r.getCategoriaGrupo() != null){

                dto.setIdCatNino(
                        r.getCategoriaGrupo()
                                .getIdCategoriaGrupo()
                );

                dto.setRangoEdad(
                        r.getCategoriaGrupo()
                                .getNombreCategoria()
                );

            }

            dto.setRangoEdad(
                    r.getCategoriaGrupo()
                            .getNombreCategoria()
            );

            dto.setGramosOMl(
                    r.getGrMl()
            );

            lista.add(dto);
        }

        return lista;
    }


    @Override
    public CalculadoraRespuestaDTO calcularTotal(
            Integer idPreparacion
    ) {

        TipoPreparacionEntity preparacion =
                tipoPreparacionRepository
                        .findById(idPreparacion)
                        .orElseThrow();

        List<RacionDosificacionEntity> raciones =
                racionRepository
                        .findByTipoPreparacion_IdTipoPreparacion(
                                idPreparacion
                        );

        int ninosCat1 = 10;
        int ninosCat2 = 15;
        int ninosCat3 = 20;
        int ninosCat4 = 12;

        double total = 0;

        for (RacionDosificacionEntity r : raciones) {

            Integer grupo =
                    r.getCategoriaGrupo()
                            .getIdCategoriaGrupo();

            if (grupo == 1)
                total += ninosCat1 * r.getGrMl();

            if (grupo == 2)
                total += ninosCat2 * r.getGrMl();

            if (grupo == 3)
                total += ninosCat3 * r.getGrMl();

            if (grupo == 4)
                total += ninosCat4 * r.getGrMl();
        }

        CalculadoraRespuestaDTO dto =
                new CalculadoraRespuestaDTO();

        dto.setAlimento(
                preparacion.getNombrePreparacion()
        );

        dto.setTotalGramosO_Ml(total);

        dto.setUnidad("g/ml");

        LinkedHashMap<String,Integer> empaques =
                new LinkedHashMap<>();

        empaques.put(
                "Opción en empaques de 1 Kg/L",
                (int)Math.ceil(total/1000)
        );

        empaques.put(
                "Opción en empaques de 500 g/ml",
                (int)Math.ceil(total/500)
        );

        empaques.put(
                "Opción en empaques de 250 g/ml",
                (int)Math.ceil(total/250)
        );

        dto.setEmpaquesSugeridos(empaques);

        return dto;
    }

}