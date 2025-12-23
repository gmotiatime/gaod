from playwright.sync_api import sync_playwright

def verify_chat(page):
    # 1. Login
    page.goto("http://localhost:5173/login")

    # Fill login (mock login since it's local auth)
    page.fill('input[type="email"]', 'gmotiaaa@gmail.com')
    page.fill('input[type="password"]', '2099121')
    page.click('button[type="submit"]')

    # Wait for dashboard OR admin
    try:
        page.wait_for_url("**/dashboard", timeout=5000)
    except:
        page.wait_for_url("**/admin")
        page.goto("http://localhost:5173/dashboard")
        page.wait_for_url("**/dashboard")


    # 2. Check for Chat Interface
    page.wait_for_selector('textarea[placeholder="Message Gaod..."]', state='visible')

    # 3. Send a message
    page.fill('textarea[placeholder="Message Gaod..."]', 'Hello Playwright Test')

    # Click Send.
    page.click('button[type="submit"]')

    # 4. Verify Optimistic Update (User message appears)
    # Using contains text because of possible formatting
    # The message bubble contains the text directly
    print("Waiting for user message...")
    page.wait_for_selector('text="Hello Playwright Test"', timeout=10000)
    print("User message found.")

    # 5. Wait a bit for "response" (simulated or real)
    page.wait_for_timeout(3000)

    # 6. Screenshot
    page.screenshot(path="verification/chat_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_chat(page)
            print("Verification successful")
        except Exception as e:
            print(f"Verification failed: {e}")
            # Take screenshot on failure to see state
            try:
                page.screenshot(path="verification/failure.png")
            except:
                pass
        finally:
            browser.close()
