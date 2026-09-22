package com.example.cunamas.core.util

import com.example.cunamas.core.auth.data.dto.DispositivoDto
import kotlinx.browser.window
import kotlinx.browser.localStorage

actual object DeviceInfoProvider {
    actual fun getDeviceInfo(): DispositivoDto {
        val userAgent = window.navigator.userAgent
        val browserName = "Web (Wasm)"

        val storageKey = "device_uuid_wasm"
        var uuid = localStorage.getItem(storageKey)
        if (uuid == null) {
            // Generación simple de ID para Wasm
            uuid = "WASM-${(window.performance.now() * 1000).toInt()}"
            localStorage.setItem(storageKey, uuid)
        }

        return DispositivoDto(
            nombreDispositivo = browserName,
            uuidDispositivo = uuid
        )
    }
}
