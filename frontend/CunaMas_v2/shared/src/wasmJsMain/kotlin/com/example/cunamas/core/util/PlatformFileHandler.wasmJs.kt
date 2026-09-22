package com.example.cunamas.core.util

import kotlinx.browser.window
import org.khronos.webgl.Uint8Array
import org.khronos.webgl.get
import org.khronos.webgl.set
import org.w3c.dom.url.URL
import org.w3c.files.Blob
import org.w3c.files.BlobPropertyBag

actual object PlatformFileHandler {
    actual fun openPdf(bytes: ByteArray, fileName: String) {
        val uint8Array = Uint8Array(bytes.size)
        for (i in bytes.indices) {
            uint8Array[i] = bytes[i]
        }

        val blob = Blob(JsArray<JsAny>().apply {
            push(uint8Array)
        }, BlobPropertyBag(type = "application/pdf"))

        val url = URL.createObjectURL(blob)
        window.open(url, "_blank")
    }
}

// Helper for Wasm JsArray push
private fun <T : JsAny> JsArray<T>.push(item: T): Int = js("this.push(item)")
