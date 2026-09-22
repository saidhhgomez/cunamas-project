plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinAndroid)
}

android {
    namespace = "com.example.cunamas"
    compileSdk = libs.versions.android.compileSdk.get().toInt()

    defaultConfig {
        applicationId = "com.example.cunamas"
        minSdk = libs.versions.android.minSdk.get().toInt()
        targetSdk = libs.versions.android.targetSdk.get().toInt()
        versionCode = 1
        versionName = "1.0"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        compose = true
    }

    // 👈 Reemplaza kotlinOptions por esto para eliminar la advertencia:
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
    }
}

dependencies {
    // 👈 Esta línea vincula todo el código KMP de la carpeta shared con Android
    implementation(project(":shared"))
    implementation(libs.androidx.activity.compose)
    implementation("io.insert-koin:koin-android:4.0.0") // O la versión 3.x/4.x que estés usando en tu proyecto
    implementation("io.insert-koin:koin-androidx-compose:4.0.0")
    implementation(libs.androidx.core.ktx)
}