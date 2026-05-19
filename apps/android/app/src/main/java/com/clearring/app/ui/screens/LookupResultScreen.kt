package com.clearring.app.ui.screens

import android.content.Intent
import android.net.Uri
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clearring.app.data.model.LookupResponse
import com.clearring.app.ui.theme.riskColor
import com.clearring.app.viewmodel.LookupState
import com.clearring.app.viewmodel.LookupViewModel

@Composable
fun LookupResultScreen(
    number: String,
    lookupViewModel: LookupViewModel,
    onReport: () -> Unit,
    onBack: () -> Unit,
) {
    val state by lookupViewModel.lookupState.collectAsState()
    val context = LocalContext.current

    fun shareResult(data: LookupResponse) {
        val text = buildString {
            appendLine("ClearRing Lookup Result")
            appendLine("Number: ${data.e164}")
            appendLine("Risk: ${data.riskLevel.replace("_", " ")}")
            appendLine("Spam Score: ${data.spamScore}/100")
            if (data.isVerified) appendLine("✓ Verified Business")
            data.businessProfile?.businessName?.let { appendLine("Business: $it") }
            appendLine("Community Reports: ${data.totalReports}")
        }
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text.trim())
        }
        context.startActivity(Intent.createChooser(intent, "Share lookup result"))
    }

    LaunchedEffect(number) {
        lookupViewModel.lookup(number)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp).statusBarsPadding(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back", tint = Color.White) }
                Spacer(Modifier.width(8.dp))
                Text("Caller Intelligence", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp, modifier = Modifier.weight(1f))
                if (state is LookupState.Success) {
                    IconButton(onClick = { shareResult((state as LookupState.Success).data) }) {
                        Icon(Icons.Default.Share, "Share result", tint = Color(0xFF94A3B8))
                    }
                }
            }

            when (val s = state) {
                is LookupState.Loading -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                            CircularProgressIndicator(color = Color(0xFF3B82F6))
                            Text("Checking number…", color = Color(0xFF64748B), fontSize = 15.sp)
                        }
                    }
                }
                is LookupState.Success -> LookupResultContent(
                    data = s.data,
                    onReport = onReport,
                    onBlock = {
                        lookupViewModel.blockNumber(s.data.e164)
                        onBack()
                    },
                )
                is LookupState.Error -> {
                    Box(Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                            Box(
                                Modifier.size(72.dp).background(Color(0xFFEF4444).copy(0.1f), MaterialTheme.shapes.extraLarge),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(Icons.Default.ErrorOutline, null, tint = Color(0xFFEF4444), modifier = Modifier.size(36.dp))
                            }
                            Text("Lookup failed", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                            Text(s.message, color = Color(0xFF64748B), fontSize = 15.sp)
                            Button(
                                onClick = { lookupViewModel.lookup(number) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                            ) {
                                Icon(Icons.Default.Refresh, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Try Again")
                            }
                        }
                    }
                }
                else -> {}
            }
        }
    }
}

private fun formatPhone(e164: String): String {
    if (e164.startsWith("+91") && e164.length == 13)
        return "+91 ${e164.substring(3, 8)} ${e164.substring(8)}"
    return e164
}

