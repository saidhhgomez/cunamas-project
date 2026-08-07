package com.cunamas.service;

import com.cunamas.dto.*;
import com.cunamas.entity.*;
import com.cunamas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CalculadoraServiceImpl implements CalculadoraService {

    private final CategoriaAlimentoRepository categoriaRepository;

    private final TipoPreparacionRepository tipoPreparacionRepository;

    private final RacionDosificacionRepository racionRepository;

    private final RegistroAsistenciaCIAIRepository registroRepository;

    private final ServicioAlimentarioRepository servicioRepository;

    private final CuentaAccesoRepository cuentaAccesoRepository;

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

            if (r.getCategoriaGrupo() != null) {

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
            Integer idPreparacion,
            CalculadoraRequestDTO request
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



        double total = 0;

        for (RacionDosificacionEntity racion : raciones) {

            for (DetalleAsistenciaDTO categoria : request.getCategorias()) {

                if (racion.getCategoriaGrupo().getIdCategoriaGrupo()
                        .equals(categoria.getIdCategoriaGrupo())) {

                    total += categoria.getCantidad() * racion.getGrMl();

                    break;
                }
            }
        }

        System.out.println("TOTAL = " + total);

        CalculadoraRespuestaDTO dto =
                new CalculadoraRespuestaDTO();

        dto.setAlimento(
                preparacion.getNombrePreparacion()
        );

        dto.setTotalGramosO_Ml(total);

        dto.setUnidad("g/ml");

        LinkedHashMap<String, Integer> empaques =
                new LinkedHashMap<>();

        empaques.put(
                "Opción en empaques de 1 Kg/L",
                (int) Math.ceil(total / 1000)
        );

        empaques.put(
                "Opción en empaques de 500 g/ml",
                (int) Math.ceil(total / 500)
        );

        empaques.put(
                "Opción en empaques de 250 g/ml",
                (int) Math.ceil(total / 250)
        );

        dto.setEmpaquesSugeridos(empaques);

        return dto;
    }
    @Override
    public ResumenServicioDTO obtenerResumenServicio(
            Integer idServicio,
            LocalDate fecha,
            Integer correlativo
    ) {

        if (correlativo != 1 && correlativo != 2) {

            throw new RuntimeException(
                    "El correlativo solo puede ser 1 o 2"
            );
        }

        ServicioAlimentarioEntity servicio =
                servicioRepository.findById(idServicio)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Servicio alimentario no encontrado"
                                )
                        );

        List<RegistroAsistenciaCIAIEntity> registros =
                registroRepository.obtenerResumenServicio(
                        idServicio,
                        fecha,
                        correlativo
                );

        List<LocalResumenDTO> locales =
                new ArrayList<>();

        Map<Integer, LocalResumenDTO> mapaLocales =
                new LinkedHashMap<>();

        Map<Integer, TotalesCategoriaDTO> mapaTotales =
                new LinkedHashMap<>();
        List<TotalesCategoriaDTO> totales = null;
        for (RegistroAsistenciaCIAIEntity registro : registros) {

            Integer idLocal =
                    registro.getModulo()
                            .getLocal()
                            .getIdLocal();

            LocalResumenDTO local =
                    mapaLocales.get(idLocal);

            if (local == null) {

                local = new LocalResumenDTO();

                local.setIdLocal(idLocal);

                local.setNombreLocal(
                        registro.getModulo()
                                .getLocal()
                                .getLocalNombre()
                );

                local.setModulos(
                        new ArrayList<>()
                );

                mapaLocales.put(
                        idLocal,
                        local
                );
            }

            ModuloResumenDTO modulo = null;

            for (ModuloResumenDTO m :
                    local.getModulos()) {

                if (m.getIdModulo().equals(
                        registro.getModulo().getIdModulo())) {

                    modulo = m;
                    break;
                }
            }

            if (modulo == null) {

                modulo = new ModuloResumenDTO();

                modulo.setIdModulo(
                        registro.getModulo()
                                .getIdModulo()
                );

                modulo.setNombreModulo(
                        registro.getModulo()
                                .getNombreModulo()
                );

                modulo.setAsistencia(
                        new ArrayList<>()
                );

                local.getModulos().add(modulo);
            }

            TotalesCategoriaDTO asistencia =
                    new TotalesCategoriaDTO();

            asistencia.setIdCategoriaGrupo(
                    registro.getCategoria()
                            .getIdCategoriaGrupo()
            );

            asistencia.setCategoria(
                    registro.getCategoria()
                            .getNombreCategoria()
            );

            asistencia.setCantidad(
                    registro.getCantidad()
            );

            modulo.getAsistencia()
                    .add(asistencia);
            Integer idCategoria =
                    registro.getCategoria()
                            .getIdCategoriaGrupo();

            TotalesCategoriaDTO total =
                    mapaTotales.get(idCategoria);

            if (total == null) {

                total = new TotalesCategoriaDTO();

                total.setIdCategoriaGrupo(idCategoria);

                total.setCategoria(
                        registro.getCategoria()
                                .getNombreCategoria()
                );

                total.setCantidad(0);

                mapaTotales.put(
                        idCategoria,
                        total
                );
            }

            total.setCantidad(
                    total.getCantidad() + registro.getCantidad()
            );

            totales = new ArrayList<>(mapaTotales.values());


        }
        ResumenServicioDTO response =
                new ResumenServicioDTO();

        response.setIdServicioAlimentario(
                idServicio
        );

        response.setServicioAlimentario(
                servicioRepository
                        .findById(idServicio)
                        .orElseThrow()
                        .getNombreCentro()
        );

        response.setLocales(
                new ArrayList<>(
                        mapaLocales.values()
                )
        );

        response.setTotales(
                totales
        );

        return response;
    }
    @Override
    public ReporteAsistenciaDTO obtenerReporteAsistencia(
            Integer idServicio,
            LocalDate fecha,
            Integer correlativo
    ) {

        List<RegistroAsistenciaCIAIEntity> registros =
                registroRepository.obtenerResumenServicio(
                        idServicio,
                        fecha,
                        correlativo
                );

        ReporteAsistenciaDTO dto = new ReporteAsistenciaDTO();

        dto.setFecha(fecha);
        dto.setCorrelativo(correlativo);

        if (!registros.isEmpty()) {

            ServicioAlimentarioEntity servicio =
                    registros.get(0)
                            .getModulo()
                            .getLocal()
                            .getServicioAlimentario();

            dto.setServicioAlimentario(servicio.getNombreCentro());

            dto.setComite(servicio.getNombreComite());
        }

        Map<String, ReporteSedeDTO> sedes = new LinkedHashMap<>();

        for (RegistroAsistenciaCIAIEntity r : registros) {

            String nombreSede =
                    r.getModulo()
                            .getLocal()
                            .getLocalNombre();

            ReporteSedeDTO sede =
                    sedes.computeIfAbsent(nombreSede, s -> {

                        ReporteSedeDTO nueva = new ReporteSedeDTO();

                        nueva.setNombreSede(s);

                        nueva.setModulos(new ArrayList<>());

                        return nueva;
                    });

            ReporteAsistenciaFilaDTO fila = null;

            for (ReporteAsistenciaFilaDTO f : sede.getModulos()) {

                if (f.getModulo().equals(r.getModulo().getNombreModulo())) {

                    fila = f;

                    break;
                }
            }

            if (fila == null) {

                fila = new ReporteAsistenciaFilaDTO();

                fila.setModulo(
                        r.getModulo().getNombreModulo()
                );

                CuentaAccesoEntity cuenta =
                        cuentaAccesoRepository
                                .findByPersona_IdPersona(
                                        r.getIdUsuarioCreacion()
                                )
                                .orElse(null);

                if (cuenta != null) {

                    PersonaEntity persona = cuenta.getPersona();

                    fila.setMadreCuidadora(
                            persona.getNombres()
                                    + " "
                                    + persona.getApPaterno()
                    );
                }

                sede.getModulos().add(fila);
            }

            switch (r.getCategoria().getIdCategoriaGrupo()) {

                case 1 -> fila.setSeisAOcho(r.getCantidad());

                case 2 -> fila.setNueveAOnce(r.getCantidad());

                case 3 -> fila.setDoceAVeintitres(r.getCantidad());

                case 4 -> fila.setVeinticuatroATreintaYSeis(r.getCantidad());

                case 5 -> fila.setActoresComunales(r.getCantidad());
            }
            fila.setTotalNinos(

                    (fila.getSeisAOcho() == null ? 0 : fila.getSeisAOcho())

                            + (fila.getNueveAOnce() == null ? 0 : fila.getNueveAOnce())

                            + (fila.getDoceAVeintitres() == null ? 0 : fila.getDoceAVeintitres())

                            + (fila.getVeinticuatroATreintaYSeis() == null ? 0 : fila.getVeinticuatroATreintaYSeis())

            );
        }

        dto.setSedes(new ArrayList<>(sedes.values()));
        ReporteTotalesDTO totales = new ReporteTotalesDTO();

        int total68 = 0;
        int total911 = 0;
        int total1223 = 0;
        int total2436 = 0;
        int totalActores = 0;

        for (ReporteSedeDTO sede : dto.getSedes()) {

            for (ReporteAsistenciaFilaDTO fila : sede.getModulos()) {

                total68 += fila.getSeisAOcho() == null ? 0 : fila.getSeisAOcho();

                total911 += fila.getNueveAOnce() == null ? 0 : fila.getNueveAOnce();

                total1223 += fila.getDoceAVeintitres() == null ? 0 : fila.getDoceAVeintitres();

                total2436 += fila.getVeinticuatroATreintaYSeis() == null ? 0 : fila.getVeinticuatroATreintaYSeis();

                totalActores += fila.getActoresComunales() == null ? 0 : fila.getActoresComunales();

            }

        }
        totales.setSeisAOcho(total68);

        totales.setNueveAOnce(total911);

        totales.setDoceAVeintitres(total1223);

        totales.setVeinticuatroATreintaYSeis(total2436);

        totales.setActoresComunales(totalActores);

        totales.setTotalNinos(
                total68
                        + total911
                        + total1223
                        + total2436
        );

        dto.setTotales(totales);

        dto.setTurno(
                correlativo == 1
                        ? "Media Mañana"
                        : "Media Tarde"
        );
        return dto;
    }

}