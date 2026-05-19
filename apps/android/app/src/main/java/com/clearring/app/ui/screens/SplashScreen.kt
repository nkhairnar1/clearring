package com.clearring.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clearring.app.viewmodel.AuthUiState
import com.clearring.app.viewmodel.AuthViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SplashScreen(
    authViewModel: AuthViewModel,
    onAuthenticated: () -> Unit,
    onUnauthenticated: () -> Unit,
) {
    val uiState by authViewModel.uiState.collectAsState()

    // Animation states
    val logoScale = remember { Animatable(0.4f) }
    val logoAlpha = remember { Animatable(0f) }
    val titleAlpha = remember { Animatable(0f) }
    val taglineAlpha = remember { Animatable(0f) }

    // Pulsing glow on logo
    val glowScale by rememberInfiniteTransition(label = "glow").animateFloat(
        initialValue = 1f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = EaseInOutSine),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "glow_pulse",
    )

    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            // Logo entrance
            logoScale.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow))
        }
        scope.launch {
            logoAlpha.animateTo(1f, tween(400))
        }
        delay(300)
        titleAlpha.animateTo(1f, tween(500))
        delay(150)
        taglineAlpha.animateTo(1f, tween(500))

        authViewModel.checkAuth()
    }

    LaunchedEffect(uiState) {
        when (uiState) {
            is AuthUiState.Authenticated -> onAuthenticated()
            is AuthUiState.Idle -> onUnauthenticated()
            else -> {}
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            // Logo with glow pulse
            Box(contentAlignment = Alignment.Center) {
                // Glow ring behind logo
                Box(
                    modifier = Modifier
                        .size(110.dp)
                        .scale(glowScale * logoScale.value)
                        .alpha(logoAlpha.value * 0.35f)
                        .background(
                            Brush.radialGradient(listOf(Color(0xFF3B82F6), Color.Transparent)),
                            MaterialTheme.shapes.extraLarge,
                        ),
                )
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .scale(logoScale.value)
                        .alpha(logoAlpha.value)
                        .background(
                            Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF8B5CF6))),
                            shape = MaterialTheme.shapes.extraLarge,
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Default.Shield, contentDescription = null, tint = Color.White, modifier = Modifier.size(56.dp))
                }
            }

            Spacer(Modifier.height(24.dp))

            Text(
                "ClearRing",
                fontSize = 40.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                modifier = Modifier.alpha(titleAlpha.value),
            )

            Spacer(Modifier.height(8.dp))

            Text(
                "Know who's calling before you answer.",
                fontSize = 14.sp,
                color = Color(0xFF94A3B8),
                modifier = Modifier.alpha(taglineAlpha.value),
            )

            Spacer(Modifier.height(48.dp))

            when (uiState) {
                is AuthUiState.Error -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.alpha(taglineAlpha.value),
                    ) {
                        Text(
                            "Could not connect. Check your internet and try again.",
                            color = Color(0xFF94A3B8),
                            fontSize = 13.sp,
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            OutlinedButton(
                                onClick = { authViewModel.checkAuth() },
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF3B82F6)),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3B82F6).copy(0.5f)),
                            ) {
                                Icon(Icons.Default.Refresh, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Retry")
                            }
                            TextButton(onClick = onUnauthenticated) {
                                Text("Continue offline", color = Color(0xFF475569))
                            }
                        }
                    }
                }
                else -> {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp).alpha(taglineAlpha.value),
                        color = Color(0xFF3B82F6),
                        strokeWidth = 2.dp,
                    )
                }
            }
        }
    }
}
