package com.clearring.app.ui.screens

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.clearring.app.data.model.BusinessClaimRequest
import com.clearring.app.viewmodel.ClaimState
import com.clearring.app.viewmodel.LookupViewModel

@Composable
fun BusinessClaimScreen(lookupViewModel: LookupViewModel, onBack: () -> Unit) {
    var businessName by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var businessType by remember { mutableStateOf("") }
    var website by remember { mutableStateOf("") }

    val claimState by lookupViewModel.claimState.collectAsState()

    DisposableEffect(Unit) {
        onDispose { lookupViewModel.resetClaim() }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(modifier = Modifier.fillMaxWidth().padding(16.dp).statusBarsPadding(), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back", tint = Color.White) }
                Text("Claim Business Number", fontWeight = FontWeight.SemiBold, color = Color.White)
            }

            Column(
                modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                when (val s = claimState) {
                    is ClaimState.Success -> {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF14532D).copy(alpha = 0.5f)),
                            shape = MaterialTheme.shapes.extraLarge,
                        ) {
                            Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF22C55E), modifier = Modifier.size(48.dp))
                                Spacer(Modifier.height(12.dp))
                                Text("Claim Submitted!", fontWeight = FontWeight.Bold, color = Color.White)
                                Spacer(Modifier.height(4.dp))
                                Text(
                                    "Our team will verify and activate your badge within 24-48 hours.",
                                    color = Color(0xFF94A3B8),
                                )
                                Spacer(Modifier.height(16.dp))
                                OutlinedButton(onClick = onBack) { Text("Back to Home") }
                            }
                        }
                    }
                    is ClaimState.Error -> {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF7F1D1D).copy(alpha = 0.4f)),
                            shape = MaterialTheme.shapes.large,
                        ) {
                            Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Icon(Icons.Default.ErrorOutline, null, tint = Color(0xFFEF4444))
                                Text(s.message, color = Color(0xFFEF4444), fontSize = androidx.compose.ui.unit.TextUnit.Unspecified)
                            }
                        }
                        ClaimForm(
                            businessName, phoneNumber, businessType, website,
                            onBusinessName = { businessName = it },
                            onPhone = { phoneNumber = it },
                            onType = { businessType = it },
                            onWebsite = { website = it },
                            loading = false,
                            onSubmit = {
                                lookupViewModel.claimBusiness(
                                    BusinessClaimRequest(
                                        phoneNumber = phoneNumber.trim(),
                                        businessName = businessName.trim(),
                                        businessType = businessType.trim().ifBlank { null },
                                        website = website.trim().ifBlank { null },
                                    )
                                )
                            }
                        )
                    }
                    else -> {
                        val isLoading = claimState is ClaimState.Loading
                        if (!isLoading) {
                            Text("Verify your business ownership to get a verified badge.", color = Color(0xFF94A3B8))
                        }
                        ClaimForm(
                            businessName, phoneNumber, businessType, website,
                            onBusinessName = { businessName = it },
                            onPhone = { phoneNumber = it },
                            onType = { businessType = it },
                            onWebsite = { website = it },
                            loading = isLoading,
                            onSubmit = {
                                lookupViewModel.claimBusiness(
                                    BusinessClaimRequest(
                                        phoneNumber = phoneNumber.trim(),
                                        businessName = businessName.trim(),
                                        businessType = businessType.trim().ifBlank { null },
                                        website = website.trim().ifBlank { null },
                                    )
                                )
                            }
                        )
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun ClaimForm(
    businessName: String,
    phoneNumber: String,
    businessType: String,
    website: String,
    onBusinessName: (String) -> Unit,
    onPhone: (String) -> Unit,
    onType: (String) -> Unit,
    onWebsite: (String) -> Unit,
    loading: Boolean,
    onSubmit: () -> Unit,
) {
    BusinessField("Business Name *", businessName, onBusinessName, Icons.Default.Business)
    BusinessField("Phone Number *", phoneNumber, onPhone, Icons.Default.Phone,
        keyboardType = androidx.compose.ui.text.input.KeyboardType.Phone)
    BusinessField("Business Type", businessType, onType, Icons.Default.Category)
    BusinessField("Website URL", website, onWebsite, Icons.Default.Link,
        keyboardType = androidx.compose.ui.text.input.KeyboardType.Uri)

    Button(
        onClick = onSubmit,
        modifier = Modifier.fillMaxWidth().height(52.dp),
        enabled = businessName.isNotBlank() && phoneNumber.isNotBlank() && !loading,
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
    ) {
        if (loading) {
            CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Color.White, strokeWidth = 2.dp)
            Spacer(Modifier.width(8.dp))
            Text("Submitting…", fontWeight = FontWeight.SemiBold)
        } else {
            Icon(Icons.Default.Verified, null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(8.dp))
            Text("Submit for Verification", fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun BusinessField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    leadingIcon: androidx.compose.ui.graphics.vector.ImageVector,
    keyboardType: androidx.compose.ui.text.input.KeyboardType = androidx.compose.ui.text.input.KeyboardType.Text,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label) },
        leadingIcon = { Icon(leadingIcon, null) },
        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = keyboardType),
        singleLine = true,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Color(0xFF3B82F6),
            unfocusedBorderColor = Color(0xFF1E293B),
            focusedContainerColor = Color(0xFF1E293B),
            unfocusedContainerColor = Color(0xFF1E293B),
        )
    )
}
