package com.fitpulse.app

import android.annotation.SuppressLint
import android.app.Activity
import android.os.Bundle
import android.view.KeyEvent
import android.view.WindowManager
import android.webkit.*
import android.widget.Toast

class MainActivity : Activity() {

    private lateinit var webView: WebView
    private var backPressedTime: Long = 0L

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Set status bar & navigation bar dark color
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
        window.statusBarColor = android.graphics.Color.parseColor("#0F172A")
        window.navigationBarColor = android.graphics.Color.parseColor("#0F172A")

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                useWideViewPort = true
                loadWithOverviewMode = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mediaPlaybackRequiresUserGesture = false
            }

            addJavascriptInterface(object {
                @JavascriptInterface
                fun exitApp() {
                    runOnUiThread { finish() }
                }

                @JavascriptInterface
                fun showToast(msg: String) {
                    runOnUiThread { Toast.makeText(this@MainActivity, msg, Toast.LENGTH_SHORT).show() }
                }
            }, "AndroidBridge")

            webChromeClient = object : WebChromeClient() {
                override fun onJsAlert(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
                    Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
                    result?.confirm()
                    return true
                }

                override fun onJsConfirm(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
                    android.app.AlertDialog.Builder(this@MainActivity)
                        .setMessage(message)
                        .setPositiveButton("확인") { _, _ -> result?.confirm() }
                        .setNegativeButton("취소") { _, _ -> result?.cancel() }
                        .setOnCancelListener { result?.cancel() }
                        .show()
                    return true
                }
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    return false
                }
            }

            // Load local offline bundled web app
            loadUrl("file:///android_asset/www/index.html")
        }

        setContentView(webView)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            handleBackAction()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onBackPressed() {
        handleBackAction()
    }

    private fun handleBackAction() {
        if (::webView.isInitialized) {
            webView.evaluateJavascript("(function() { try { return (typeof window.handleAndroidBack === 'function') ? window.handleAndroidBack() : false; } catch(e) { return false; } })()") { result ->
                val cleaned = result?.trim('"', ' ', '\n', '\r')
                val isHandled = cleaned.equals("true", ignoreCase = true)
                if (!isHandled) {
                    runOnUiThread {
                        handleDoubleBackToExit()
                    }
                }
            }
        } else {
            handleDoubleBackToExit()
        }
    }

    private fun handleDoubleBackToExit() {
        val currentTime = System.currentTimeMillis()
        if (currentTime - backPressedTime < 2000) {
            finish()
        } else {
            backPressedTime = currentTime
            Toast.makeText(this, "'뒤로' 버튼을 한 번 더 누르면 종료됩니다.", Toast.LENGTH_SHORT).show()
        }
    }
}
