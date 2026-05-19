package com.clearring.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.datastore.preferences.core.edit
import com.clearring.app.data.api.THEME_KEY
import com.clearring.app.data.api.dataStore
import com.clearring.app.ui.ClearRingNavGraph
import com.clearring.app.ui.theme.AppTheme
import com.clearring.app.ui.theme.ClearRingTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val scope = rememberCoroutineScope()
            var currentTheme by remember { mutableStateOf(AppTheme.CRYSTAL_GLASS) }

            LaunchedEffect(Unit) {
                val savedName = dataStore.data.firstOrNull()?.get(THEME_KEY)
                if (savedName != null) {
                    currentTheme = try { AppTheme.valueOf(savedName) } catch (_: Exception) { AppTheme.CRYSTAL_GLASS }
                }
            }

            ClearRingTheme(theme = currentTheme) {
                ClearRingNavGraph(
                    currentTheme = currentTheme,
                    onThemeChange = { theme ->
                        currentTheme = theme
                        scope.launch {
                            dataStore.edit { it[THEME_KEY] = theme.name }
                        }
                    }
                )
            }
        }
    }
}
