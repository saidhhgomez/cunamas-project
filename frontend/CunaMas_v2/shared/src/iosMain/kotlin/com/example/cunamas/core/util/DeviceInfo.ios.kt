package com.example.cunamas.core.util

import com.example.cunamas.core.auth.data.dto.DispositivoDto
import platform.UIKit.UIDevice

actual object DeviceInfoProvider {
    actual fun getDeviceInfo(): DispositivoDto {
        return DispositivoDto(
            nombreDispositivo = UIDevice.currentDevice.name,
            uuidDispositivo = UIDevice.currentDevice.identifierForVendor?.UUIDString ?: "IOS-UNKNOWN"
        )
    }
}
