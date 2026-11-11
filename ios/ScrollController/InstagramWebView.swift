import SwiftUI
import WebKit

/// instagram.com in a WKWebView, with the shared reels-blocker.js injected.
struct InstagramWebView: UIViewRepresentable {
    let hideReels: Bool

    private static let homeURL = URL(string: "https://www.instagram.com/")!

    /// A current mobile Safari user agent, so Instagram serves its normal mobile site.
    /// (Safari keeps the "iPhone OS 18_6" part frozen; update "Version/" now and then.)
    private static let userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1"

    /// ../shared/reels-blocker.js, bundled as a resource by project.yml.
    private static let blockerScript: String = {
        guard let url = Bundle.main.url(forResource: "reels-blocker", withExtension: "js"),
              let source = try? String(contentsOf: url, encoding: .utf8) else {
            assertionFailure("reels-blocker.js is missing from the app bundle")
            return ""
        }
        return source
    }()

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()          // keeps cookies, so you stay logged in
        config.allowsInlineMediaPlayback = true
        installScripts(on: config.userContentController, enabled: hideReels)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.customUserAgent = Self.userAgent
        webView.allowsBackForwardNavigationGestures = true
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator

        context.coordinator.appliedState = hideReels
        webView.load(URLRequest(url: Self.homeURL))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard context.coordinator.appliedState != hideReels else { return }
        context.coordinator.appliedState = hideReels
        // Future page loads start in the new state...
        installScripts(on: webView.configuration.userContentController, enabled: hideReels)
        // ...and the current page switches right away, no reload.
        webView.evaluateJavaScript(
            "window.__scrollController && window.__scrollController.setEnabled(\(hideReels));"
        )
    }

    /// The state line first, then the shared script. Both at document start, main frame only.
    private func installScripts(on controller: WKUserContentController, enabled: Bool) {
        controller.removeAllUserScripts()
        controller.addUserScript(WKUserScript(
            source: "window.__SC_ENABLED = \(enabled);",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        ))
        controller.addUserScript(WKUserScript(
            source: Self.blockerScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        ))
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var appliedState: Bool?

        private func isInstagram(_ url: URL) -> Bool {
            guard let scheme = url.scheme, scheme == "https" || scheme == "http",
                  let host = url.host?.lowercased() else { return false }
            return host == "instagram.com" || host.hasSuffix(".instagram.com")
        }

        private func openOutside(_ url: URL) {
            UIApplication.shared.open(url)
        }

        // Links outside instagram.com open in Safari (or the matching app).
        func webView(_ webView: WKWebView,
                     decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else { return decisionHandler(.cancel) }
            let isMainFrame = navigationAction.targetFrame?.isMainFrame ?? true
            if !isMainFrame || isInstagram(url) || url.scheme == "about" || url.scheme == "blob" || url.scheme == "data" {
                return decisionHandler(.allow)
            }
            openOutside(url)
            decisionHandler(.cancel)
        }

        // target="_blank" / window.open: Instagram links stay here, others leave.
        func webView(_ webView: WKWebView,
                     createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction,
                     windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url {
                if isInstagram(url) { webView.load(navigationAction.request) } else { openOutside(url) }
            }
            return nil
        }
    }
}
