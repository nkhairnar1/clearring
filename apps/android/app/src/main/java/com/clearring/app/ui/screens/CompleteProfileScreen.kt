package com.clearring.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clearring.app.viewmodel.AuthUiState
import com.clearring.app.viewmodel.AuthViewModel

@Composable
fun CompleteProfileScreen(
    authViewModel: AuthViewModel,
    onComplete: () -> Unit,
) {
    val uiState by authViewModel.uiState.collectAsState()
    var phoneNumber by remember { mutableStateOf("") }

    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.Authenticated) onComplete()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)))),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                modifier = Modifier.size(72.dp)
                    .background(
                        Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF8B5CF6))),
                        MaterialTheme.shapes.extraLarge,
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.Shield, null, tint = Color.White, modifier = Modifier.size(40.dp))
            }

            Spacer(Modifier.height(24.dp))
            Text("One more step", fontSize = 32.sp, fontWeight = FontWeight.Black, color = Color.White)
            Spacer(Modifier.height(6.dp))
            Text("Add your phone number", fontSize = 16.sp, color = Color(0xFF94A3B8))
            Spacer(Modifier.height(40.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = MaterialTheme.shapes.extraLarge,
            ) {
                Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("Your phone number", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(
                        "This lets ClearRing protect your calls and show your identity to other users.",
                        fontSize = 14.sp, color = Color(0xFF64748B),
                    )

                    OutlinedTextField(
                        value = phoneNumber,
                        onValueChange = { phoneNumber = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Phone Number") },
                        placeholder = { Text("+91 XXXXXXXXXX") },
                        leadingIcon = { Icon(Icons.Default.Phone, null) },
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Phone,
                            imeAction = ImeAction.Done,
                        ),
                        keyboardActions = KeyboardActions(onDone = {
                            if (phoneNumber.isNotBlank()) authViewModel.savePhone(phoneNumber.trim())
                        }),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF3B82F6),
                            focusedLabelColor = Color(0xFF3B82F6),
                        ),
                    )

                    Button(
                        onClick = { authViewModel.savePhone(phoneNumber.trim()) },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        enabled = phoneNumber.isNotBlank() && uiState !is AuthUiState.Loading,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                    ) {
                        if (uiState is AuthUiState.Loading) {
                            CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                        } else {
                            Text("Continue", fontWeight = FontWeight.SemiBold)
                        }
                    }

                    TextButton(
                        onClick = { authViewModel.skipPhone() },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Skip for now", color = Color(0xFF475569), fontSize = 13.sp)
                    }

                    if (uiState is AuthUiState.Error) {
                        Row(
                            modifier = Modifier.fillMaxWidth()
                                .background(Color(0xFFEF4444).copy(0.1f), MaterialTheme.shapes.medium)
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text("⚠", fontSize = 14.sp, color = Color(0xFFEF4444))
                            Text(
                                (uiState as AuthUiState.Error).message,
                                color = Color(0xFFEF4444),
                                fontSize = 13.sp,
                            )
                        }
                    }
                }
            }
        }
    }
}
