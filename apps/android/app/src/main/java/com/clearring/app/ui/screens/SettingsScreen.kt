package com.clearring.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.automirrored.filled.PhoneCallback
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import android.content.Intent
import android.content.pm.PackageManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.datastore.preferences.core.edit
import com.clearring.app.data.api.AUTO_SCREEN_KEY
import com.clearring.app.data.api.SCREENING_THRESHOLD_KEY
import com.clearring.app.data.api.SERVER_URL_KEY
import com.clearring.app.data.api.dataStore
import com.clearring.app.ui.theme.AppTheme
import com.clearring.app.viewmodel.AuthViewModel
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(
    currentTheme: AppTheme,
    authViewModel: AuthViewModel,
    onThemeChange: (AppTheme) -> Unit,
    onThemePreview: () -> Unit,
    onBlockedNumbers: () -> Unit,
    onMyReports: () -> Unit,
    onBusinessClaims: () -> Unit,
    onCallScreeningSetup: () -> Unit,
    onLogout: () -> Unit,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current

    var serverUrl by remember { mutableStateOf("") }
    var urlSaved by remember { mutableStateOf(false) }
    var autoScreen by remember { mutableStateOf(true) }
    var screeningThreshold by remember { mutableStateOf(80) }

    LaunchedEffect(Unit) {
        val prefs = context.dataStore.data.firstOrNull()
        serverUrl = prefs?.get(SERVER_URL_KEY) ?: ""
        autoScreen = prefs?.get(AUTO_SCREEN_KEY) ?: true
        screeningThreshold = prefs?.get(SCREENING_THRESHOLD_KEY) ?: 80
    }

    fun saveUrl() {
        focusManager.clearFocus()
        scope.launch {
            context.dataStore.edit { it[SERVER_URL_KEY] = serverUrl.trim() }
            urlSaved = true
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(modifier = Modifier.fillMaxWidth().padding(16.dp).statusBarsPadding(), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back", tint = Color.White) }
                Text("Settings", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 20.sp)
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                SectionHeader("Appearance")
                SettingsItem(Icons.Default.Palette, "Theme", "Current: ${currentTheme.name.replace('_', ' ')}", Color(0xFF8B5CF6), onThemePreview)

                Spacer(Modifier.height(8.dp))
                SectionHeader("Account")
                SettingsItem(Icons.Default.Block, "Blocked Numbers", "Manage blocked numbers", Color(0xFFEF4444), onBlockedNumbers)
                SettingsItem(Icons.Default.Report, "My Reports", "View your submitted reports", Color(0xFFF97316), onMyReports)
                SettingsItem(Icons.Default.Business, "My Business Claims", "Manage claimed numbers", Color(0xFF3B82F6), onBusinessClaims)

                Spacer(Modifier.height(8.dp))
                SectionHeader("Privacy")
                // Auto-screen toggle
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Box(
                        Modifier.size(36.dp).background(Color(0xFF14B8A6).copy(0.15f), MaterialTheme.shapes.medium),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Default.Security, null, tint = Color(0xFF14B8A6), modifier = Modifier.size(18.dp))
                    }
                    Column(Modifier.weight(1f)) {
                        Text("Auto-screen unknown calls", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                        Text("Score and flag calls from unknown numbers", color = Color(0xFF64748B), fontSize = 13.sp)
                    }
                    Switch(
                        checked = autoScreen,
                        onCheckedChange = { enabled ->
                            autoScreen = enabled
                            scope.launch {
                                context.dataStore.edit { it[AUTO_SCREEN_KEY] = enabled }
                            }
                        },
                        colors = SwitchDefaults.colors(checkedTrackColor = Color(0xFF14B8A6)),
                    )
                }

                // Screening sensitivity selector
                if (autoScreen) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Box(
                                Modifier.size(36.dp).background(Color(0xFF6366F1).copy(0.15f), MaterialTheme.shapes.medium),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(Icons.Default.Tune, null, tint = Color(0xFF6366F1), modifier = Modifier.size(18.dp))
                            }
                            Column {
                                Text("Screening Sensitivity", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                                val label = when (screeningThreshold) {
                                    60 -> "Strict — blocks CAUTION+"
                                    80 -> "Balanced — blocks LIKELY_SPAM+"
                                    90 -> "Lenient — blocks HIGH_RISK only"
                                    else -> "Off — nothing blocked"
                                }
                                Text(label, color = Color(0xFF64748B), fontSize = 12.sp)
                            }
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            listOf("Strict" to 60, "Balanced" to 80, "Lenient" to 90, "Off" to 101).forEach { (name, thresh) ->
                                val selected = screeningThreshold == thresh
                                Surface(
                                    modifier = Modifier.weight(1f),
                                    color = if (selected) Color(0xFF6366F1) else Color(0xFF0F172A),
                                    shape = MaterialTheme.shapes.medium,
                                    onClick = {
                                        screeningThreshold = thresh
                                        scope.launch { context.dataStore.edit { it[SCREENING_THRESHOLD_KEY] = thresh } }
                                    },
                                ) {
                                    Text(
                                        name,
                                        modifier = Modifier.padding(vertical = 8.dp).fillMaxWidth(),
                                        color = if (selected) Color.White else Color(0xFF64748B),
                                        fontSize = 12.sp,
                                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                    )
                                }
                            }
                        }
                    }
                }

                SettingsItem(Icons.Default.PrivacyTip, "Privacy Settings", "Data and permissions", Color(0xFF22C55E)) {}
                SettingsItem(Icons.AutoMirrored.Filled.PhoneCallback, "Call Screening Setup", "Configure screening service", Color(0xFF6366F1), onCallScreeningSetup)

                Spacer(Modifier.height(8.dp))
                SectionHeader("Developer / Testing")
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(Modifier.size(36.dp).background(Color(0xFF0EA5E9).copy(0.15f), MaterialTheme.shapes.medium), contentAlignment = Alignment.Center) {
                            Icon(Icons.Default.Cloud, null, tint = Color(0xFF0EA5E9), modifier = Modifier.size(18.dp))
                        }
                        Column {
                            Text("Server URL", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                            Text("Takes effect immediately", color = Color(0xFF64748B), fontSize = 12.sp)
                        }
                    }
                    OutlinedTextField(
                        value = serverUrl,
                        onValueChange = { serverUrl = it; urlSaved = false },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("https://your-api-server.com/api", fontSize = 12.sp) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { saveUrl() }),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF0EA5E9),
                            unfocusedBorderColor = Color(0xFF334155),
                            focusedContainerColor = Color(0xFF0F172A),
                            unfocusedContainerColor = Color(0xFF0F172A),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                        ),
                        shape = MaterialTheme.shapes.medium,
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 13.sp),
                    )
                    Button(
                        onClick = { saveUrl() },
                        modifier = Modifier.fillMaxWidth().height(40.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (urlSaved) Color(0xFF22C55E).copy(0.15f) else Color(0xFF0EA5E9),
                            contentColor = if (urlSaved) Color(0xFF22C55E) else Color.White,
                        ),
                        shape = MaterialTheme.shapes.medium,
                    ) {
                        Icon(
                            if (urlSaved) Icons.Default.Check else Icons.Default.Save,
                            null,
                            modifier = Modifier.size(16.dp),
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(if (urlSaved) "Saved ✓" else "Save", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    }
                }

                Spacer(Modifier.height(8.dp))
                SectionHeader("About")

                // App info card
                val packageInfo = runCatching {
                    context.packageManager.getPackageInfo(context.packageName, 0)
                }.getOrNull()
                val versionName = packageInfo?.versionName ?: "1.0.0"
                @Suppress("DEPRECATION")
                val versionCode = packageInfo?.versionCode ?: 1

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        Modifier.size(48.dp)
                            .background(Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF8B5CF6))), MaterialTheme.shapes.large),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Default.Shield, null, tint = Color.White, modifier = Modifier.size(28.dp))
                    }
                    Column(Modifier.weight(1f)) {
                        Text("ClearRing", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Black)
                        Text("Version $versionName (build $versionCode)", color = Color(0xFF64748B), fontSize = 12.sp)
                        Text("Know who's calling before you answer", color = Color(0xFF475569), fontSize = 11.sp)
                    }
                }

                SettingsItem(Icons.Default.Share, "Share ClearRing", "Invite friends to try the app", Color(0xFF3B82F6)) {
                    val intent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_SUBJECT, "Check out ClearRing")
                        putExtra(Intent.EXTRA_TEXT,
                            "I'm using ClearRing to identify spam and scam calls before I answer. " +
                            "It shows a spam score and community reports for any number. Check it out! 🔔"
                        )
                    }
                    context.startActivity(Intent.createChooser(intent, "Share ClearRing"))
                }
                SettingsItem(Icons.Default.Policy, "Privacy Policy", "", Color(0xFF94A3B8)) {}

                Spacer(Modifier.height(16.dp))
                Button(
                    onClick = { authViewModel.logout(); onLogout() },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444).copy(0.15f), contentColor = Color(0xFFEF4444)),
                    shape = MaterialTheme.shapes.large,
                ) {
                    Icon(Icons.AutoMirrored.Filled.Logout, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Logout", fontWeight = FontWeight.SemiBold)
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        title.uppercase(),
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFF64748B),
        letterSpacing = 1.sp,
        modifier = Modifier.padding(horizontal = 4.dp, vertical = 6.dp),
    )
}

@Composable
private fun SettingsItem(icon: ImageVector, title: String, subtitle: String, iconColor: Color, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth()
            .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(Modifier.size(36.dp).background(iconColor.copy(0.15f), MaterialTheme.shapes.medium), contentAlignment = Alignment.Center) {
            Icon(icon, null, tint = iconColor, modifier = Modifier.size(18.dp))
        }
        Column(Modifier.weight(1f)) {
            Text(title, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            if (subtitle.isNotEmpty()) Text(subtitle, color = Color(0xFF64748B), fontSize = 13.sp)
        }
        Icon(Icons.Default.ChevronRight, null, tint = Color(0xFF475569), modifier = Modifier.size(18.dp))
    }
}
