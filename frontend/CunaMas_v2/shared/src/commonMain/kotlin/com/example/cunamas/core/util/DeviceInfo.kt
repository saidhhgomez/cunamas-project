package com.example.cunamas.core.util

import com.example.cunamas.core.auth.data.dto.DispositivoDto


expect object DeviceInfoProvider {
    fun getDeviceInfo(): DispositivoDto
}
