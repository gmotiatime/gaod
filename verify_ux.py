from playwright.sync_api import sync_playwright
import os

def verify_chat_ux():
    # Ensure dir exists
    if not os.path.exists("verification"):
        os.makedirs("verification")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile view simulation
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        page = context.new_page()

        # Navigate to dashboard
        page.goto("http://localhost:5173/dashboard")

        # Inject Session immediately
        page.evaluate("""
            localStorage.setItem('brand_ai_session', JSON.stringify({
                id: 'test-user',
                email: 'test@example.com',
                name: 'Test User'
            }));
        """)

        # Reload to pick up session
        page.reload()

        # Wait for dashboard to load (longer timeout)
        try:
            # Check if we are redirected to login
            if "login" in page.url:
                 print("Redirected to login, forcing session again...")
                 page.evaluate("""
                    localStorage.setItem('brand_ai_session', JSON.stringify({
                        id: 'test-user',
                        email: 'test@example.com',
                        name: 'Test User'
                    }));
                """)
                 page.goto("http://localhost:5173/dashboard")

            page.wait_for_selector('text=How can I help you create?', timeout=15000)

            # Screenshot Empty State
            page.screenshot(path="verification/ux_mobile_empty.png")
            print("Captured Empty State")

            # Type a message
            page.fill('textarea[name="chat-input"]', "Hello Gaod!")
            page.click('button[type="submit"]')

            # Wait for user message
            page.wait_for_selector('text=Hello Gaod!', timeout=5000)
            print("Message sent")

            # Wait a bit for potential simulated response
            page.wait_for_timeout(3000)

            # Check for message bubbles
            page.screenshot(path="verification/ux_mobile_chat.png")
            print("Captured Chat State")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/ux_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_chat_ux()
