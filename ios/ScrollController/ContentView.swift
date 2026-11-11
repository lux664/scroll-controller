import SwiftUI

struct ContentView: View {
    /// The one setting. Saved between launches.
    @AppStorage("hideReels") private var hideReels = true
    @State private var showingAbout = false

    var body: some View {
        VStack(spacing: 0) {
            // Minimal top bar: app name (tap for About) + the toggle.
            HStack {
                Button("Scroll Controller") { showingAbout = true }
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                Spacer()
                Toggle("Hide Reels", isOn: $hideReels)
                    .font(.subheadline)
                    .fixedSize()
            }
            .padding(.horizontal, 16)
            .frame(height: 44)

            InstagramWebView(hideReels: hideReels)
        }
        .alert("About Scroll Controller", isPresented: $showingAbout) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("A free, open-source way to use Instagram's website without Reels.\n\nNo accounts, ads or tracking. The app only talks to Instagram.\n\nNot affiliated with Instagram or Meta.\n\nMIT License")
        }
    }
}
