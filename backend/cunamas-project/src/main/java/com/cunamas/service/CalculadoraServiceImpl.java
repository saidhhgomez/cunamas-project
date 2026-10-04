package com.cunamas.service;

import com.cunamas.dto.*;
import com.cunamas.entity.*;
import com.cunamas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
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
            CategoriaAlimentoDTO dto = new CategoriaAlimentoDTO();
            dto.setIdCategoriaAlimento(c.getIdCategoriaAlimento());
            dto.setNombreCategoriaAlimento(c.getNombreCategoriaAlimento());
            lista.add(dto);
        }

        return lista;
    }

    @Override
    public List<TipoPreparacionDTO> listarPreparacionesPorCategoria(Integer idCategoria) {
        List<TipoPreparacionDTO> lista = new ArrayList<>();

        List<TipoPreparacionEntity> preparaciones =
                tipoPreparacionRepository.findByCategoriaAlimento_IdCategoriaAlimento(idCategoria);

        for (TipoPreparacionEntity tp : preparaciones) {
            TipoPreparacionDTO dto = new TipoPreparacionDTO();
            dto.setIdTipoPreparacion(tp.getIdTipoPreparacion());
            dto.setNombrePreparacion(tp.getNombrePreparacion());
            dto.setPorcionComestible(tp.getPorcionComestible());
            lista.add(dto);
        }

        return lista;
    }

    @Override
    public List<DosisCategoriaDTO> listarDosificacion(Integer idPreparacion) {
        List<DosisCategoriaDTO> lista = new ArrayList<>();

        List<RacionDosificacionEntity> raciones =
                racionRepository.findByTipoPreparacion_IdTipoPreparacion(idPreparacion);

        for (RacionDosificacionEntity r : raciones) {
            DosisCategoriaDTO dto = new DosisCategoriaDTO();

            if (r.getCategoriaGrupo() != null) {
                dto.setIdCatNino(r.getCategoriaGrupo().getIdCategoriaGrupo());
                dto.setRangoEdad(r.getCategoriaGrupo().getNombreCategoria());
            }

            dto.setGramosOMl(r.getGrMl());
            lista.add(dto);
        }

        return lista;
    }

    @Override
    public CalculadoraRespuestaDTO calcularTotal(
            Integer idPreparacion,
            CalculadoraRequestDTO request
    ) {
        TipoPreparacionEntity preparacion = tipoPreparacionRepository
                .findById(idPreparacion)
                .orElseThrow(() -> new RuntimeException("Preparación no encontrada: " + idPreparacion));

        List<RacionDosificacionEntity> raciones = racionRepository
                .findByTipoPreparacion_IdTipoPreparacion(idPreparacion);

        BigDecimal total = BigDecimal.ZERO;

        for (RacionDosificacionEntity racion : raciones) {
            if (racion.getGrMl() == null) continue;

            for (DetalleAsistenciaDTO categoria : request.getCategorias()) {
                if (racion.getCategoriaGrupo().getIdCategoriaGrupo()
                        .equals(categoria.getIdCategoriaGrupo())) {

                    BigDecimal cantidadPersonas = BigDecimal.valueOf(categoria.getCantidad());
                    BigDecimal subtotal = racion.getGrMl().multiply(cantidadPersonas);

                    total = total.add(subtotal);
                    break;
                }
            }
        }

        CalculadoraRespuestaDTO dto = new CalculadoraRespuestaDTO();
        dto.setAlimento(preparacion.getNombrePreparacion());
        dto.setTotalGramosO_Ml(total.doubleValue());

        // Unidad dinámica configurada en la BD ("g" o "ml")
        String unidadMedida = preparacion.getUnidadMedida() != null ? preparacion.getUnidadMedida() : "g";
        dto.setUnidad(unidadMedida);

        // Evaluamos el tipo de presentación dinámicamente mediante la entidad relacional
        TipoPresentacionEntity presentacion = preparacion.getTipoPresentacion();
        String nombrePresentacion = (presentacion != null && presentacion.getNombre() != null)
                ? presentacion.getNombre().toUpperCase()
                : "SOLIDO";

        String nombreAlimento = preparacion.getNombrePreparacion().toUpperCase();

        LinkedHashMap<String, Integer> empaques = new LinkedHashMap<>();
        double totalDouble = total.doubleValue();

        if ("LIQUIDO".equals(nombrePresentacion)) {
            // Si el alimento es contiene el nombre "Leche"
            if (nombreAlimento.contains("LECHE")) {
                String etiqueta946 = "Opción en cajas de 946 ml";
                String etiqueta500 = "Opción en cajas de 500 ml";
                String etiqueta250 = "Opción en cajas de 250 ml";

                empaques.put(etiqueta946, (int) Math.ceil(totalDouble / 946.0));
                empaques.put(etiqueta500, (int) Math.ceil(totalDouble / 500.0));
                empaques.put(etiqueta250, (int) Math.ceil(totalDouble / 250.0));
            } else {
                // Líquidos estándar (Aceite, Agua, Jugos)
                String etiqueta1k = "Opción en botellas/cajas de 1 L";
                String etiqueta500 = "Opción en botellas/cajas de 500 ml";
                String etiqueta250 = "Opción en botellas/cajas de 250 ml";

                empaques.put(etiqueta1k, (int) Math.ceil(totalDouble / 1000.0));
                empaques.put(etiqueta500, (int) Math.ceil(totalDouble / 500.0));
                empaques.put(etiqueta250, (int) Math.ceil(totalDouble / 250.0));
            }
        } else if ("LATA".equals(nombrePresentacion)) {
            String etiquetaLataGrande = "Opción en latas de 425 g";
            String etiquetaLataMediana = "Opción en latas de 170 g";
            String etiquetaLataPequena = "Opción en latas de 100 g";

            empaques.put(etiquetaLataGrande, (int) Math.ceil(totalDouble / 425.0));
            empaques.put(etiquetaLataMediana, (int) Math.ceil(totalDouble / 170.0));
            empaques.put(etiquetaLataPequena, (int) Math.ceil(totalDouble / 100.0));
        } else {
            // SOLIDO por defecto
            String etiqueta1k = "Opción en empaques de 1 Kg";
            String etiqueta500 = "Opción en empaques de 500 g";
            String etiqueta250 = "Opción en empaques de 250 g";

            empaques.put(etiqueta1k, (int) Math.ceil(totalDouble / 1000.0));
            empaques.put(etiqueta500, (int) Math.ceil(totalDouble / 500.0));
            empaques.put(etiqueta250, (int) Math.ceil(totalDouble / 250.0));
        }

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
            throw new RuntimeException("El correlativo solo puede ser 1 o 2");
        }

        ServicioAlimentarioEntity servicio = servicioRepository.findById(idServicio)
                .orElseThrow(() -> new RuntimeException("Servicio alimentario no encontrado"));

        List<RegistroAsistenciaCIAIEntity> registros = registroRepository.obtenerResumenServicio(
                idServicio,
                fecha,
                correlativo
        );

        Map<Integer, LocalResumenDTO> mapaLocales = new LinkedHashMap<>();
        Map<Integer, TotalesCategoriaDTO> mapaTotales = new LinkedHashMap<>();
        List<TotalesCategoriaDTO> totales = null;

        for (RegistroAsistenciaCIAIEntity registro : registros) {
            Integer idLocal = registro.getModulo().getLocal().getIdLocal();

            LocalResumenDTO local = mapaLocales.get(idLocal);
            if (local == null) {
                local = new LocalResumenDTO();
                local.setIdLocal(idLocal);
                local.setNombreLocal(registro.getModulo().getLocal().getLocalNombre());
                local.setModulos(new ArrayList<>());
                mapaLocales.put(idLocal, local);
            }

            ModuloResumenDTO modulo = null;
            for (ModuloResumenDTO m : local.getModulos()) {
                if (m.getIdModulo().equals(registro.getModulo().getIdModulo())) {
                    modulo = m;
                    break;
                }
            }

            if (modulo == null) {
                modulo = new ModuloResumenDTO();
                modulo.setIdModulo(registro.getModulo().getIdModulo());
                modulo.setNombreModulo(registro.getModulo().getNombreModulo());
                modulo.setAsistencia(new ArrayList<>());
                local.getModulos().add(modulo);
            }

            TotalesCategoriaDTO asistencia = new TotalesCategoriaDTO();
            asistencia.setIdCategoriaGrupo(registro.getCategoria().getIdCategoriaGrupo());
            asistencia.setCategoria(registro.getCategoria().getNombreCategoria());
            asistencia.setCantidad(registro.getCantidad());

            modulo.getAsistencia().add(asistencia);

            Integer idCategoria = registro.getCategoria().getIdCategoriaGrupo();
            TotalesCategoriaDTO total = mapaTotales.get(idCategoria);

            if (total == null) {
                total = new TotalesCategoriaDTO();
                total.setIdCategoriaGrupo(idCategoria);
                total.setCategoria(registro.getCategoria().getNombreCategoria());
                total.setCantidad(0);
                mapaTotales.put(idCategoria, total);
            }

            total.setCantidad(total.getCantidad() + registro.getCantidad());
            totales = new ArrayList<>(mapaTotales.values());
        }

        ResumenServicioDTO response = new ResumenServicioDTO();
        response.setIdServicioAlimentario(idServicio);
        response.setServicioAlimentario(servicio.getNombreCentro());
        response.setLocales(new ArrayList<>(mapaLocales.values()));
        response.setTotales(totales);

        return response;
    }

    @Override
    public ReporteAsistenciaDTO obtenerReporteAsistencia(
            Integer idServicio,
            LocalDate fecha,
            Integer correlativo
    ) {
        List<RegistroAsistenciaCIAIEntity> registros = registroRepository.obtenerResumenServicio(
                idServicio,
                fecha,
                correlativo
        );

        ReporteAsistenciaDTO dto = new ReporteAsistenciaDTO();
        dto.setFecha(fecha);
        dto.setCorrelativo(correlativo);

        if (!registros.isEmpty()) {
            ServicioAlimentarioEntity servicio = registros.get(0)
                    .getModulo()
                    .getLocal()
                    .getServicioAlimentario();

            dto.setServicioAlimentario(servicio.getNombreCentro());
            dto.setComite(servicio.getNombreComite());
        }

        Map<String, ReporteSedeDTO> sedes = new LinkedHashMap<>();

        for (RegistroAsistenciaCIAIEntity r : registros) {
            String nombreSede = r.getModulo().getLocal().getLocalNombre();

            ReporteSedeDTO sede = sedes.computeIfAbsent(nombreSede, s -> {
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
                fila.setModulo(r.getModulo().getNombreModulo());

                if (r.getObservacion() != null && !r.getObservacion().isBlank()) {
                    fila.setObservacion(r.getObservacion());
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
        totales.setTotalNinos(total68 + total911 + total1223 + total2436);

        dto.setTotales(totales);
        dto.setTurno(correlativo == 1 ? "Media Mañana" : "Media Tarde");

        return dto;
    }
}