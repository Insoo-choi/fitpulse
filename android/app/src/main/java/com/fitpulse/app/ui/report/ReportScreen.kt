package com.fitpulse.app.ui.report

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.data.model.UserProfile
import com.fitpulse.app.data.model.WorkoutRecord
import com.fitpulse.app.ui.theme.*

@Composable
fun ReportScreen(
    workouts: List<WorkoutRecord>,
    profile: UserProfile,
    onSaveProfile: (height: Float, weight: Float, minInc: Float) -> Unit
) {
    var heightText by remember { mutableStateOf(profile.height.toString()) }
    var weightText by remember { mutableStateOf(profile.bodyWeight.toString()) }
    var minIncText by remember { mutableStateOf(profile.minIncrement.toString()) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("성장 리포트", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
        }

        item {
            // Profile & Settings
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate800),
                shape = RoundedCornerShape(24.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("체성분 및 증량 설정", color = Brand300, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = heightText,
                            onValueChange = { heightText = it },
                            label = { Text("키 (cm)", fontSize = 10.sp) },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = weightText,
                            onValueChange = { weightText = it },
                            label = { Text("몸무게 (kg)", fontSize = 10.sp) },
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = minIncText,
                        onValueChange = { minIncText = it },
                        label = { Text("최소 증량 단위 (kg)", fontSize = 10.sp) },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = {
                            onSaveProfile(
                                heightText.toFloatOrNull() ?: 175f,
                                weightText.toFloatOrNull() ?: 70f,
                                minIncText.toFloatOrNull() ?: 2.5f
                            )
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Brand600),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("설정 저장", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
