package com.cunamas.security;

import com.cunamas.entity.PersonaEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.expiration}")
    private Long expiration;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generarToken(PersonaEntity persona, List<String> roles) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + (expiration * 1000));

        return Jwts.builder()
                .subject(persona.getNumeroDocumento())
                .claim("idPersona", persona.getIdPersona())
                .claim("roles", roles)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(key, SignatureAlgorithm.HS256) // Nota: En JJWT 0.12.x signWith(key) detecta el algoritmo automáticamente si la llave es lo bastante larga
                .compact();
    }

    public Claims obtenerClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validarToken(String token) {
        try {
            obtenerClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long getExpirationSeconds() {
        return expiration;
    }
}