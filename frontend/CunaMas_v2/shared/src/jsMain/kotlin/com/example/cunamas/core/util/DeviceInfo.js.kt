package com.example.cunamas.core.util

import com.example.cunamas.core.auth.data.dto.DispositivoDto
import kotlinx.browser.window
import kotlinx.browser.localStorage

actual object DeviceInfoProvider {
    actual fun getDeviceInfo(): DispositivoDto {
        val userAgent = window.navigator.userAgent
        val browserName = when {
            userAgent.contains("Chrome") -> "Chrome"
            userAgent.contains("Firefox") -> "Firefox"
            userAgent.contains("Safari") -> "Safari"
            else -> "Web Browser"
        }

        val storageKey = "device_uuid"
        var uuid = localStorage.getItem(storageKey)
        if (uuid == null) {
            uuid = "WEB-${kotlin.random.Random.nextLong().toString(16)}"
            localStorage.setItem(storageKey, uuid)
        }

        return DispositivoDto(
            nombreDispositivo = browserName,
            uuidDispositivo = uuid
        )
    }
}
