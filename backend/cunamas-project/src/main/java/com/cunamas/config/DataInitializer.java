package com.cunamas.config;

import com.cunamas.entity.*;
import com.cunamas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer
        implements CommandLineRunner {

    private static final Integer ID_GENERO_MASCULINO = 1;
    private static final Integer ID_GENERO_FEMENINO = 2;

    private static final Integer ID_DNI = 1;

    private static final Integer ID_ROL_AT = 1;
    private static final Integer ID_ROL_SOCIA_COCINA = 2;
    private static final Integer ID_ROL_MADRE_CUIDADORA = 5;
    private static final Integer ID_ROL_GUIA_FAMILIA = 6;

    private final PersonaRepository personaRepository;

    private final CuentaAccesoRepository cuentaRepository;

    private final PersonaRolRepository personaRolRepository;

    private final DocumentoRepository documentoRepository;

    private final GeneroRepository generoRepository;

    private final RolRepository rolRepository;

    private final DireccionRepository direccionRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        LocalDateTime ahora =
                LocalDateTime.now();

        // 1. CREAR ADMINISTRADOR INICIAL (Intacto)
        if (!personaRepository.existsByNumeroDocumento("00000000") &&
                !cuentaRepository.existsByCorreoElectronicoIgnoreCase("admin@cunamas.gob.pe")) {

            DocumentoEntity documento =
                    documentoRepository.findById(
                            ID_DNI
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "No existe el tipo de documento DNI."
                            )
                    );

            GeneroEntity genero =
                    generoRepository.findById(
                            ID_GENERO_MASCULINO
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "No existe el género."
                            )
                    );

            RolEntity rol =
                    rolRepository.findById(
                            ID_ROL_AT
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "No existe el rol Asistente Técnico."
                            )
                    );

            PersonaEntity persona =
                    new PersonaEntity();

            persona.setGenero(genero);

            persona.setDocumento(documento);

            persona.setNumeroDocumento(
                    "00000000"
            );

            persona.setNombres(
                    ""
            );

            persona.setApPaterno(
                    "SISTEMA"
            );

            persona.setFechaCreacion(
                    ahora
            );

            persona.setFechaModificacion(
                    ahora
            );

            persona.setIdUsuarioModificacion(
                    null
            );

            persona =
                    personaRepository.save(
                            persona
                    );

            CuentaAccesoEntity cuenta =
                    new CuentaAccesoEntity();

            cuenta.setPersona(
                    persona
            );

            cuenta.setCorreoElectronico(
                    "admin@cunamas.gob.pe"
            );

            cuenta.setPassword(

                    passwordEncoder.encode(
                            "CunaMas2026!"
                    )

            );

            cuenta.setEstadoCuenta(
                    true
            );

            cuenta.setFechaCreacion(
                    ahora
            );

            cuenta.setFechaModificacion(
                    ahora
            );

            cuenta.setIdUsuarioModificacion(
                    persona.getIdPersona()
            );

            cuentaRepository.save(
                    cuenta
            );

            PersonaRolEntity personaRol =
                    new PersonaRolEntity();

            personaRol.setPersona(
                    persona
            );

            personaRol.setRol(
                    rol
            );

            personaRolRepository.save(
                    personaRol
            );

            System.out.println(
                    "=========================================="
            );

            System.out.println(
                    "ADMINISTRADOR INICIAL CREADO"
            );

            System.out.println(
                    "Usuario : 00000000"
            );

            System.out.println(
                    "Password: CunaMas2026!"
            );

            System.out.println(
                    "=========================================="
            );
        }

        // 2. CARGAR PERSONAL OFICIAL Y DIRECCIONES
        cargarPersonalOficial(ahora);
    }

    private void cargarPersonalOficial(LocalDateTime ahora) {
        DocumentoEntity docDni = documentoRepository.findById(ID_DNI).orElse(null);
        GeneroEntity genFemenino = generoRepository.findById(ID_GENERO_FEMENINO).orElse(null);

        RolEntity rolMadreCuidadora = rolRepository.findById(ID_ROL_MADRE_CUIDADORA).orElse(null);
        RolEntity rolGuiaFamilia = rolRepository.findById(ID_ROL_GUIA_FAMILIA).orElse(null);
        RolEntity rolSociaCocina = rolRepository.findById(ID_ROL_SOCIA_COCINA).orElse(null);

        if (docDni == null || genFemenino == null) {
            return;
        }

        // Madres Cuidadoras (Rol 5)
        if (rolMadreCuidadora != null) {
            registrarPersona("42809661", "YOVANNA LIZET", "TORRES", "PADILLA", LocalDate.of(1980, 6, 12), "978200919", 1, "Yovanna*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
            registrarPersona("09125908", "NELLY", "HUAMAN", "RARAZ", LocalDate.of(1965, 9, 6), "926900819", 2, "Nelly*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
            registrarPersona("72314108", "VALERIA ROSA LUZ HILDA", "MEJIA", "FRITAS", LocalDate.of(2006, 4, 25), "968361299", 3, "Valeria*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
            registrarPersona("48218563", "GISSELLA VIOLETA", "BAUTISTA", "SUCA", LocalDate.of(1988, 9, 25), "904326740", 4, "Gissella*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
            registrarPersona("45142086", "DELIA VICTORIA", "ORTIZ", "RIOS", LocalDate.of(1988, 6, 1), "982442509", 5, "Delia*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
            registrarPersona("76688935", "CAMILA BELEN", "RODRIGUEZ", "VILLEGAS", LocalDate.of(2002, 8, 27), "960549940", 6, "Camila*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
            registrarPersona("44284586", "ROCIO JUDITH", "CUICAPUZA", "PUENTE", LocalDate.of(1987, 5, 18), "976322579", 7, "Rocio*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
            registrarPersona("74722247", "MARIA JHOSELIN", "VERA", "LLANOS", LocalDate.of(2003, 1, 9), "940022163", 8, "Maria*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
            registrarPersona("08411969", "MARGARITA", "LAREDO", "HUAMANI", LocalDate.of(1956, 7, 23), "997091365", 9, "Margarita*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
            registrarPersona("10480619", "ANA MARIA", "MENDOZA", "VENEGAS", LocalDate.of(1976, 9, 20), "914101963", 10, "Ana*2026!", docDni, genFemenino, rolMadreCuidadora, ahora);
        }

        // Guías de Familia (Rol 6)
        if (rolGuiaFamilia != null) {
            registrarPersona("42420588", "SANDRA KARIN", "SERNA", "CARBAJAL", LocalDate.of(1984, 6, 26), "991080419", 11, "Sandra*2026!", docDni, genFemenino, rolGuiaFamilia, ahora);
            registrarPersona("08412666", "AMALIA", "YANCACHAJLLA", "BAUTISTA DE BENDITA", LocalDate.of(1965, 6, 28), "993625701", 12, "Amalia*2026!", docDni, genFemenino, rolGuiaFamilia, ahora);
            registrarPersona("08391921", "LUISA VALENTINA", "ROQUE", "FLORES", LocalDate.of(1963, 6, 21), "992002171", 13, "Luisa*2026!", docDni, genFemenino, rolGuiaFamilia, ahora);
        }

        // Socias de Cocina (Rol 2)
        if (rolSociaCocina != null) {
            registrarPersona("41571445", "DEYSI JENNIFER", "CHUCTAYA", "SOVERO", LocalDate.of(1982, 10, 31), "992223594", 14, "Deysi*2026!", docDni, genFemenino, rolSociaCocina, ahora);
            registrarPersona("08376973", "ISABEL", "ESTELA", "FLORES", LocalDate.of(1957, 5, 5), "942780800", 15, "Isabel*2026!", docDni, genFemenino, rolSociaCocina, ahora);
            registrarPersona("10015900", "CIRILA EUSEBIA", "GAMBOA", "QUISPE", LocalDate.of(1974, 4, 9), "993444890", 16, "Cirila*2026!", docDni, genFemenino, rolSociaCocina, ahora);
            registrarPersona("40936864", "ROSA MILAGROS", "FRITAS", "ORTIZ DE MEJIA", LocalDate.of(1981, 7, 19), "946919877", 17, "Rosa*2026!", docDni, genFemenino, rolSociaCocina, ahora);
            registrarPersona("10009517", "LIZBETH GISELA", "FALCON", "HUAMANI", LocalDate.of(1973, 4, 14), "924797818", 18, "Lizbeth*2026!", docDni, genFemenino, rolSociaCocina, ahora);
            registrarPersona("10011448", "ANA MARIA", "ATIQUIPA", "PARIONA", LocalDate.of(1973, 4, 19), "989887021", 19, "Atiquipa*2026!", docDni, genFemenino, rolSociaCocina, ahora);
        }
    }

    private void registrarPersona(String dni, String nombres, String apPaterno, String apMaterno,
                                  LocalDate fechaNacimiento, String telefono, Integer idDireccion,
                                  String passwordPlana, DocumentoEntity documento, GeneroEntity genero,
                                  RolEntity rol, LocalDateTime ahora) {
        if (personaRepository.existsByNumeroDocumento(dni)) {
            return;
        }

        DireccionEntity direccion = direccionRepository.findById(idDireccion).orElse(null);

        PersonaEntity persona = new PersonaEntity();
        persona.setGenero(genero);
        persona.setDocumento(documento);
        persona.setNumeroDocumento(dni);
        persona.setNombres(nombres);
        persona.setApPaterno(apPaterno);
        persona.setApMaterno(apMaterno);
        persona.setFechaNacimiento(fechaNacimiento);
        persona.setTelefono(telefono);
        persona.setDireccion(direccion);
        persona.setFechaCreacion(ahora);
        persona.setFechaModificacion(ahora);

        persona = personaRepository.save(persona);

        CuentaAccesoEntity cuenta = new CuentaAccesoEntity();
        cuenta.setPersona(persona);
        cuenta.setCorreoElectronico(dni + "@cunamas.gob.pe");
        cuenta.setPassword(passwordEncoder.encode(passwordPlana));
        cuenta.setEstadoCuenta(true);
        cuenta.setFechaCreacion(ahora);
        cuenta.setFechaModificacion(ahora);
        cuenta.setIdUsuarioModificacion(persona.getIdPersona());

        cuentaRepository.save(cuenta);

        PersonaRolEntity personaRol = new PersonaRolEntity();
        personaRol.setPersona(persona);
        personaRol.setRol(rol);
        personaRolRepository.save(personaRol);

        System.out.println("[+] REGISTRADO -> DNI: " + dni + " | Nombre: " + nombres + " " + apPaterno + " | Rol ID: " + rol.getIdRol());
    }
}