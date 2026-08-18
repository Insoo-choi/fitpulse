package com.fitpulse.app.ui.workout.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.ui.theme.*

@Composable
fun RpeDialog(
    exerciseName: String,
    onScoreSelected: (Int) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Slate900,
        title = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("오늘 이 운동 어땠나요?", color = Color.White, fontWeight = FontWeight.Black, fontSize = 18.sp)
                Text(exerciseName, color = Brand300, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                RpeOptionItem("😎 완벽 통제 (쉬움)", "적극 증량", Emerald600) { onScoreSelected(1) }
                RpeOptionItem("🤔 적당함 (마지막 RIR 1-2)", "표준 증량", Brand600) { onScoreSelected(2) }
                RpeOptionItem("🥵 한계 도달 / 실패", "무게 유지", Rose600) { onScoreSelected(3) }
            }
        },
        confirmButton = {}
    )
}

@Composable
private fun RpeOptionItem(
    title: String,
    badge: String,
    badgeColor: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Slate800)
            .clickable { onClick() }
            .padding(14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Text(
            badge,
            color = Color.White,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier
                .clip(RoundedCornerShape(6.dp))
                .background(badgeColor)
                .padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}

@Composable
fun RoutineDiffDialog(
    diffs: List<String>,
    onConfirm: (updateRoutine: Boolean) -> Unit
) {
    AlertDialog(
        onDismissRequest = { onConfirm(false) },
        containerColor = Slate900,
        title = {
            Text("루틴 변경사항 발견", color = Color.White, fontWeight = FontWeight.Black, fontSize = 18.sp)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    "오늘 수행한 운동 구성이 원래 루틴과 다릅니다. 원래 루틴을 업데이트할까요?",
                    color = Slate400,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                diffs.forEach { diff ->
                    Text(diff, color = Slate300, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(true) },
                colors = ButtonDefaults.buttonColors(containerColor = Brand600)
            ) {
                Text("원래 루틴에 반영", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = { onConfirm(false) }) {
                Text("이번만 기록", color = Slate400)
            }
        }
    )
}
