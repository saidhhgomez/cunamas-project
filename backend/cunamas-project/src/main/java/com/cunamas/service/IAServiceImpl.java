package com.cunamas.service;

import com.cunamas.client.OpenAIClient;
import com.cunamas.dto.IAAlimentoDTO;
import com.cunamas.dto.IAAnalisisRequestDTO;
import com.cunamas.dto.IAAnalisisResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class IAServiceImpl
        implements IAService {

    private final OpenAIClient openAIClient;

    @Override
    public IAAnalisisResponseDTO analizar(
            IAAnalisisRequestDTO request
    ) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
Eres una nutricionista especialista del Programa Nacional Cuna Más del Ministerio de Desarrollo e Inclusión Social (MIDIS) del Perú.

IMPORTANTE:

NO respondas en texto libre.

Debes responder EXCLUSIVAMENTE un JSON válido.

No agregues markdown.
No agregues ```json.
No agregues comentarios.

El formato OBLIGATORIO es:

{
  "titulo":"Análisis Nutricional",
  "analisisAlimentos":[
    {
      "nombre":"...",
      "valorNutricional":"...",
      "fortalezas":"...",
      "deficiencias":"...",
      "recomendaciones":"...",
      "manipulacion":"..."
    }
  ],
  "analisisGlobal":{
      "equilibrioNutricional":"...",
      "nutrientesFaltantes":"...",
      "alimentosComplementarios":"...",
      "preparacionesRecomendadas":"...",
      "mejorasMenu":"..."
  },
  "resumenEjecutivo":{
      "fortalezas":"...",
      "aspectosMejorar":"...",
      "recomendacionGeneral":"..."
  }
}

Nunca devuelvas ningún otro formato.

A continuación se muestran los alimentos.
""");

        for (IAAlimentoDTO alimento : request.getAlimentos()) {

            prompt.append("\n");
            prompt.append("=====================================\n");

            prompt.append("ALIMENTO: ")
                    .append(alimento.getNombre())
                    .append("\n");

            prompt.append("Niños 6-9 meses: ")
                    .append(alimento.getCategoriaEtaria().getNinos6a9Meses())
                    .append("\n");

            prompt.append("Niños 10-12 meses: ")
                    .append(alimento.getCategoriaEtaria().getNinos10a12Meses())
                    .append("\n");

            prompt.append("Niños 13-23 meses: ")
                    .append(alimento.getCategoriaEtaria().getNinos13a23Meses())
                    .append("\n");

            prompt.append("Niños 24-36 meses: ")
                    .append(alimento.getCategoriaEtaria().getNinos24a36Meses())
                    .append("\n");

            prompt.append("Actores comunales: ")
                    .append(alimento.getCategoriaEtaria().getActoresComunales())
                    .append("\n");

            prompt.append("Bolsas 1kg: ")
                    .append(alimento.getPresentacion().getBolsas1kg())
                    .append("\n");

            prompt.append("Bolsas 500g: ")
                    .append(alimento.getPresentacion().getBolsas500g())
                    .append("\n");

            prompt.append("Bolsas 250g: ")
                    .append(alimento.getPresentacion().getBolsas250g())
                    .append("\n");
        }

        log.info(prompt.toString());

        return openAIClient.analizarAlimentos(
                prompt.toString()
        );

    }

}