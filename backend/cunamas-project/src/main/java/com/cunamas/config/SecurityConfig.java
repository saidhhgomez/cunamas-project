package com.cunamas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.cunamas.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();

    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->

                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )

                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(

                                "/auth/**",

                                "/swagger-ui/**",

                                "/swagger-ui.html",

                                "/v3/api-docs/**",

                        ).permitAll()

                        .requestMatchers(
                                "/admin/**"
                        )

                        .authenticated()

                        .anyRequest()

                        .authenticated()

                )

                .formLogin(form -> form.disable())

                .httpBasic(httpBasic -> httpBasic.disable())

                .addFilterBefore(

                        jwtAuthenticationFilter,

                        UsernamePasswordAuthenticationFilter.class

                );

        return http.build();

    }

}