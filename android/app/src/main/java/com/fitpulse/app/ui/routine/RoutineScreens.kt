package com.fitpulse.app.ui.routine

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.ui.theme.*

@Composable
fun RoutinePasteDialog(
    onParse: (text: String, name: String?, startNow: Boolean) -> Unit,
    onDismiss: () -> Unit
) {
    var routineName by remember { mutableStateOf("") }
    var pasteText by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Slate900,
        title = {
            Text("루틴 붙여넣기", color = Color.White, fontWeight = FontWeight.Black, fontSize = 18.sp)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    "메모장이나 카톡에 있는 운동 루틴을 붙여넣으세요. AI가 종목, 세트, 무게, 횟수를 자동 인식합니다.",
                    color = Slate400,
                    fontSize = 12.sp
                )

                OutlinedTextField(
                    value = routineName,
                    onValueChange = { routineName = it },
                    label = { Text("루틴 이름 (선택)") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = pasteText,
                    onValueChange = { pasteText = it },
                    label = { Text("루틴 텍스트") },
                    placeholder = { Text("예: 벤치프레스 60kg 8회 3세트\n풀업 10회 3세트") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp)
                )
            }
        },
        confirmButton = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Button(
                    onClick = {
                        if (pasteText.isNotBlank()) {
                            onParse(pasteText, routineName.ifBlank { null }, true)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Brand600)
                ) {
                    Text("이 루틴으로 바로 시작", fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = {
                        if (pasteText.isNotBlank()) {
                            onParse(pasteText, routineName.ifBlank { null }, false)
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("루틴에만 저장", color = Slate300)
                }
            }
        },
        dismissButton = {}
    )
}
