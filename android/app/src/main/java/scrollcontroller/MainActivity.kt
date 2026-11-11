package scrollcontroller

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.ScriptHandler
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature

class MainActivity : AppCompatActivity() {

    private companion object {
        const val HOME_URL = "https://www.instagram.com/"
        const val PREFS = "settings"
        const val KEY_HIDE_REELS = "hide_reels"
        // The shared script (../shared/reels-blocker.js), packaged as an asset.
        const val SCRIPT_ASSET = "reels-blocker.js"
        val INSTAGRAM_ORIGINS = setOf("https://www.instagram.com", "https://instagram.com")
    }

    private lateinit var webView: WebView
    private lateinit var blockerScript: String
    private var documentStartScript: ScriptHandler? = null
    private var pendingFileCallback: ValueCallback<Array<Uri>>? = null

    private val hideReels: Boolean
        get() = getSharedPreferences(PREFS, MODE_PRIVATE).getBoolean(KEY_HIDE_REELS, true)

    private val supportsDocumentStart: Boolean by lazy {
        WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)
    }

    // Photo/video picker for posts and stories.
    private val fileChooser =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            pendingFileCallback?.onReceiveValue(
                WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
            )
            pendingFileCallback = null
        }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        applyInsets()

        blockerScript = assets.open(SCRIPT_ASSET).bufferedReader().use { it.readText() }
        webView = findViewById(R.id.webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = true
            // Drop the "; wv" marker so Instagram serves its normal mobile site.
            userAgentString = WebSettings.getDefaultUserAgent(this@MainActivity).replace("; wv", "")
        }

        // Keep the login: accept cookies and persist them.
        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        installDocumentStartScript()
        webView.webViewClient = InstagramClient()
        webView.webChromeClient = ChromeClient()

        setUpToolbar()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })

        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(HOME_URL)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush()
    }

    // ---- Toggle -------------------------------------------------------------

    private fun setUpToolbar() {
        val switch = findViewById<SwitchCompat>(R.id.hideReelsSwitch)
        switch.isChecked = hideReels
        switch.setOnCheckedChangeListener { _, checked ->
            getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean(KEY_HIDE_REELS, checked).apply()
            // Future page loads get the new starting state...
            installDocumentStartScript()
            // ...and the current page switches right away, no reload.
            webView.evaluateJavascript(
                "window.__scrollController && window.__scrollController.setEnabled($checked);", null
            )
        }

        findViewById<TextView>(R.id.title).setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle(R.string.about_title)
                .setMessage(R.string.about_text)
                .setPositiveButton(R.string.ok, null)
                .show()
        }
    }

    // ---- Script injection ---------------------------------------------------

    /** The state line first, then the shared script. */
    private fun fullScript(): String = "window.__SC_ENABLED = $hideReels;\n$blockerScript"

    private fun installDocumentStartScript() {
        if (!supportsDocumentStart) return
        documentStartScript?.remove()
        documentStartScript = WebViewCompat.addDocumentStartJavaScript(webView, fullScript(), INSTAGRAM_ORIGINS)
    }

    private fun injectFallback(url: String?) {
        if (supportsDocumentStart || !isInstagram(Uri.parse(url ?: return))) return
        webView.evaluateJavascript(fullScript(), null)
    }

    // ---- Navigation ---------------------------------------------------------

    private fun isInstagram(uri: Uri): Boolean {
        val host = uri.host ?: return false
        return host == "instagram.com" || host.endsWith(".instagram.com")
    }

    private inner class InstagramClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            if (!request.isForMainFrame) return false
            val uri = request.url
            val isWeb = uri.scheme == "https" || uri.scheme == "http"
            if (isWeb && isInstagram(uri)) return false
            // Everything else (other websites, mailto:, etc.) opens outside the app.
            try {
                startActivity(Intent(Intent.ACTION_VIEW, uri))
            } catch (_: ActivityNotFoundException) {
            }
            return true
        }

        override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
            injectFallback(url)
        }

        override fun onPageFinished(view: WebView, url: String?) {
            injectFallback(url)
            CookieManager.getInstance().flush()
        }
    }

    private inner class ChromeClient : WebChromeClient() {
        override fun onShowFileChooser(
            webView: WebView,
            filePathCallback: ValueCallback<Array<Uri>>,
            fileChooserParams: FileChooserParams
        ): Boolean {
            pendingFileCallback?.onReceiveValue(null)
            pendingFileCallback = filePathCallback
            return try {
                fileChooser.launch(fileChooserParams.createIntent())
                true
            } catch (_: ActivityNotFoundException) {
                pendingFileCallback = null
                false
            }
        }
    }

    // ---- Layout -------------------------------------------------------------

    /** Keep content clear of the status bar, navigation bar and keyboard. */
    private fun applyInsets() {
        val root = findViewById<View>(R.id.root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            v.setPadding(bars.left, bars.top, bars.right, maxOf(bars.bottom, ime.bottom))
            WindowInsetsCompat.CONSUMED
        }
    }
}
