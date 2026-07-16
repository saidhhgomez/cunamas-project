package com.cunamas.client;

import com.cunamas.config.OpenAIProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAIClientImpl
        implements OpenAIClient {

    private final OpenAIProperties properties;

    private final RestClient restClient =
            RestClient.builder()
                    .build();

    @Override
    public String analizarAlimentos(
            String prompt
    ) {

        log.info("==============================================");

        log.info("Inicializando cliente OpenAI...");

        log.info("Modelo: {}", properties.getModel());

        log.info("URL: {}", properties.getUrl());

        log.info("Timeout: {} segundos", properties.getTimeout());

        log.info("API KEY cargada: {}",
                properties.getApiKey() != null
        );

        log.info("Longitud API KEY: {}",
                properties.getApiKey().length()
        );

        log.info("----------------------------------------------");

        log.info("Prompt recibido:");

        log.info(prompt);

        log.info("----------------------------------------------");

        log.info("Cliente OpenAI listo.");

        return "INFRAESTRUCTURA_OK";

    }

}