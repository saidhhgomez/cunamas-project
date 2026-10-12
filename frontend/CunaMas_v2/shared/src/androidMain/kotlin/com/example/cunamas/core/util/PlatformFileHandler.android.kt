package com.example.cunamas.core.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

actual object PlatformFileHandler : KoinComponent {
    private val context: Context by inject()

    actual fun openPdf(bytes: ByteArray, fileName: String) {
        try {
            val file = File(context.cacheDir, fileName)
            val fos = FileOutputStream(file)
            fos.write(bytes)
            fos.close()

            val uri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/pdf")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
