package com.clearring.app.ui.screens

import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun IncomingCallScreen(onBack: () -> Unit) {
    val context = LocalContext.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp).statusBarsPadding(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back", tint = Color.White) }
                Text("Call Screening Setup", fontWeight = FontWeight.SemiBold, color = Color.White)
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Spacer(Modifier.height(8.dp))

                // Hero
                Box(
                    Modifier.size(80.dp).background(
                        Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF8B5CF6))),
                        CircleShape,
                    ),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Default.PhoneInTalk, null, tint = Color.White, modifier = Modifier.size(40.dp))
                }
                Spacer(Modifier.height(16.dp))
                Text("Enable Automatic Call Screening", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color.White)
                Spacer(Modifier.height(6.dp))
                Text(
                    "When ClearRing is set as your call screening app, it silently checks every incoming call before it rings — no manual lookups needed.",
                    fontSize = 13.sp, color = Color(0xFF94A3B8),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                )

                Spacer(Modifier.height(28.dp))

                // Steps
                SetupStep(
                    number = 1,
                    icon = Icons.Default.Settings,
                    title = "Open Phone App Settings",
                    description = "Tap the button below to go to your device's default app settings.",
                )
                Spacer(Modifier.height(10.dp))
                SetupStep(
                    number = 2,
                    icon = Icons.Default.CallEnd,
                    title = "Find \"Caller ID & Spam\"",
                    description = "Look for Call Screening or Caller ID settings in your Phone app → Settings menu.",
                )
                Spacer(Modifier.height(10.dp))
                SetupStep(
                    number = 3,
                    icon = Icons.Default.Shield,
                    title = "Select ClearRing",
                    description = "Choose ClearRing as the call screening provider. Grant the Call Screening permission when prompted.",
                )

                Spacer(Modifier.height(28.dp))

                // CTA
                Button(
                    onClick = {
                        runCatching {
                            context.startActivity(
                                Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS).apply {
                                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                }
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                    shape = MaterialTheme.shapes.extraLarge,
                ) {
                    Icon(Icons.AutoMirrored.Filled.OpenInNew, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Open Default App Settings", fontWeight = FontWeight.SemiBold)
                }

                Spacer(Modifier.height(12.dp))

                // How it works card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = MaterialTheme.shapes.large,
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("How It Works", fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 14.sp)
                        HowItWorksRow(Icons.Default.Phone, "Call arrives", "ClearRing intercepts before ringing")
                        HowItWorksRow(Icons.Default.Search, "Silent lookup", "Checks our database in < 1 second")
                        HowItWorksRow(Icons.Default.Person, "Known contact?", "Allows through immediately, no check")
                        HowItWorksRow(Icons.Default.Block, "HIGH RISK?", "Blocks silently, logs to recent lookups")
                        HowItWorksRow(Icons.Default.Warning, "CAUTION?", "Rings but shows warning notification")
                    }
                }

                Spacer(Modifier.height(16.dp))

                // Info note
                Row(
                    modifier = Modifier.fillMaxWidth()
                        .background(Color(0xFF0EA5E9).copy(0.08f), MaterialTheme.shapes.large)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Icon(Icons.Default.Info, null, tint = Color(0xFF0EA5E9), modifier = Modifier.size(18.dp))
                    Text(
                        "If your device doesn't support third-party call screening, ClearRing will send a push notification with the caller's risk score instead.",
                        fontSize = 12.sp, color = Color(0xFF64748B),
                    )
                }

                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun SetupStep(number: Int, icon: ImageVector, title: String, description: String) {
    Row(
        modifier = Modifier.fillMaxWidth()
            .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
            .padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Box(
            Modifier.size(32.dp).background(Color(0xFF3B82F6), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text("$number", color = Color.White, fontWeight = FontWeight.Black, fontSize = 14.sp)
        }
        Column(Modifier.weight(1f)) {
            Text(title, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            Spacer(Modifier.height(2.dp))
            Text(description, color = Color(0xFF94A3B8), fontSize = 12.sp)
        }
        Icon(icon, null, tint = Color(0xFF475569), modifier = Modifier.size(20.dp))
    }
}

@Composable
private fun HowItWorksRow(icon: ImageVector, trigger: String, action: String) {
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = Color(0xFF475569), modifier = Modifier.size(16.dp))
        Text(trigger, color = Color(0xFF94A3B8), fontSize = 12.sp, modifier = Modifier.width(100.dp))
        Text("→", color = Color(0xFF334155), fontSize = 12.sp)
        Text(action, color = Color(0xFF64748B), fontSize = 12.sp)
    }
}
