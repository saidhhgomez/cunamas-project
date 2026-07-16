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

Tu labor consiste en elaborar un informe técnico y objetivo sobre los alimentos recibidos, considerando que serán destinados a niñas y niños menores de 36 meses pertenecientes a poblaciones en situación de pobreza y pobreza extrema.

Analiza la información con un enfoque profesional, similar al de un nutricionista responsable del servicio alimentario de un Centro de Atención Infantil.

Para cada alimento considera únicamente la información nutricional conocida. Si algún dato no puede determinarse con certeza, indícalo sin inventar información.

Para cada alimento analiza:

• Valor nutricional general.
• Principales fortalezas nutricionales.
• Posibles deficiencias nutricionales.
• Recomendaciones para complementar el alimento.
• Recomendaciones de manipulación e inocuidad.

Posteriormente analiza el conjunto completo de alimentos enviados y determina:

• Si existe un equilibrio nutricional adecuado.
• Qué nutrientes importantes faltan.
• Qué alimentos podrían complementar mejor el menú.
• Qué preparaciones pueden elaborarse utilizando principalmente los alimentos enviados.
• Recomendaciones para mejorar el aporte nutricional del menú.

Finaliza obligatoriamente con un RESUMEN EJECUTIVO que incluya:

- Fortalezas principales.
- Aspectos por mejorar.
- Recomendación general.

No hagas preguntas.
No invites a continuar la conversación.
No ofrezcas más ayuda.
No agregues saludos ni despedidas.

Mantén un lenguaje técnico pero fácil de comprender para personal de programas sociales.

Limita la respuesta a aproximadamente 700 palabras.

A continuación se muestran los alimentos recibidos:

""");

        for (IAAlimentoDTO alimento : request.getAlimentos()) {

            prompt.append("\n");

            prompt.append("=================================================\n");

            prompt.append("ALIMENTO: ")
                    .append(alimento.getNombre())
                    .append("\n\n");

            prompt.append("Cantidad de beneficiarios\n");

            prompt.append("- Niños de 6 a 9 meses: ")
                    .append(alimento.getCategoriaEtaria().getNinos6a9Meses())
                    .append("\n");

            prompt.append("- Niños de 10 a 12 meses: ")
                    .append(alimento.getCategoriaEtaria().getNinos10a12Meses())
                    .append("\n");

            prompt.append("- Niños de 13 a 23 meses: ")
                    .append(alimento.getCategoriaEtaria().getNinos13a23Meses())
                    .append("\n");

            prompt.append("- Niños de 24 a 36 meses: ")
                    .append(alimento.getCategoriaEtaria().getNinos24a36Meses())
                    .append("\n");

            prompt.append("- Actores comunales: ")
                    .append(alimento.getCategoriaEtaria().getActoresComunales())
                    .append("\n\n");

            prompt.append("Presentación disponible\n");

            prompt.append("- Bolsas de 1 kg: ")
                    .append(alimento.getPresentacion().getBolsas1kg())
                    .append("\n");

            prompt.append("- Bolsas de 500 g: ")
                    .append(alimento.getPresentacion().getBolsas500g())
                    .append("\n");

            prompt.append("- Bolsas de 250 g: ")
                    .append(alimento.getPresentacion().getBolsas250g())
                    .append("\n");

        }

        log.info("========================================");
        log.info("Prompt construido correctamente.");
        log.info(prompt.toString());
        log.info("========================================");

        String respuesta =
                openAIClient.analizarAlimentos(
                        prompt.toString()
                );

        return new IAAnalisisResponseDTO(

                "Análisis Nutricional",

                respuesta

        );

    }

}