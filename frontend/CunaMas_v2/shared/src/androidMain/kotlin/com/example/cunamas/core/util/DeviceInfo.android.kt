package com.example.cunamas.core.util

import android.os.Build
import com.example.cunamas.core.auth.data.dto.DispositivoDto

actual object DeviceInfoProvider {
    actual fun getDeviceInfo(): DispositivoDto {
        val marca = Build.MANUFACTURER.replaceFirstChar { it.uppercase() }
        val modelo = Build.MODEL
        val nombreCompleto = "$marca $modelo" // Ej: "Samsung SM-A546B" o "Xiaomi Redmi Note 12"

        return DispositivoDto(
            nombreDispositivo = nombreCompleto,
            uuidDispositivo = "ANDROID-${Build.ID.take(8)}"
        )
    }
}