@Composable
private fun LookupResultContent(data: LookupResponse, onReport: () -> Unit, onBlock: () -> Unit) {
    val color = riskColor(data.riskLevel)
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    var scoreExpanded by remember { mutableStateOf(false) }

    val animatedScore by animateFloatAsState(
        targetValue = data.spamScore / 100f,
        animationSpec = tween(durationMillis = 900, easing = EaseOutCubic),
        label = "spam_score",
    )

    // Vibrate on HIGH_RISK
    LaunchedEffect(Unit) {
        if (data.riskLevel == "HIGH_RISK") {
            @Suppress("DEPRECATION")
            val vibrator = context.getSystemService(Vibrator::class.java)
            vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 80, 50, 80), -1))
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 4.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // Known contact badge
        if (data.isKnownContact) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF14532D).copy(alpha = 0.6f)),
                shape = MaterialTheme.shapes.large,
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Icon(Icons.Default.Person, null, tint = Color(0xFF22C55E), modifier = Modifier.size(20.dp))
                    Column {
                        Text("Known Contact", fontWeight = FontWeight.Bold, color = Color(0xFF22C55E), fontSize = 15.sp)
                        data.contactName?.let { Text(it, fontSize = 13.sp, color = Color(0xFF86EFAC)) }
                    }
                    Spacer(Modifier.weight(1f))
                    Surface(color = Color(0xFF22C55E).copy(0.15f), shape = MaterialTheme.shapes.small) {
                        Text("SAFE", color = Color(0xFF22C55E), fontSize = 10.sp, fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                    }
                }
            }
        }

        // Crowdsourced caller name banner
        if (data.callerName != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = MaterialTheme.shapes.large,
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Icon(Icons.Default.RecordVoiceOver, null, tint = Color(0xFF94A3B8), modifier = Modifier.size(18.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Reported as", fontSize = 11.sp, color = Color(0xFF64748B))
                        Text(data.callerName, fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 15.sp)
                    }
                    Surface(color = Color(0xFF334155), shape = MaterialTheme.shapes.small) {
                        Text("Community", color = Color(0xFF94A3B8), fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                    }
                }
            }
        }

        // Warnings
        if (data.warnings.isNotEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFEF4444).copy(0.08f)),
                shape = MaterialTheme.shapes.large,
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    data.warnings.forEach { warning ->
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("⚠", fontSize = 13.sp, color = Color(0xFFEF4444))
                            Text(warning, fontSize = 13.sp, color = Color(0xFFEF4444))
                        }
                    }
                }
            }
        }

        // Trust signals
        if (data.trustSignals.isNotEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF22C55E).copy(0.08f)),
                shape = MaterialTheme.shapes.large,
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    data.trustSignals.forEach { signal ->
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("✓", fontSize = 13.sp, color = Color(0xFF22C55E))
                            Text(signal, fontSize = 13.sp, color = Color(0xFF22C55E))
                        }
                    }
                }
            }
        }

        // Verified business banner
        if (data.isVerified && data.businessProfile != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E3A5F).copy(alpha = 0.7f)),
                shape = MaterialTheme.shapes.large,
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Icon(Icons.Default.Verified, null, tint = Color(0xFF60A5FA), modifier = Modifier.size(20.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Verified Business", fontWeight = FontWeight.Bold, color = Color(0xFF60A5FA), fontSize = 14.sp)
                        Text(data.businessProfile.businessName, fontSize = 13.sp, color = Color(0xFF93C5FD))
                    }
                    Surface(color = Color(0xFF3B82F6).copy(0.15f), shape = MaterialTheme.shapes.small) {
                        Text("TRUSTED", color = Color(0xFF60A5FA), fontSize = 10.sp, fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                    }
                }
            }
        }

        // Main risk card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF162032)),
            shape = MaterialTheme.shapes.extraLarge,
        ) {
            Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier.size(100.dp)
                        .background(color.copy(alpha = 0.14f), shape = MaterialTheme.shapes.extraLarge),
                    contentAlignment = Alignment.Center,
                ) {
                    when {
                        data.isVerified -> Icon(Icons.Default.Verified, "Verified number", tint = Color(0xFF3B82F6), modifier = Modifier.size(52.dp))
                        data.riskLevel == "HIGH_RISK" -> Icon(Icons.Default.GppBad, "High risk", tint = color, modifier = Modifier.size(52.dp))
                        data.riskLevel == "SAFE" -> Icon(Icons.Default.GppGood, "Safe number", tint = color, modifier = Modifier.size(52.dp))
                        else -> Icon(Icons.Default.Shield, "Risk level indicator", tint = color, modifier = Modifier.size(52.dp))
                    }
                }

                Spacer(Modifier.height(16.dp))
                Text(
                    data.riskLevel.replace("_", " "),
                    fontWeight = FontWeight.Black,
                    color = color,
                    fontSize = 28.sp,
                    letterSpacing = (-0.5).sp,
                )
                Spacer(Modifier.height(8.dp))

                // Phone number with copy button
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Text(
                        formatPhone(data.e164),
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFFCBD5E1),
                        fontSize = 17.sp,
                    )
                    IconButton(
                        onClick = { clipboardManager.setText(AnnotatedString(data.e164)) },
                        modifier = Modifier.size(28.dp),
                    ) {
                        Icon(Icons.Default.ContentCopy, "Copy number", tint = Color(0xFF475569), modifier = Modifier.size(14.dp))
                    }
                }

                data.businessProfile?.businessName?.let {
                    Spacer(Modifier.height(2.dp))
                    Text(it, fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 16.sp)
                }

                Spacer(Modifier.height(20.dp))

                // Animated spam score bar
                Column(Modifier.fillMaxWidth().semantics { contentDescription = "Spam score: ${data.spamScore} out of 100" }) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Spam Score", fontSize = 13.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.Medium)
                        Text("${data.spamScore}/100", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = color)
                    }
                    Spacer(Modifier.height(8.dp))
                    Box(
                        modifier = Modifier.fillMaxWidth().height(12.dp)
                            .clip(MaterialTheme.shapes.medium).background(Color(0xFF0F172A)),
                    ) {
                        Box(
                            modifier = Modifier.fillMaxWidth(animatedScore).height(12.dp)
                                .clip(MaterialTheme.shapes.medium)
                                .background(Brush.horizontalGradient(
                                    colors = listOf(Color(0xFF22C55E), Color(0xFFEAB308), Color(0xFFEF4444)),
                                    startX = 0f, endX = Float.POSITIVE_INFINITY,
                                )),
                        )
                    }
                    Spacer(Modifier.height(4.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("SAFE", fontSize = 9.sp, color = Color(0xFF22C55E), fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                        Text("CAUTION", fontSize = 9.sp, color = Color(0xFFEAB308), fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                        Text("HIGH RISK", fontSize = 9.sp, color = Color(0xFFEF4444), fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                    }
                    Spacer(Modifier.height(8.dp))
                    // Score explanation toggle
                    TextButton(
                        onClick = { scoreExpanded = !scoreExpanded },
                        modifier = Modifier.fillMaxWidth(),
                        contentPadding = PaddingValues(0.dp),
                    ) {
                        Text(
                            if (scoreExpanded) "Hide score explanation ▲" else "What does this score mean? ▼",
                            fontSize = 12.sp, color = Color(0xFF64748B),
                        )
                    }
                    AnimatedVisibility(visible = scoreExpanded, enter = expandVertically() + fadeIn(), exit = shrinkVertically() + fadeOut()) {
                        Column(
                            modifier = Modifier.fillMaxWidth()
                                .background(Color(0xFF0F172A), MaterialTheme.shapes.medium)
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Text("Score = weighted sum of community reports", fontSize = 12.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.SemiBold)
                            listOf(
                                "FRAUD / SCAM report" to "25–35 pts",
                                "SPAM report" to "15 pts",
                                "Recent report (<7 days)" to "1.5× multiplier",
                                "Admin verified safe" to "Score → 0",
                                "Admin verified spam" to "Score → 100",
                            ).forEach { (label, value) ->
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("• $label", fontSize = 11.sp, color = Color(0xFF64748B))
                                    Text(value, fontSize = 11.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
            }
        }

        // Details card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF162032)),
            shape = MaterialTheme.shapes.extraLarge,
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text("Details", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 17.sp)
                HRule()
                data.numberType?.let { DetailRow("Number Type", it) }
                DetailRow("Category", data.category?.replace("_", " ") ?: "Unknown")
                DetailRow("Community Reports", if (data.totalReports == 0) "None yet" else "${data.totalReports} report${if (data.totalReports != 1) "s" else ""}")
                if (data.lookupCount > 0) {
                    DetailRow("Times Looked Up", "${data.lookupCount} user${if (data.lookupCount != 1) "s" else ""}")
                }
                data.firstSeenAt?.let {
                    val display = try { it.substring(0, 10) } catch (_: Exception) { it }
                    DetailRow("First Seen", display)
                }
                DetailRow("Verified Business", if (data.isVerified) "✓ Yes" else "No")
                if (data.adminOverrideStatus != null && data.adminOverrideStatus != "NONE") {
                    DetailRow("Admin Override", data.adminOverrideStatus.replace("_", " "))
                }
                if (data.similarNumbersHighRisk > 0) {
                    Row(
                        Modifier.fillMaxWidth()
                            .background(Color(0xFFF97316).copy(0.1f), MaterialTheme.shapes.medium)
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("⚠", fontSize = 14.sp, color = Color(0xFFF97316))
                        Text(
                            "${data.similarNumbersHighRisk} similar number${if (data.similarNumbersHighRisk != 1) "s" else ""} in this series flagged",
                            fontSize = 13.sp, color = Color(0xFFF97316),
                        )
                    }
                }
            }
        }

        // Business profile card
        data.businessProfile?.let { bp ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF162032)),
                shape = MaterialTheme.shapes.extraLarge,
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Business, null, tint = Color(0xFF3B82F6), modifier = Modifier.size(18.dp))
                        Text("Business Info", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 17.sp)
                    }
                    HRule()
                    bp.category?.let { DetailRow("Type", it.replace("_", " ")) }
                    bp.website?.let { DetailRow("Website", it) }
                    bp.city?.let { city ->
                        val location = listOfNotNull(city, bp.state, bp.country).joinToString(", ")
                        if (location.isNotEmpty()) DetailRow("Location", location)
                    }
                    if (bp.callReasons.isNotEmpty()) {
                        Text("Why they call:", fontSize = 12.sp, color = Color(0xFF94A3B8))
                        bp.callReasons.forEach { cr ->
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("•", color = Color(0xFF3B82F6), fontSize = 13.sp)
                                Column {
                                    cr.reasonTitle?.let { Text(it, fontSize = 13.sp, color = Color(0xFFCBD5E1), fontWeight = FontWeight.Medium) }
                                    cr.reasonDescription?.let { Text(it, fontSize = 12.sp, color = Color(0xFF64748B)) }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Action buttons
        if (data.riskLevel == "SAFE" || data.isVerified) {
            Button(
                onClick = {
                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${data.e164}"))
                    context.startActivity(intent)
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF22C55E)),
            ) {
                Icon(Icons.Default.Call, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Call ${data.businessProfile?.businessName ?: formatPhone(data.e164)}", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
        }

        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedButton(
                onClick = onBlock,
                modifier = Modifier.weight(1f).height(48.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFEF4444)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEF4444).copy(0.4f)),
            ) {
                Icon(Icons.Default.Block, null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Block", fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            }
            Button(
                onClick = onReport,
                modifier = Modifier.weight(1f).height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
            ) {
                Icon(Icons.Default.Flag, null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Report", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(Modifier.height(16.dp))
    }
}

@Composable
private fun HRule() {
    Box(Modifier.fillMaxWidth().height(1.dp).background(Color(0xFF1E293B).copy(3f)))
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(label, fontSize = 14.sp, color = Color(0xFF94A3B8))
        Text(value, fontSize = 14.sp, color = Color(0xFFCBD5E1), fontWeight = FontWeight.SemiBold)
    }
}
