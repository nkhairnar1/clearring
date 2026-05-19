package com.clearring.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clearring.app.data.model.ReportRequest
import com.clearring.app.viewmodel.LookupViewModel
import com.clearring.app.viewmodel.ReportState
import kotlinx.coroutines.delay

val REPORT_TYPES = listOf(
    "SPAM" to "General Spam",
    "FRAUD" to "Fraud / Scam",
    "SCAM" to "Financial Scam",
    "HARASSMENT" to "Harassment",
    "TELEMARKETING" to "Telemarketing",
    "ROBOCALL" to "Robocall",
    "OTP_SCAM" to "OTP Scam",
    "PAYMENT_SCAM" to "Payment Scam",
    "JOB_SCAM" to "Fake Job",
    "FAKE_BANK" to "Fake Bank",
    "SILENT_CALL" to "Silent Call",
    "SAFE" to "Mark as Safe",
)

private val FRAUD_CATEGORIES = setOf("FRAUD", "SCAM", "OTP_SCAM", "PAYMENT_SCAM", "JOB_SCAM", "FAKE_BANK", "HARASSMENT")
private const val MAX_NOTES_LENGTH = 500

@Composable
fun ReportNumberScreen(number: String, lookupViewModel: LookupViewModel, onBack: () -> Unit) {
    val state by lookupViewModel.reportState.collectAsState()
    val lookupResult by lookupViewModel.lookupState.collectAsState()
    val currentPhone = (lookupResult as? com.clearring.app.viewmodel.LookupState.Success)
        ?.data?.takeIf { it.e164 == number }
    var selectedType by remember { mutableStateOf("SPAM") }
    var notes by remember { mutableStateOf("") }
    var moneyRequested by remember { mutableStateOf(false) }
    var otpRequested by remember { mutableStateOf(false) }
    var threatUsed by remember { mutableStateOf(false) }
    var showSuccess by remember { mutableStateOf(false) }
    var showConfirmDialog by remember { mutableStateOf(false) }

    LaunchedEffect(state) {
        if (state is ReportState.Success) {
            showSuccess = true
            delay(1500)
            lookupViewModel.resetReport()
            onBack()
        }
    }

    if (showConfirmDialog) {
        val typeLabel = REPORT_TYPES.find { it.first == selectedType }?.second ?: selectedType
        AlertDialog(
            onDismissRequest = { showConfirmDialog = false },
            title = { Text("Submit report?") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("You're reporting this number as:", color = Color(0xFF94A3B8), fontSize = 13.sp)
                    Text(typeLabel, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    if (notes.isNotBlank()) {
                        Text("Note: \"$notes\"", color = Color(0xFF94A3B8), fontSize = 12.sp)
                    }
                    Text("Your report helps protect the community.", color = Color(0xFF64748B), fontSize = 12.sp)
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    showConfirmDialog = false
                    lookupViewModel.reportNumber(
                        ReportRequest(
                            phoneNumber = number,
                            reportType = selectedType,
                            notes = notes.takeIf { it.isNotBlank() },
                            moneyRequested = moneyRequested.takeIf { it },
                            otpRequested = otpRequested.takeIf { it },
                            threatUsed = threatUsed.takeIf { it },
                        )
                    )
                }) { Text("Submit", color = Color(0xFFEF4444), fontWeight = FontWeight.Bold) }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmDialog = false }) { Text("Cancel") }
            },
            containerColor = Color(0xFF1E293B),
            titleContentColor = Color.White,
            textContentColor = Color(0xFF94A3B8),
        )
    }

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
                Text("Report Number", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp)
            }

            // Success overlay
            AnimatedVisibility(
                visible = showSuccess,
                enter = fadeIn() + slideInVertically(),
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .background(Color(0xFF14532D).copy(0.8f), MaterialTheme.shapes.large)
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Default.CheckCircle, "Success", tint = Color(0xFF22C55E), modifier = Modifier.size(20.dp))
                    Column {
                        Text("Report submitted", fontWeight = FontWeight.Bold, color = Color(0xFF22C55E), fontSize = 16.sp)
                        Text("Thank you for helping keep ClearRing accurate.", color = Color(0xFF86EFAC), fontSize = 13.sp)
                    }
                }
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Spacer(Modifier.height(4.dp))

                // Number display card
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF1E293B), MaterialTheme.shapes.large)
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.weight(1f),
                    ) {
                        Icon(Icons.Default.Phone, null, tint = Color(0xFF475569), modifier = Modifier.size(18.dp))
                        Column {
                            Text(
                                number,
                                fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                                color = Color(0xFFCBD5E1),
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Medium,
                            )
                            currentPhone?.let { pn ->
                                Text(
                                    "${pn.totalReports} community report${if (pn.totalReports != 1) "s" else ""}",
                                    fontSize = 12.sp,
                                    color = Color(0xFF475569),
                                )
                            }
                        }
                    }
                    currentPhone?.let { pn ->
                        val scoreColor = when {
                            pn.spamScore >= 70 -> Color(0xFFEF4444)
                            pn.spamScore >= 40 -> Color(0xFFF97316)
                            else -> Color(0xFF22C55E)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                "${pn.spamScore}",
                                color = scoreColor,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black,
                            )
                            Text("/ 100", color = Color(0xFF475569), fontSize = 10.sp)
                        }
                    }
                }

                // Report type grid
                Text("What kind of call was this?", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 17.sp)
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    REPORT_TYPES.chunked(2).forEach { row ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            row.forEach { (value, label) ->
                                val selected = selectedType == value
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .background(
                                            if (selected) Color(0xFF3B82F6).copy(0.25f) else Color(0xFF1E293B),
                                            MaterialTheme.shapes.medium,
                                        )
                                        .clickable { selectedType = value }
                                        .padding(vertical = 12.dp, horizontal = 8.dp),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                                    ) {
                                        if (selected) {
                                            Icon(Icons.Default.Check, null, tint = Color(0xFF60A5FA), modifier = Modifier.size(12.dp))
                                        }
                                        Text(
                                            label,
                                            fontSize = 13.sp,
                                            color = if (selected) Color(0xFF60A5FA) else Color(0xFF94A3B8),
                                            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Fraud indicators — animated in/out
                AnimatedVisibility(
                    visible = selectedType in FRAUD_CATEGORIES,
                    enter = fadeIn() + expandVertically(),
                    exit = fadeOut() + shrinkVertically(),
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Fraud Indicators", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 17.sp)
                        Text("Select all that apply:", fontSize = 13.sp, color = Color(0xFF64748B))
                        FraudToggle("Money was requested", moneyRequested) { moneyRequested = it }
                        FraudToggle("OTP was requested", otpRequested) { otpRequested = it }
                        FraudToggle("Threats were used", threatUsed) { threatUsed = it }
                    }
                }

                // Notes
                OutlinedTextField(
                    value = notes,
                    onValueChange = { if (it.length <= MAX_NOTES_LENGTH) notes = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Add notes (optional)") },
                    placeholder = { Text("Describe what happened…") },
                    minLines = 3,
                    maxLines = 5,
                    supportingText = {
                        Text(
                            "${notes.length}/$MAX_NOTES_LENGTH",
                            color = if (notes.length > MAX_NOTES_LENGTH - 50) Color(0xFFF97316) else Color(0xFF64748B),
                            fontSize = 11.sp,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = androidx.compose.ui.text.style.TextAlign.End,
                        )
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF3B82F6),
                        unfocusedBorderColor = Color(0xFF1E293B),
                        focusedContainerColor = Color(0xFF1E293B),
                        unfocusedContainerColor = Color(0xFF1E293B),
                    ),
                )

                if (state is ReportState.Error) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFEF4444).copy(0.1f), MaterialTheme.shapes.medium)
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(Icons.Default.ErrorOutline, null, tint = Color(0xFFEF4444), modifier = Modifier.size(16.dp))
                        Text((state as ReportState.Error).message, color = Color(0xFFEF4444), fontSize = 13.sp)
                    }
                }

                Button(
                    onClick = { showConfirmDialog = true },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    enabled = state !is ReportState.Loading && !showSuccess,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                ) {
                    if (state is ReportState.Loading) {
                        CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Default.Flag, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Submit Report", fontWeight = FontWeight.SemiBold)
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun FraudToggle(label: String, value: Boolean, onChanged: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1E293B), MaterialTheme.shapes.medium)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, fontSize = 14.sp, color = Color(0xFFCBD5E1), fontWeight = FontWeight.Medium)
        Switch(value, onChanged, colors = SwitchDefaults.colors(checkedTrackColor = Color(0xFFEF4444)))
    }
}
