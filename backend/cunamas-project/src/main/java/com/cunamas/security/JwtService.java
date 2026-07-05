package com.cunamas.security;

import com.cunamas.entity.PersonaEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private static final String SECRET =

            "cunamas-secret-key-super-segura-2026-jwt-token-jwt-security";

    private static final Long EXPIRATION = 1800L;

    private final SecretKey key =
            Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generarToken(

            PersonaEntity persona,

            List<String> roles

    ) {

        Date ahora = new Date();

        Date expiracion =

                new Date(

                        ahora.getTime() +

                                (EXPIRATION * 1000)

                );

        return Jwts.builder()

                .subject(persona.getNumeroDocumento())

                .claim(

                        "idPersona",

                        persona.getIdPersona()

                )

                .claim(

                        "roles",

                        roles

                )

                .issuedAt(ahora)

                .expiration(expiracion)

                .signWith(

                        key,

                        SignatureAlgorithm.HS256

                )

                .compact();

    }

    public Claims obtenerClaims(

            String token

    ) {

        return Jwts.parser()

                .verifyWith(key)

                .build()

                .parseSignedClaims(token)

                .getPayload();

    }

    public boolean validarToken(

            String token

    ) {

        try {

            obtenerClaims(token);

            return true;

        } catch (Exception e) {

            return false;

        }

    }

    public Long getExpirationSeconds() {

        return EXPIRATION;

    }

}