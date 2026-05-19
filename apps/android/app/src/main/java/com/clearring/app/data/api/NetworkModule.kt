package com.clearring.app.data.api

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.clearring.app.BuildConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

val Context.dataStore by preferencesDataStore(name = "clearring_prefs")
val TOKEN_KEY = stringPreferencesKey("access_token")
val THEME_KEY = stringPreferencesKey("theme")
val SERVER_URL_KEY = stringPreferencesKey("server_url")
val AUTO_SCREEN_KEY = booleanPreferencesKey("auto_screen")
val SCREENING_THRESHOLD_KEY = intPreferencesKey("screening_threshold")

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(@ApplicationContext context: Context): OkHttpClient {
        // Adds Bearer token to every request
        val authInterceptor = Interceptor { chain ->
            val token = runBlocking {
                context.dataStore.data.firstOrNull()?.get(TOKEN_KEY)
            }
            val request = chain.request().newBuilder()
                .apply { if (token != null) addHeader("Authorization", "Bearer $token") }
                .build()
            chain.proceed(request)
        }

        // Rewrites the base host/port/scheme from Settings if the user saved one.
        // Runs on OkHttp's background thread so runBlocking is safe here.
        val dynamicUrlInterceptor = Interceptor { chain ->
            val savedBase = runBlocking {
                context.dataStore.data.firstOrNull()?.get(SERVER_URL_KEY)
            }?.trim()?.takeIf { it.isNotBlank() }

            if (savedBase != null) {
                val newBase = savedBase.toHttpUrlOrNull()
                if (newBase != null) {
                    val original = chain.request()
                    val newUrl = original.url.newBuilder()
                        .scheme(newBase.scheme)
                        .host(newBase.host)
                        .port(newBase.port)
                        .build()
                    return@Interceptor chain.proceed(original.newBuilder().url(newUrl).build())
                }
            }
            chain.proceed(chain.request())
        }

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .addInterceptor(dynamicUrlInterceptor)
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        val baseUrl = BuildConfig.BASE_URL.trimEnd('/') + "/"
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}
