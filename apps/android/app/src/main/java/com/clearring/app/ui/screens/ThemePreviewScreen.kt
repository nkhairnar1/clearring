package com.clearring.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clearring.app.ui.theme.AppTheme

data class ThemeInfo(
    val theme: AppTheme,
    val name: String,
    val desc: String,
    val accentColor: Color,
    val bgGradient: List<Color>,
)

val THEMES = listOf(
    ThemeInfo(AppTheme.CRYSTAL_GLASS, "Crystal Glass", "Glassmorphism with blue/purple gradients", Color(0xFF3B82F6), listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A))),
    ThemeInfo(AppTheme.MIDNIGHT_TRUST, "Midnight Trust", "Navy and electric blue, dark premium", Color(0xFF60A5FA), listOf(Color(0xFF020617), Color(0xFF0C1445), Color(0xFF020617))),
    ThemeInfo(AppTheme.CLEAN_LIGHT, "Clean Light", "White and blue, professional minimal", Color(0xFF2563EB), listOf(Color(0xFFF8FAFC), Color(0xFFEFF6FF), Color(0xFFF8FAFC))),
    ThemeInfo(AppTheme.HIGH_CONTRAST, "High Contrast", "Black/white with yellow accents (A11y)", Color(0xFFFACC15), listOf(Color(0xFF000000), Color(0xFF18181B), Color(0xFF000000))),
    ThemeInfo(AppTheme.TRUE_SIGNAL, "True Signal", "Green/teal, trust-first design", Color(0xFF10B981), listOf(Color(0xFF022C22), Color(0xFF064E3B), Color(0xFF022C22))),
)

@Composable
fun ThemePreviewScreen(currentTheme: AppTheme, onThemeChange: (AppTheme) -> Unit, onBack: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(modifier = Modifier.fillMaxWidth().padding(16.dp).statusBarsPadding(), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back", tint = Color.White) }
                Text("Choose Theme", fontWeight = FontWeight.SemiBold, color = Color.White)
            }

            LazyColumn(
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(THEMES) { info ->
                    val isSelected = currentTheme == info.theme
                    Column(
                        modifier = Modifier.fillMaxWidth()
                            .border(
                                width = if (isSelected) 2.dp else 0.dp,
                                color = info.accentColor.copy(if (isSelected) 1f else 0f),
                                shape = MaterialTheme.shapes.extraLarge,
                            )
                            .background(Color(0xFF1E293B), MaterialTheme.shapes.extraLarge)
                            .clickable { onThemeChange(info.theme) }
                    ) {
                        // Preview
                        Box(
                            modifier = Modifier.fillMaxWidth().height(80.dp)
                                .background(Brush.horizontalGradient(info.bgGradient), MaterialTheme.shapes.extraLarge)
                                .padding(16.dp),
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Box(Modifier.size(28.dp).background(info.accentColor.copy(0.25f), MaterialTheme.shapes.medium), Alignment.Center) {
                                        Icon(Icons.Default.Shield, null, tint = info.accentColor, modifier = Modifier.size(16.dp))
                                    }
                                    Text("ClearRing", fontWeight = FontWeight.Black, color = Color.White, fontSize = 14.sp)
                                }
                                Box(Modifier.size(12.dp).background(info.accentColor, MaterialTheme.shapes.small))
                            }
                        }

                        // Info
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Column {
                                Text(info.name, fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 14.sp)
                                Text(info.desc, color = Color(0xFF64748B), fontSize = 11.sp)
                            }
                            if (isSelected) {
                                Icon(Icons.Default.CheckCircle, null, tint = info.accentColor, modifier = Modifier.size(22.dp))
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(16.dp)) }
            }
        }
    }
}
